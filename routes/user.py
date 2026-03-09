from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from models.user import User
from models.food_log import FoodLog
from models.custom_food import CustomFood
from utils.validators import validate_nutritional_data, validate_user_profile, sanitize_input

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    """Get detailed user profile with statistics"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user statistics
        total_food_logs = FoodLog.query.filter_by(user_id=user_id).count()
        total_custom_foods = CustomFood.query.filter_by(user_id=user_id).count()
        
        # Calculate BMR and daily calories if profile is complete
        bmr = user.calculate_bmr()
        daily_calories = user.calculate_daily_calories()
        
        profile_data = user.to_dict()
        profile_data.update({
            'statistics': {
                'total_food_logs': total_food_logs,
                'total_custom_foods': total_custom_foods,
                'bmr': bmr,
                'calculated_daily_calories': daily_calories
            },
            'profile_completion': {
                'basic_info': bool(user.name and user.email),
                'physical_info': bool(user.age and user.weight and user.height and user.gender),
                'goals_set': bool(user.goal_type and user.daily_calorie_goal),
                'activity_level_set': bool(user.activity_level)
            }
        })
        
        # Return standardized response format
        return jsonify({
            'data': {
                'user': profile_data,
                'profile': profile_data
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get user profile', 
            'details': str(e)
        }), 500

@user_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    """Update user profile information"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate input data
        validation = validate_user_profile(data)
        if not validation['valid']:
            return jsonify({
                'error': 'Validation failed',
                'details': validation['errors']
            }), 400
        
        # Update allowed fields
        allowed_fields = [
            'name', 'age', 'weight', 'height', 'gender', 
            'activity_level', 'goal_type', 'daily_calorie_goal'
        ]
        
        updated_fields = []
        for field in allowed_fields:
            if field in data and data[field] is not None:
                old_value = getattr(user, field)
                new_value = data[field]
                
                if old_value != new_value:
                    setattr(user, field, new_value)
                    updated_fields.append(field)
        
        # Auto-recalculate daily calories if relevant fields changed
        metabolic_fields = {'weight', 'height', 'age', 'gender', 'activity_level'}
        if any(field in updated_fields for field in metabolic_fields):
            calculated_calories = user.calculate_daily_calories()
            if calculated_calories and 'daily_calorie_goal' not in data:
                user.daily_calorie_goal = calculated_calories
                updated_fields.append('daily_calorie_goal (auto-calculated)')
        
        if updated_fields:
            db.session.commit()
            
            user_data = user.to_dict()
            return jsonify({
                'data': {
                    'message': 'Profile updated successfully',
                    'updated_fields': updated_fields,
                    'user': user_data,
                    'profile': user_data
                }
            }), 200
        else:
            user_data = user.to_dict()
            return jsonify({
                'data': {
                    'message': 'No changes detected',
                    'user': user_data,
                    'profile': user_data
                }
            }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update profile', 
            'details': str(e)
        }), 500

@user_bp.route('/goals', methods=['PUT'])
@jwt_required()
def update_user_goals():
    """Update user goals and preferences"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update goal-related fields
        goal_fields = ['goal_type', 'daily_calorie_goal']
        updated_fields = []
        
        for field in goal_fields:
            if field in data and data[field] is not None:
                old_value = getattr(user, field)
                new_value = data[field]
                
                if field == 'goal_type' and new_value not in ['lose_weight', 'maintain', 'gain_weight']:
                    return jsonify({'error': 'Invalid goal type'}), 400
                
                if field == 'daily_calorie_goal':
                    try:
                        new_value = int(new_value)
                        if new_value < 800 or new_value > 5000:
                            return jsonify({'error': 'Daily calorie goal must be between 800 and 5000'}), 400
                    except (ValueError, TypeError):
                        return jsonify({'error': 'Daily calorie goal must be a valid number'}), 400
                
                if old_value != new_value:
                    setattr(user, field, new_value)
                    updated_fields.append(field)
        
        if updated_fields:
            db.session.commit()
            
            user_data = user.to_dict()
            return jsonify({
                'message': 'Goals updated successfully',
                'updated_fields': updated_fields,
                'user': user_data,
                'profile': user_data
            }), 200
        else:
            user_data = user.to_dict()
            return jsonify({
                'message': 'No changes detected',
                'user': user_data,
                'profile': user_data
            }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to update goals', 
            'details': str(e)
        }), 500

@user_bp.route('/custom-foods', methods=['GET'])
@jwt_required()
def get_user_custom_foods():
    """Get user's custom food items"""
    try:
        user_id = get_current_user_id()
        
        # Get query parameters
        category = sanitize_input(request.args.get('category', ''))
        search = sanitize_input(request.args.get('search', ''))
        sort_by = request.args.get('sort_by', 'usage_count')  # usage_count, name, created_at
        limit = min(int(request.args.get('limit', 50)), 100)
        
        # Build query
        query = CustomFood.query.filter_by(user_id=user_id)
        
        # Apply filters
        if category:
            query = query.filter(CustomFood.category.ilike(f'%{category}%'))
        
        if search:
            query = query.filter(CustomFood.name.ilike(f'%{search}%'))
        
        # Apply sorting
        if sort_by == 'name':
            query = query.order_by(CustomFood.name.asc())
        elif sort_by == 'created_at':
            query = query.order_by(CustomFood.created_at.desc())
        else:  # usage_count
            query = query.order_by(CustomFood.usage_count.desc())
        
        custom_foods = query.limit(limit).all()
        
        return jsonify({
            'custom_foods': [food.to_dict() for food in custom_foods],
            'total_count': len(custom_foods)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get custom foods', 
            'details': str(e)
        }), 500

@user_bp.route('/preferences', methods=['GET'])
@jwt_required()
def get_user_preferences():
    """Get user preferences and settings"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # For now, return basic preferences from user model
        # You can extend this with a separate UserPreferences model
        preferences = {
            'activity_level': user.activity_level,
            'goal_type': user.goal_type,
            'daily_calorie_goal': user.daily_calorie_goal,
            # Add more preferences as needed
            'default_meal_type': 'snack',  # Could be stored in user preferences
            'preferred_units': 'metric',   # Could be stored in user preferences
            'notifications_enabled': True  # Could be stored in user preferences
        }
        
        return jsonify({'preferences': preferences}), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get preferences', 
            'details': str(e)
        }), 500

@user_bp.route('/recommendations', methods=['GET'])
@jwt_required()
def get_recommendations():
    """Get personalized nutrition recommendations based on user profile"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        cal = user.daily_calorie_goal or 2000
        goal = user.goal_type or 'maintain'
        diet = user.diet_type or 'none'

        # Calculate macros based on diet type
        if diet == 'keto':
            protein_g = round(cal * 0.25 / 4)
            carbs_g = round(cal * 0.05 / 4)
            fat_g = round(cal * 0.70 / 9)
        elif diet in ('vegan', 'vegetarian'):
            protein_g = round(cal * 0.20 / 4)
            carbs_g = round(cal * 0.55 / 4)
            fat_g = round(cal * 0.25 / 9)
        elif diet == 'paleo':
            protein_g = round(cal * 0.30 / 4)
            carbs_g = round(cal * 0.30 / 4)
            fat_g = round(cal * 0.40 / 9)
        else:
            protein_g = round(cal * 0.30 / 4)
            carbs_g = round(cal * 0.40 / 4)
            fat_g = round(cal * 0.30 / 9)

        # Projected date to reach goal
        projected_date = None
        if user.target_weight and user.weight:
            diff = abs(user.target_weight - user.weight)
            if goal == 'lose_weight':
                weeks = diff / 0.5
            elif goal == 'gain_weight':
                weeks = diff / 0.3
            else:
                weeks = 0
            if weeks > 0:
                from datetime import timedelta, date
                projected_date = (date.today() + timedelta(weeks=weeks)).isoformat()

        water_ml = round((user.weight or 70) * 33)

        recommendations = {
            'daily_calories': cal,
            'macros': {
                'protein_g': protein_g,
                'carbs_g': carbs_g,
                'fat_g': fat_g,
            },
            'water_ml': water_ml,
            'goal_type': goal,
            'diet_type': diet,
            'current_weight': user.weight,
            'target_weight': user.target_weight,
            'projected_goal_date': projected_date,
            'meal_plan': {
                'breakfast_cal': round(cal * 0.25),
                'lunch_cal': round(cal * 0.35),
                'dinner_cal': round(cal * 0.30),
                'snack_cal': round(cal * 0.10),
            },
        }

        return jsonify({'data': recommendations}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get recommendations', 'details': str(e)}), 500


@user_bp.route('/delete-account', methods=['DELETE'])
@jwt_required()
def delete_user_account():
    """Delete user account and all associated data"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get confirmation from request
        data = request.get_json()
        if not data or not data.get('confirm_deletion'):
            return jsonify({
                'error': 'Account deletion requires confirmation',
                'message': 'Send {"confirm_deletion": true} to confirm'
            }), 400
        
        # Delete user (cascade will handle food_logs and custom_foods)
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Account deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to delete account', 
            'details': str(e)
        }), 500
