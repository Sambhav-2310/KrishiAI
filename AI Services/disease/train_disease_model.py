import os

# Disable oneDNN before TensorFlow is imported.
# This can improve stability on CPU systems that experience
# MKL / memory-object errors.
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import json
import tensorflow as tf

from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint


# ============================================================
# CPU SETTINGS
# ============================================================

tf.config.threading.set_intra_op_parallelism_threads(2)
tf.config.threading.set_inter_op_parallelism_threads(1)


# ============================================================
# CONFIGURATION
# ============================================================

IMAGE_SIZE = (160, 160)

BATCH_SIZE = 4

INITIAL_EPOCHS = 8

FINE_TUNE_EPOCHS = 4

DATASET_DIR = (
    r"C:\KrishiAI-Data\PlantVillage"
    r"\extracted\raw\color"
)

MODEL_DIR = "disease/models"

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "multi_crop_disease_model.keras"
)

CLASS_NAMES_PATH = os.path.join(
    MODEL_DIR,
    "class_names.json"
)

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# ============================================================
# HARDWARE CHECK
# ============================================================

print("\n========================================")
print("HARDWARE CHECK")
print("========================================")

gpus = tf.config.list_physical_devices(
    "GPU"
)

if gpus:

    print("GPU detected:")

    for gpu in gpus:
        print(gpu)

else:

    print("No GPU detected.")
    print("Using CPU.")


# ============================================================
# DATASET CHECK
# ============================================================

print("\n========================================")
print("DATASET CHECK")
print("========================================")

print(
    f"Dataset: {DATASET_DIR}"
)


if not os.path.exists(DATASET_DIR):

    raise FileNotFoundError(
        f"Dataset not found:\n{DATASET_DIR}"
    )


class_folders = sorted(
    [
        folder
        for folder in os.listdir(
            DATASET_DIR
        )
        if os.path.isdir(
            os.path.join(
                DATASET_DIR,
                folder
            )
        )
    ]
)


NUM_CLASSES = len(
    class_folders
)


print(
    f"Number of classes: {NUM_CLASSES}"
)


if NUM_CLASSES != 38:

    raise RuntimeError(
        f"Expected 38 classes, "
        f"but found {NUM_CLASSES}."
    )


# ============================================================
# LOAD DATASET
# ============================================================

print("\n========================================")
print("LOADING DATASET")
print("========================================")


train_ds = tf.keras.utils.image_dataset_from_directory(

    DATASET_DIR,

    validation_split=0.2,

    subset="training",

    seed=123,

    image_size=IMAGE_SIZE,

    batch_size=BATCH_SIZE,

    label_mode="int",

    shuffle=True
)


validation_ds = tf.keras.utils.image_dataset_from_directory(

    DATASET_DIR,

    validation_split=0.2,

    subset="validation",

    seed=123,

    image_size=IMAGE_SIZE,

    batch_size=BATCH_SIZE,

    label_mode="int",

    shuffle=False
)


# ============================================================
# CLASS NAMES
# ============================================================

class_names = train_ds.class_names

NUM_CLASSES = len(
    class_names
)


print("\n========================================")
print("CLASS NAMES")
print("========================================")


for index, class_name in enumerate(
    class_names
):

    print(
        f"{index}: {class_name}"
    )


# Save class names

with open(
    CLASS_NAMES_PATH,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        class_names,
        file,
        indent=4
    )


print(
    f"\nClass names saved to:"
)

print(
    CLASS_NAMES_PATH
)


# ============================================================
# DATASET PERFORMANCE
# ============================================================

train_ds = train_ds.prefetch(
    1
)

validation_ds = validation_ds.prefetch(
    1
)


# ============================================================
# DATA AUGMENTATION
# ============================================================

data_augmentation = tf.keras.Sequential(

    [

        layers.RandomFlip(
            "horizontal"
        ),

        layers.RandomRotation(
            0.05
        ),

        layers.RandomZoom(
            0.05
        )

    ],

    name="data_augmentation"
)


# ============================================================
# LOAD MOBILENETV2
# ============================================================

print("\n========================================")
print("LOADING MOBILENETV2")
print("========================================")


base_model = MobileNetV2(

    input_shape=(

        IMAGE_SIZE[0],

        IMAGE_SIZE[1],

        3

    ),

    include_top=False,

    weights="imagenet"
)


# Freeze pretrained layers

base_model.trainable = False


# ============================================================
# BUILD MODEL
# ============================================================

inputs = layers.Input(

    shape=(

        IMAGE_SIZE[0],

        IMAGE_SIZE[1],

        3

    )

)


x = data_augmentation(
    inputs
)


x = preprocess_input(
    x
)


x = base_model(
    x,
    training=False
)


x = layers.GlobalAveragePooling2D()(
    x
)


x = layers.Dropout(
    0.3
)(
    x
)


outputs = layers.Dense(

    NUM_CLASSES,

    activation="softmax"

)(
    x
)


model = models.Model(

    inputs,

    outputs

)


# ============================================================
# INITIAL COMPILE
# ============================================================

model.compile(

    optimizer=tf.keras.optimizers.Adam(

        learning_rate=0.0003

    ),

    loss="sparse_categorical_crossentropy",

    metrics=[
        "accuracy"
    ]

)


# ============================================================
# MODEL SUMMARY
# ============================================================

print("\n========================================")
print("MODEL")
print("========================================")

model.summary()


# ============================================================
# CALLBACKS
# ============================================================

checkpoint = ModelCheckpoint(

    MODEL_PATH,

    monitor="val_accuracy",

    save_best_only=True,

    verbose=1

)


early_stopping = EarlyStopping(

    monitor="val_accuracy",

    patience=3,

    restore_best_weights=True,

    verbose=1

)


# ============================================================
# INITIAL TRAINING
# ============================================================

print("\n========================================")
print("INITIAL TRAINING")
print("========================================")


history = model.fit(

    train_ds,

    validation_data=validation_ds,

    epochs=INITIAL_EPOCHS,

    callbacks=[

        checkpoint,

        early_stopping

    ]

)


# ============================================================
# FINE-TUNING
# ============================================================

print("\n========================================")
print("FINE-TUNING")
print("========================================")


base_model.trainable = True


# Freeze everything except last 30 layers

for layer in base_model.layers[:-30]:

    layer.trainable = False


# Keep BatchNormalization layers frozen.
# This is important when fine-tuning with a small batch size.

for layer in base_model.layers:

    if isinstance(
        layer,
        layers.BatchNormalization
    ):

        layer.trainable = False


model.compile(

    optimizer=tf.keras.optimizers.Adam(

        learning_rate=0.00001

    ),

    loss="sparse_categorical_crossentropy",

    metrics=[
        "accuracy"
    ]

)


model.fit(

    train_ds,

    validation_data=validation_ds,

    epochs=FINE_TUNE_EPOCHS,

    callbacks=[

        checkpoint,

        early_stopping

    ]

)


# ============================================================
# LOAD BEST MODEL
# ============================================================

print("\n========================================")
print("LOADING BEST MODEL")
print("========================================")


model = tf.keras.models.load_model(
    MODEL_PATH
)


# ============================================================
# FINAL EVALUATION
# ============================================================

print("\n========================================")
print("FINAL EVALUATION")
print("========================================")


loss, accuracy = model.evaluate(
    validation_ds
)


print(
    f"\nValidation Loss: {loss:.4f}"
)

print(
    f"Validation Accuracy: "
    f"{accuracy * 100:.2f}%"
)


# ============================================================
# SAVE
# ============================================================

model.save(
    MODEL_PATH
)


print("\n========================================")
print("TRAINING COMPLETE")
print("========================================")

print(
    f"Model saved at:\n{MODEL_PATH}"
)

print(
    f"\nClasses saved at:\n"
    f"{CLASS_NAMES_PATH}"
)

print(
    f"\nFinal validation accuracy: "
    f"{accuracy * 100:.2f}%"
)