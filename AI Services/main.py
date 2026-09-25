from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel, Field

import os
import uuid

from services.smart_listing import generate_listing
from services.price_prediction import predict_price
from services.disease_prediction import predict_disease


app = FastAPI(
    title="KrishiAI AI Service",
    description="AI services for KrishiAI",
    version="1.0.0"
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "KrishiAI AI Service is running"
    }


# ============================================================
# SMART LISTING REQUEST
# ============================================================

class ListingRequest(BaseModel):

    crop: str = Field(
        min_length=2,
        max_length=50
    )

    quantity: float = Field(
        gt=0
    )

    location: str = Field(
        min_length=2,
        max_length=100
    )

    quality: str = Field(
        min_length=2,
        max_length=30
    )


# ============================================================
# SMART LISTING API
# ============================================================

@app.post("/ai/smart-listing")
def smart_listing(
    data: ListingRequest
):

    result = generate_listing(
        data.crop,
        data.quantity,
        data.location,
        data.quality
    )

    return result


# ============================================================
# PRICE PREDICTION REQUEST
# ============================================================

class PricePredictionRequest(BaseModel):

    district: str = Field(
        min_length=2,
        max_length=100
    )

    market: str = Field(
        min_length=2,
        max_length=100
    )

    commodity: str = Field(
        min_length=2,
        max_length=100
    )

    variety: str = Field(
        min_length=2,
        max_length=100
    )

    grade: str = Field(
        min_length=1,
        max_length=50
    )

    date: str


# ============================================================
# PRICE PREDICTION API
# ============================================================

@app.post("/ai/predict-price")
def price_prediction(
    data: PricePredictionRequest
):

    result = predict_price(
        data.district,
        data.market,
        data.commodity,
        data.variety,
        data.grade,
        data.date
    )

    return result


# ============================================================
# DISEASE PREDICTION API
# ============================================================

@app.post("/ai/predict-disease")
async def disease_prediction(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # CHECK FILE
    # --------------------------------------------------------

    if not file.filename:

        return {
            "success": False,
            "message": "Image file is required"
        }


    # --------------------------------------------------------
    # READ IMAGE
    # --------------------------------------------------------

    image_data = await file.read()


    if not image_data:

        return {
            "success": False,
            "message": "Image file is empty"
        }


    # --------------------------------------------------------
    # CREATE UNIQUE TEMPORARY FILE
    # --------------------------------------------------------

    os.makedirs(
        "disease",
        exist_ok=True
    )

    filename = (
        f"disease/test_"
        f"{uuid.uuid4().hex}.jpg"
    )


    # --------------------------------------------------------
    # SAVE IMAGE
    # --------------------------------------------------------

    with open(
        filename,
        "wb"
    ) as buffer:

        buffer.write(
            image_data
        )


    print("\n========================================")
    print("DISEASE IMAGE RECEIVED")
    print("========================================")

    print(
        f"Original filename: {file.filename}"
    )

    print(
        f"Temporary filename: {filename}"
    )

    print(
        f"Image size: {len(image_data)} bytes"
    )


    # --------------------------------------------------------
    # RUN PREDICTION
    # --------------------------------------------------------

    try:

        result = predict_disease(
            filename
        )

        return result


    finally:

        # ----------------------------------------------------
        # DELETE TEMPORARY IMAGE
        # ----------------------------------------------------

        try:

            os.remove(
                filename
            )

            print(
                f"Temporary image deleted: {filename}"
            )

        except Exception as exception:

            print(
                f"Could not delete temporary image: "
                f"{exception}"
            )