from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from services.gemini_service import search_food_by_name
from utils.error_handlers import success_response, error_response
from utils.constants import *

search_bp = Blueprint('search', __name__)

COMMON_FOOD_SUGGESTIONS = [
    {'name': 'Chicken Breast (grilled, 100g)', 'calories': 165, 'proteins': 31, 'carbs': 0, 'fats': 3.6},
    {'name': 'White Rice (cooked, 1 cup)', 'calories': 206, 'proteins': 4.3, 'carbs': 45, 'fats': 0.4},
    {'name': 'Banana (medium)', 'calories': 105, 'proteins': 1.3, 'carbs': 27, 'fats': 0.4},
    {'name': 'Egg (large, boiled)', 'calories': 78, 'proteins': 6.3, 'carbs': 0.6, 'fats': 5.3},
    {'name': 'Apple (medium)', 'calories': 95, 'proteins': 0.5, 'carbs': 25, 'fats': 0.3},
    {'name': 'Whole Wheat Bread (1 slice)', 'calories': 81, 'proteins': 4, 'carbs': 14, 'fats': 1.1},
    {'name': 'Greek Yogurt (plain, 1 cup)', 'calories': 130, 'proteins': 22, 'carbs': 8, 'fats': 0.7},
    {'name': 'Salmon (baked, 100g)', 'calories': 208, 'proteins': 20, 'carbs': 0, 'fats': 13},
    {'name': 'Oatmeal (cooked, 1 cup)', 'calories': 154, 'proteins': 5.3, 'carbs': 27, 'fats': 2.6},
    {'name': 'Avocado (half)', 'calories': 161, 'proteins': 2, 'carbs': 8.6, 'fats': 15},
    {'name': 'Sweet Potato (baked, medium)', 'calories': 103, 'proteins': 2.3, 'carbs': 24, 'fats': 0.1},
    {'name': 'Almonds (1 oz, 23 nuts)', 'calories': 164, 'proteins': 6, 'carbs': 6, 'fats': 14},
    {'name': 'Milk (whole, 1 cup)', 'calories': 149, 'proteins': 8, 'carbs': 12, 'fats': 8},
    {'name': 'Broccoli (steamed, 1 cup)', 'calories': 55, 'proteins': 3.7, 'carbs': 11, 'fats': 0.6},
    {'name': 'Pasta (cooked, 1 cup)', 'calories': 220, 'proteins': 8, 'carbs': 43, 'fats': 1.3},
    {'name': 'Peanut Butter (2 tbsp)', 'calories': 188, 'proteins': 7, 'carbs': 7, 'fats': 16},
    {'name': 'Orange (medium)', 'calories': 62, 'proteins': 1.2, 'carbs': 15, 'fats': 0.2},
    {'name': 'Turkey Breast (sliced, 100g)', 'calories': 104, 'proteins': 18, 'carbs': 4, 'fats': 1.6},
    {'name': 'Lentils (cooked, 1 cup)', 'calories': 230, 'proteins': 18, 'carbs': 40, 'fats': 0.8},
    {'name': 'Cheese (cheddar, 1 oz)', 'calories': 113, 'proteins': 7, 'carbs': 0.4, 'fats': 9.3},
]


@search_bp.route('/food', methods=['GET'])
@jwt_required()
def search_food():
    """Search for food using Gemini AI"""
    try:
        query = request.args.get('q', '').strip()

        if not query:
            return error_response('Search query is required', status_code=HTTP_BAD_REQUEST)

        if len(query) < 2:
            return error_response('Search query must be at least 2 characters', status_code=HTTP_BAD_REQUEST)

        portion = request.args.get('portion', '')
        result = search_food_by_name(query, portion)

        return success_response('Search results', data={
            'query': query,
            'result': result
        })

    except Exception as e:
        return error_response('Search failed', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@search_bp.route('/suggestions', methods=['GET'])
@jwt_required()
def get_suggestions():
    """Get common food suggestions with calorie information"""
    try:
        return success_response('Food suggestions', data={
            'suggestions': COMMON_FOOD_SUGGESTIONS
        })

    except Exception as e:
        return error_response('Failed to get suggestions', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)
