import json
import os

import numpy as np
import tensorflow as tf
from PIL import Image

# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = "disease/models/multi_crop_disease_model.keras"

CLASS_NAMES_PATH = "disease/models/class_names.json"

DATASET_ROOT = r"C:\KrishiAI-Data\PlantVillage"

IMAGE_ROOT = r"C:\KrishiAI-Data\PlantVillage\extracted"

TEST_SPLIT = os.path.join(
    DATASET_ROOT,
    "splits",
    "color_test.txt"
)

IMAGE_SIZE = (160, 160)


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("Model loaded.")


# ============================================================
# LOAD CLASS NAMES
# ============================================================

with open(
    CLASS_NAMES_PATH,
    "r",
    encoding="utf-8"
) as file:

    class_names = json.load(file)


print(
    f"Number of classes: {len(class_names)}"
)


# ============================================================
# READ OFFICIAL TEST SPLIT
# ============================================================

print("\n========================================")
print("READING OFFICIAL TEST SPLIT")
print("========================================")

with open(
    TEST_SPLIT,
    "r",
    encoding="utf-8"
) as file:

    test_paths = [
        line.strip()
        for line in file
        if line.strip()
    ]


print(
    f"Official test images: {len(test_paths)}"
)


# ============================================================
# FIND IMAGES FOR SELECTED HEALTHY CLASSES
# ============================================================

TARGET_CLASSES = [

    "Apple___healthy",

    "Potato___healthy",

    "Tomato___healthy"

]


selected_images = {}


for relative_path in test_paths:

    normalized_path = relative_path.replace(
        "/",
        os.sep
    )

    full_path = os.path.join(
        IMAGE_ROOT,
        normalized_path
    )

    parent_folder = os.path.basename(
        os.path.dirname(full_path)
    )

    if parent_folder in TARGET_CLASSES:

        if parent_folder not in selected_images:

            selected_images[parent_folder] = full_path


# ============================================================
# PRINT SELECTED IMAGES
# ============================================================

print("\n========================================")
print("SELECTED OFFICIAL TEST IMAGES")
print("========================================")


for class_name in TARGET_CLASSES:

    if class_name in selected_images:

        print(
            f"{class_name}:"
        )

        print(
            selected_images[class_name]
        )

    else:

        print(
            f"{class_name}: NOT FOUND"
        )


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_image(
    image_path,
    expected_class
):

    print("\n========================================")
    print("IMAGE TEST")
    print("========================================")

    print(
        f"Expected: {expected_class}"
    )

    print(
        f"File: {image_path}"
    )


    # --------------------------------------------------------
    # LOAD IMAGE
    # --------------------------------------------------------

    image = Image.open(
        image_path
    ).convert("RGB")


    print(
        f"Original size: {image.size}"
    )


    # --------------------------------------------------------
    # RESIZE
    # --------------------------------------------------------

    image = image.resize(
        IMAGE_SIZE
    )


    # --------------------------------------------------------
    # CONVERT TO NUMPY
    # --------------------------------------------------------

    image_array = np.array(
        image,
        dtype=np.float32
    )


    # --------------------------------------------------------
    # ADD BATCH DIMENSION
    # --------------------------------------------------------

    image_array = np.expand_dims(
        image_array,
        axis=0
    )


    # ========================================================
    # IMPORTANT
    # ========================================================
    #
    # DO NOT CALL:
    #
    # tf.keras.applications.mobilenet_v2.preprocess_input()
    #
    # HERE.
    #
    # The trained model already performs preprocess_input()
    # internally before MobileNetV2.
    #
    # ========================================================


    # --------------------------------------------------------
    # PREDICT
    # --------------------------------------------------------

    predictions = model.predict(
        image_array,
        verbose=0
    )[0]


    # --------------------------------------------------------
    # TOP 5 PREDICTIONS
    # --------------------------------------------------------

    top_indices = np.argsort(
        predictions
    )[-5:][::-1]


    print("\nTop 5 predictions:")


    for rank, index in enumerate(
        top_indices,
        start=1
    ):

        confidence = (
            predictions[index] * 100
        )


        print(
            f"{rank}. "
            f"{class_names[index]} "
            f"-> "
            f"{confidence:.2f}%"
        )


    # --------------------------------------------------------
    # EXPECTED CLASS CONFIDENCE
    # --------------------------------------------------------

    if expected_class in class_names:

        expected_index = class_names.index(
            expected_class
        )

        expected_confidence = (
            predictions[expected_index] * 100
        )


        print(
            f"\nExpected class confidence: "
            f"{expected_confidence:.2f}%"
        )


# ============================================================
# RUN TESTS
# ============================================================

print("\n========================================")
print("RUNNING OFFICIAL TEST IMAGE CHECK")
print("========================================")


for class_name in TARGET_CLASSES:

    if class_name not in selected_images:

        continue


    predict_image(
        selected_images[class_name],
        class_name
    )


print("\n========================================")
print("TEST COMPLETE")
print("========================================")