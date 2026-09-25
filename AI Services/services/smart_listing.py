import json
import ollama


def generate_listing(
    crop: str,
    quantity: float,
    location: str,
    quality: str
):

    prompt = f"""
You are an AI assistant for an agricultural marketplace.

Create a professional marketplace listing using the farmer's information below.

Crop: {crop}
Quantity: {quantity} kg
Location: {location}
Quality: {quality}

Generate:
1. A short and attractive title.
2. A clear and professional description.
3. The appropriate agricultural category.

Important:
- Use only the information provided.
- Do not invent a variety, size, price, contact information,
  farming practices, or other details.
- Keep the description suitable for an agricultural marketplace.
- Return ONLY valid JSON.
- Do not use markdown.

Return exactly this format:

{{
    "title": "listing title",
    "description": "listing description",
    "category": "category"
}}
"""

    try:
        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        result = response["message"]["content"]

        listing = json.loads(result)

        return {
            "success": True,
            "data": listing
        }

    except json.JSONDecodeError:
        return {
            "success": False,
            "message": "AI returned an invalid response"
        }

    except Exception as e:
        return {
            "success": False,
            "message": "AI service is currently unavailable"
        }