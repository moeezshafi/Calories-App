import base64
import json
from config import Config

# Lazy-load Gemini to avoid blocking server startup
GEMINI_API_KEY = Config.GEMINI_API_KEY
GEMINI_AVAILABLE = bool(GEMINI_API_KEY)
GEMINI_MODEL = Config.GEMINI_MODEL

_model = None

def _get_model():
    global _model
    if _model is None and GEMINI_AVAILABLE:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _model = genai.GenerativeModel(GEMINI_MODEL)
    return _model

def analyze_food_image(image_base64, language='en'):
    """
    Analyze food image using Google Gemini Vision API
    Returns nutrition information and food identification
    Args:
        image_base64: Base64 encoded image
        language: 'en' for English or 'ar' for Arabic
    """

    if not GEMINI_AVAILABLE:
        # Mock response for testing
        print("⚠️ Gemini API key not configured - returning mock data")
        return {
            'labels': ['banana', 'apple', 'orange'],
            'food_name': 'Mixed Fruit Bowl',
            'breakdown': [
                {'name': 'banana', 'calories': 105},
                {'name': 'apple', 'calories': 95},
                {'name': 'orange', 'calories': 62}
            ],
            'total_calories': 262,
            'total_protein': 3,
            'total_carbs': 68,
            'total_fats': 1,
            'fiber': 8.0,
            'sugar': 45.0,
            'sodium': 3.0,
            'health_score': 8,
            'health_score_reasons': ['High fiber content', 'Natural sugars from fruit', 'Very low sodium', 'Rich in vitamins'],
            'ingredients': ['banana', 'apple', 'orange'],
            'serving_count': 1,
            'confidence': 0.75
        }
    
    try:
        print("🤖 Analyzing image with Gemini Vision API...")
        
        # Set language-specific instructions
        if language == 'ar':
            lang_instruction = "IMPORTANT: Respond in Arabic. All food names and descriptions must be in Arabic."
            not_food_label = "ليس طعاماً"
        else:
            lang_instruction = "IMPORTANT: Respond in English."
            not_food_label = "not_food"
        
        prompt = f"""{lang_instruction}

First check if this image contains FOOD. If the image does NOT contain food (e.g., it's a person, car, building, landscape, etc.), respond with:
{{
  "labels": ["{not_food_label}"],
  "food_name": "{not_food_label}",
  "breakdown": [],
  "total_calories": 0,
  "total_protein": 0,
  "total_carbs": 0,
  "total_fats": 0,
  "fiber": 0,
  "sugar": 0,
  "sodium": 0,
  "health_score": 0,
  "health_score_reasons": [],
  "ingredients": [],
  "serving_count": 1,
  "confidence": 0.0,
  "is_food": false
}}

If the image DOES contain food, analyze it and identify all food items visible.
For each food item, estimate the calories based on visible portion size.

Also provide:
- "food_name": A descriptive name for the overall dish or meal
- "fiber": Total dietary fiber in grams
- "sugar": Total sugar in grams
- "sodium": Total sodium in milligrams
- "health_score": A score from 1-10 (1-3: unhealthy with high sugar/sodium/low nutrition, 4-6: moderate, 7-10: healthy with high fiber/good protein/low sugar)
- "health_score_reasons": A list of short reasons justifying the health score
- "ingredients": A list of individual ingredients detected
- "serving_count": Number of servings visible (default 1)

Respond in this EXACT JSON format:
{{
  "labels": ["food1", "food2"],
  "food_name": "Descriptive Dish Name",
  "breakdown": [
    {{"name": "food1", "calories": 100}},
    {{"name": "food2", "calories": 150}}
  ],
  "total_calories": 250,
  "total_protein": 10,
  "total_carbs": 30,
  "total_fats": 8,
  "fiber": 4,
  "sugar": 12,
  "sodium": 500,
  "health_score": 7,
  "health_score_reasons": ["Good protein", "Moderate sodium"],
  "ingredients": ["chicken", "rice", "vegetables"],
  "serving_count": 1,
  "confidence": 0.85,
  "is_food": true
}}

Be specific with food names. Estimate realistic portion sizes."""

        # Decode base64 image
        import io
        from PIL import Image
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))
        
        # Generate content with Gemini
        response = _get_model().generate_content([prompt, image])
        result_text = response.text
        
        print(f"✅ Gemini Response received")
        print(f"Response: {result_text[:200]}...")
        
        # Extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
            print(f"✅ Parsed result: {result.get('labels', [])}")
            return result
        
        print("❌ Could not parse JSON from response")
        print("⚠️ Returning mock data due to parsing error")
        return {
            'labels': ['Mixed Food Items'],
            'food_name': 'Mixed Food Items',
            'breakdown': [
                {'name': 'Estimated Food', 'calories': 350}
            ],
            'total_calories': 350,
            'total_protein': 15,
            'total_carbs': 45,
            'total_fats': 12,
            'fiber': 3.0,
            'sugar': 10.0,
            'sodium': 400.0,
            'health_score': 5,
            'health_score_reasons': ['Estimated values', 'Unable to analyze precisely'],
            'ingredients': ['unknown food item'],
            'serving_count': 1,
            'confidence': 0.60
        }
        
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        import traceback
        traceback.print_exc()
        
        # Return mock data instead of None
        print("⚠️ Returning mock data due to exception")
        return {
            'labels': ['Food Item'],
            'food_name': 'Food Item',
            'breakdown': [
                {'name': 'Estimated Meal', 'calories': 400}
            ],
            'total_calories': 400,
            'total_protein': 20,
            'total_carbs': 50,
            'total_fats': 15,
            'fiber': 3.0,
            'sugar': 12.0,
            'sodium': 450.0,
            'health_score': 5,
            'health_score_reasons': ['Estimated values', 'Unable to analyze due to error'],
            'ingredients': ['unknown food item'],
            'serving_count': 1,
            'confidence': 0.50
        }

def get_nutrition_advice(user_data, food_logs):
    """Get personalized nutrition advice based on user profile and food logs"""
    if not GEMINI_AVAILABLE:
        # Return mock insights if Gemini is not available
        total_calories = sum(log['total_calories'] for log in food_logs)
        total_protein = sum(log['proteins'] for log in food_logs)
        total_carbs = sum(log['carbs'] for log in food_logs)
        total_fats = sum(log['fats'] for log in food_logs)
        
        goal = user_data.get('daily_calorie_goal', 2000)
        
        insights = f"""📊 Daily Nutrition Summary:
        
You consumed {int(total_calories)} calories today (Goal: {goal} cal).

🥗 Macronutrient Breakdown:
• Protein: {int(total_protein)}g
• Carbs: {int(total_carbs)}g
• Fats: {int(total_fats)}g

💡 Recommendations:
"""
        if total_calories < goal * 0.8:
            insights += "• You're under your calorie goal. Consider adding a healthy snack.\n"
        elif total_calories > goal * 1.2:
            insights += "• You've exceeded your calorie goal. Try smaller portions tomorrow.\n"
        else:
            insights += "• Great job staying within your calorie goal!\n"
        
        if total_protein < 50:
            insights += "• Increase protein intake with lean meats, eggs, or legumes.\n"
        
        if total_carbs > total_calories * 0.6 / 4:
            insights += "• Consider reducing carbs and adding more vegetables.\n"
        
        insights += "\nKeep tracking your meals for better insights! 🎯"
        return insights
    
    try:
        # Calculate totals
        total_calories = sum(log['total_calories'] for log in food_logs)
        total_protein = sum(log['proteins'] for log in food_logs)
        total_carbs = sum(log['carbs'] for log in food_logs)
        total_fats = sum(log['fats'] for log in food_logs)
        total_fiber = sum(log['fiber'] for log in food_logs)
        
        # Build context for Gemini
        context = f"""User Profile:
- Age: {user_data.get('age')} years
- Weight: {user_data.get('weight')} kg
- Height: {user_data.get('height')} cm
- Gender: {user_data.get('gender')}
- Goal: {user_data.get('goal_type')}
- Activity Level: {user_data.get('activity_level')}
- Daily Calorie Goal: {user_data.get('daily_calorie_goal')} cal

Today's Nutrition:
- Total Calories: {int(total_calories)} cal
- Protein: {int(total_protein)}g
- Carbs: {int(total_carbs)}g
- Fats: {int(total_fats)}g
- Fiber: {int(total_fiber)}g

Meals Consumed:
"""
        for log in food_logs:
            context += f"- {log['meal_type'].title()}: {log['food_name']} ({int(log['total_calories'])} cal)\n"
        
        prompt = """Analyze this nutrition data and provide:
1. Brief assessment of calorie intake vs goal
2. Macronutrient balance evaluation
3. 2-3 specific, actionable recommendations
4. One positive encouragement

Keep response under 150 words, friendly and motivating."""
        
        # Generate content with Gemini
        response = _get_model().generate_content(f"{context}\n\n{prompt}")
        return response.text
        
    except Exception as e:
        print(f"Gemini Error: {e}")
        # Fallback to mock insights
        return get_nutrition_advice(user_data, food_logs) if not GEMINI_AVAILABLE else f"Unable to generate insights: {str(e)}"

def search_food_by_name(query, portion=''):
    """Search for food by name and return nutrition information"""
    if not GEMINI_AVAILABLE:
        # Mock response for testing
        return {
            'food_name': query,
            'calories_per_100g': 200,
            'proteins_per_100g': 10,
            'carbs_per_100g': 30,
            'fats_per_100g': 5,
            'confidence': 0.70
        }
    
    try:
        prompt = f"""Find nutrition information for: {query}
        Portion: {portion if portion else 'standard serving'}
        
        Respond in this EXACT JSON format:
        {{
          "food_name": "{query}",
          "calories_per_100g": 200,
          "proteins_per_100g": 10,
          "carbs_per_100g": 30,
          "fats_per_100g": 5,
          "fiber_per_100g": 3,
          "confidence": 0.85
        }}"""
        
        response = _get_model().generate_content(prompt)
        result_text = response.text
        
        # Extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        
        # Fallback
        return {
            'food_name': query,
            'calories_per_100g': 200,
            'proteins_per_100g': 10,
            'carbs_per_100g': 30,
            'fats_per_100g': 5,
            'confidence': 0.50
        }
        
    except Exception as e:
        print(f"Search food error: {e}")
        return {
            'food_name': query,
            'calories_per_100g': 200,
            'proteins_per_100g': 10,
            'carbs_per_100g': 30,
            'fats_per_100g': 5,
            'confidence': 0.50
        }

def analyze_recipe(recipe_text, servings=1):
    """Analyze recipe and calculate nutrition per serving"""
    if not GEMINI_AVAILABLE:
        # Mock response for testing
        return {
            'recipe_name': 'Recipe Analysis',
            'total_calories': 800,
            'calories_per_serving': 800 // servings,
            'servings': servings,
            'ingredients_analyzed': ['ingredient1', 'ingredient2'],
            'confidence': 0.70
        }
    
    try:
        prompt = f"""Analyze this recipe and calculate nutrition:
        
        Recipe: {recipe_text}
        Servings: {servings}
        
        Respond in this EXACT JSON format:
        {{
          "recipe_name": "Recipe Name",
          "total_calories": 800,
          "total_proteins": 40,
          "total_carbs": 100,
          "total_fats": 20,
          "calories_per_serving": 200,
          "proteins_per_serving": 10,
          "carbs_per_serving": 25,
          "fats_per_serving": 5,
          "servings": {servings},
          "ingredients_analyzed": ["ingredient1", "ingredient2"],
          "confidence": 0.85
        }}"""
        
        response = _get_model().generate_content(prompt)
        result_text = response.text
        
        # Extract JSON from response
        import re
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        
        # Fallback
        return {
            'recipe_name': 'Recipe Analysis',
            'total_calories': 800,
            'calories_per_serving': 800 // servings,
            'servings': servings,
            'confidence': 0.50
        }
        
    except Exception as e:
        print(f"Recipe analysis error: {e}")
        return {
            'error': str(e)
        }
