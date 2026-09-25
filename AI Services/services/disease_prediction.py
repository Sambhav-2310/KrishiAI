import json
import numpy as np
import tensorflow as tf

from PIL import Image


# ============================================================
# CONFIGURATION
# ============================================================

MODEL_PATH = "disease/models/multi_crop_disease_model.keras"

CLASS_NAMES_PATH = "disease/models/class_names.json"

IMAGE_SIZE = (160, 160)


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading multi-crop disease model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

print(
    "Multi-crop disease model loaded successfully."
)


# ============================================================
# LOAD CLASS NAMES
# ============================================================

with open(
    CLASS_NAMES_PATH,
    "r",
    encoding="utf-8"
) as file:

    CLASS_NAMES = json.load(file)


print(
    f"Loaded {len(CLASS_NAMES)} disease classes."
)


# ============================================================
# FORMAT CROP NAME
# ============================================================

def format_crop_name(
    crop_name
):

    crop_name = crop_name.replace(
        "_",
        " "
    )

    crop_name = crop_name.replace(
        ",",
        ", "
    )

    crop_name = crop_name.replace(
        "  ",
        " "
    )

    return crop_name.strip()


# ============================================================
# FORMAT DISEASE NAME
# ============================================================

def format_disease_name(
    disease_name
):

    disease_name = disease_name.replace(
        "_",
        " "
    )

    disease_name = disease_name.replace(
        "  ",
        " "
    )

    return disease_name.strip()


# ============================================================
# PARSE CLASS NAME
# ============================================================

def parse_class_name(
    class_name
):

    if "___" in class_name:

        crop_name, disease_name = (
            class_name.split(
                "___",
                1
            )
        )

    else:

        crop_name = "Unknown"

        disease_name = class_name


    crop_name = format_crop_name(
        crop_name
    )

    disease_name = format_disease_name(
        disease_name
    )


    # --------------------------------------------------------
    # HEALTH STATUS
    # --------------------------------------------------------

    if disease_name.lower() == "healthy":

        health_status = "Healthy"

    else:

        health_status = "Not Healthy"


    return (
        crop_name,
        disease_name,
        health_status
    )


# ============================================================
# PREDICT DISEASE
# ============================================================

def predict_disease(
    image_path
):

    print(
        f"Analyzing image: {image_path}"
    )


    # --------------------------------------------------------
    # LOAD IMAGE
    # --------------------------------------------------------

    image = Image.open(
        image_path
    ).convert("RGB")


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
    # The trained model already contains that preprocessing.
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
    # FIND BEST CLASS
    # --------------------------------------------------------

    predicted_index = int(
        np.argmax(predictions)
    )


    confidence = float(
        predictions[predicted_index] * 100
    )


    # --------------------------------------------------------
    # CLASS NAME
    # --------------------------------------------------------

    class_name = CLASS_NAMES[
        predicted_index
    ]


    # --------------------------------------------------------
    # PARSE RESULT
    # --------------------------------------------------------

    (
        crop,
        disease,
        health_status
    ) = parse_class_name(
        class_name
    )


    # --------------------------------------------------------
    # BUILD RESPONSE
    # --------------------------------------------------------

    result = {

        "success": True,

        "crop": crop,

        "disease": disease,

        "health_status": health_status,

        "confidence": round(
            confidence,
            2
        )

    }


    # --------------------------------------------------------
    # LOG RESULT
    # --------------------------------------------------------

    print(
        "Prediction:"
    )

    print(
        json.dumps(
            result,
            indent=4
        )
    )


    return result