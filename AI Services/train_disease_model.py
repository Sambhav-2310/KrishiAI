import os

# Must be set BEFORE TensorFlow is imported
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import json
import tensorflow as tf

from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint


# ============================================================
# CPU CONFIGURATION
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


# PlantVillage image directory
DATASET_ROOT = (
    r"C:\KrishiAI-Data\PlantVillage"
)

IMAGE_ROOT = os.path.join(
    DATASET_ROOT,
    "extracted"
)


# Official split files
TRAIN_SPLIT = os.path.join(
    DATASET_ROOT,
    "splits",
    "color_train.txt"
)

TEST_SPLIT = os.path.join(
    DATASET_ROOT,
    "splits",
    "color_test.txt"
)


# Model files
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

        print(
            gpu
        )

else:

    print(
        "No GPU detected."
    )

    print(
        "Using CPU."
    )


# ============================================================
# PATH CHECK
# ============================================================

print("\n========================================")
print("PATH CHECK")
print("========================================")

print(
    f"Dataset root:\n{DATASET_ROOT}"
)

print(
    f"Image root:\n{IMAGE_ROOT}"
)

print(
    f"Training split:\n{TRAIN_SPLIT}"
)

print(
    f"Testing split:\n{TEST_SPLIT}"
)


if not os.path.exists(
    IMAGE_ROOT
):

    raise FileNotFoundError(
        f"Image directory not found:\n{IMAGE_ROOT}"
    )


if not os.path.exists(
    TRAIN_SPLIT
):

    raise FileNotFoundError(
        f"Training split not found:\n{TRAIN_SPLIT}"
    )


if not os.path.exists(
    TEST_SPLIT
):

    raise FileNotFoundError(
        f"Test split not found:\n{TEST_SPLIT}"
    )


print(
    "\nAll required paths found."
)


# ============================================================
# READ SPLIT FILE
# ============================================================

def read_split_file(
    split_path
):

    with open(
        split_path,
        "r",
        encoding="utf-8"
    ) as file:

        lines = [

            line.strip()

            for line in file

            if line.strip()

        ]

    return lines


# ============================================================
# LOAD TRAIN / TEST PATHS
# ============================================================

print("\n========================================")
print("READING OFFICIAL SPLITS")
print("========================================")


train_relative_paths = read_split_file(
    TRAIN_SPLIT
)

test_relative_paths = read_split_file(
    TEST_SPLIT
)


print(
    f"Training entries: "
    f"{len(train_relative_paths)}"
)

print(
    f"Testing entries: "
    f"{len(test_relative_paths)}"
)


# ============================================================
# CONVERT RELATIVE PATHS TO ABSOLUTE PATHS
# ============================================================

def make_absolute_paths(
    relative_paths
):

    absolute_paths = []

    missing_files = []

    for relative_path in relative_paths:

        # Split files contain paths such as:
        #
        # raw/color/Apple___healthy/image.JPG
        #
        # IMAGE_ROOT is:
        #
        # extracted
        #
        # Therefore:
        #
        # extracted + raw/color/...
        #
        # gives the actual image path.

        relative_path = relative_path.replace(
            "/",
            os.sep
        )

        image_path = os.path.join(
            IMAGE_ROOT,
            relative_path
        )

        if os.path.exists(
            image_path
        ):

            absolute_paths.append(
                image_path
            )

        else:

            missing_files.append(
                image_path
            )


    return (
        absolute_paths,
        missing_files
    )


train_paths, train_missing = make_absolute_paths(
    train_relative_paths
)

test_paths, test_missing = make_absolute_paths(
    test_relative_paths
)


print(
    f"\nTraining images found: "
    f"{len(train_paths)}"
)

print(
    f"Training images missing: "
    f"{len(train_missing)}"
)

print(
    f"Testing images found: "
    f"{len(test_paths)}"
)

print(
    f"Testing images missing: "
    f"{len(test_missing)}"
)


# ============================================================
# CHECK MISSING FILES
# ============================================================

if train_missing:

    print(
        "\nWARNING: Some training files are missing."
    )

    for path in train_missing[:10]:

        print(
            path
        )


if test_missing:

    print(
        "\nWARNING: Some test files are missing."
    )

    for path in test_missing[:10]:

        print(
            path
        )


if len(train_paths) == 0:

    raise RuntimeError(
        "No training images were found."
    )


if len(test_paths) == 0:

    raise RuntimeError(
        "No test images were found."
    )


# ============================================================
# EXTRACT CLASS NAMES FROM PATHS
# ============================================================

def get_class_name(
    image_path
):

    # Example:
    #
    # ...\raw\color\Apple___healthy\image.JPG
    #
    # The parent directory is the class.

    return os.path.basename(
        os.path.dirname(
            image_path
        )
    )


# Get classes from both splits

all_class_names = sorted(
    set(
        [
            get_class_name(path)

            for path in train_paths
        ]

        +

        [
            get_class_name(path)

            for path in test_paths
        ]
    )
)


NUM_CLASSES = len(
    all_class_names
)


print("\n========================================")
print("CLASS INFORMATION")
print("========================================")


print(
    f"Number of classes: "
    f"{NUM_CLASSES}"
)


if NUM_CLASSES != 38:

    raise RuntimeError(
        f"Expected 38 classes, "
        f"but found {NUM_CLASSES}."
    )


for index, class_name in enumerate(
    all_class_names
):

    print(
        f"{index}: {class_name}"
    )


# ============================================================
# CLASS → INTEGER MAPPING
# ============================================================

class_to_index = {

    class_name: index

    for index, class_name in enumerate(
        all_class_names
    )

}


# ============================================================
# CREATE LABELS
# ============================================================

train_labels = [

    class_to_index[
        get_class_name(path)
    ]

    for path in train_paths

]


test_labels = [

    class_to_index[
        get_class_name(path)
    ]

    for path in test_paths

]


# ============================================================
# CREATE TENSORFLOW DATASET
# ============================================================

print("\n========================================")
print("CREATING TENSORFLOW DATASETS")
print("========================================")


def load_image(
    image_path,
    label
):

    image = tf.io.read_file(
        image_path
    )

    image = tf.image.decode_image(
        image,
        channels=3,
        expand_animations=False
    )

    image.set_shape(
        [None, None, 3]
    )

    image = tf.image.resize(
        image,
        IMAGE_SIZE
    )

    image = tf.cast(
        image,
        tf.float32
    )

    return (
        image,
        label
    )


# ------------------------------------------------------------
# TRAIN DATASET
# ------------------------------------------------------------

train_ds = tf.data.Dataset.from_tensor_slices(
    (
        train_paths,
        train_labels
    )
)


train_ds = train_ds.shuffle(
    buffer_size=min(
        len(train_paths),
        10000
    ),
    seed=123
)


train_ds = train_ds.map(
    load_image,
    num_parallel_calls=1
)


train_ds = train_ds.batch(
    BATCH_SIZE
)


train_ds = train_ds.prefetch(
    1
)


# ------------------------------------------------------------
# TEST DATASET
# ------------------------------------------------------------

test_ds = tf.data.Dataset.from_tensor_slices(
    (
        test_paths,
        test_labels
    )
)


test_ds = test_ds.map(
    load_image,
    num_parallel_calls=1
)


test_ds = test_ds.batch(
    BATCH_SIZE
)


test_ds = test_ds.prefetch(
    1
)


print(
    "\nTensorFlow datasets created."
)


# ============================================================
# SAVE CLASS NAMES
# ============================================================

with open(
    CLASS_NAMES_PATH,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        all_class_names,
        file,
        indent=4
    )


print(
    f"\nClass names saved to:\n"
    f"{CLASS_NAMES_PATH}"
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
print("MODEL SUMMARY")
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


model.fit(

    train_ds,

    validation_data=test_ds,

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


# Freeze all but final 30 layers

for layer in base_model.layers[:-30]:

    layer.trainable = False


# Keep BatchNormalization frozen

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

    validation_data=test_ds,

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
# FINAL TEST EVALUATION
# ============================================================

print("\n========================================")
print("FINAL TEST EVALUATION")
print("========================================")


loss, accuracy = model.evaluate(
    test_ds
)


print(
    f"\nTest Loss: "
    f"{loss:.4f}"
)


print(
    f"Test Accuracy: "
    f"{accuracy * 100:.2f}%"
)


# ============================================================
# SAVE FINAL MODEL
# ============================================================

model.save(
    MODEL_PATH
)


print("\n========================================")
print("TRAINING COMPLETE")
print("========================================")


print(
    f"Model:\n{MODEL_PATH}"
)


print(
    f"\nClass names:\n{CLASS_NAMES_PATH}"
)


print(
    f"\nNumber of classes: "
    f"{NUM_CLASSES}"
)


print(
    f"\nFinal test accuracy: "
    f"{accuracy * 100:.2f}%"
)


print("\n========================================")
print("MULTI-CROP MODEL READY")
print("========================================")