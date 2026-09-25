import os
import pandas as pd
from catboost import CatBoostRegressor


MODEL_PATH = "models/price_model.cbm"


# Load trained model
model = CatBoostRegressor()
model.load_model(MODEL_PATH)


def predict_price(
    district: str,
    market: str,
    commodity: str,
    variety: str,
    grade: str,
    date: str
):

    # Check date
    try:
        date_value = pd.to_datetime(date)
    except Exception:
        return {
            "success": False,
            "message": "Invalid date. Please use YYYY-MM-DD format."
        }

    # Create date features
    year = date_value.year
    month = date_value.month
    day = date_value.day
    day_of_week = date_value.dayofweek

    # Create input data
    input_data = pd.DataFrame([{
        "District Name": district,
        "Market Name": market,
        "Commodity": commodity,
        "Variety": variety,
        "Grade": grade,
        "Year": year,
        "Month": month,
        "Day": day,
        "DayOfWeek": day_of_week
    }])

    # Predict price
    prediction = model.predict(input_data)[0]

    # Convert price
    price_per_quintal = round(float(prediction), 2)
    price_per_kg = round(price_per_quintal / 100, 2)

    return {
        "success": True,
        "commodity": commodity,
        "market": market,
        "predicted_price_per_quintal": price_per_quintal,
        "predicted_price_per_kg": price_per_kg
    }