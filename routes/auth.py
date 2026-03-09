from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from database import db
from models.user import User
from models.refresh_token import RefreshToken
from utils.validators import validate_email, validate_password
from utils.error_handlers import error_response, success_response
from utils.constants import *

auth_bp = Blueprint('auth', __name__)

# Get limiter from app
def get_limiter():
    return current_app.extensions.get('limiter')

@auth_bp.route('/test', methods=['GET'])
def test():
    """Simple test endpoint"""
    print("\n=== TEST ENDPOINT HIT ===")
    return jsonify({'message': 'Backend is reachable!', 'timestamp': str(datetime.now())}), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not all(k in data for k in ['email', 'password', 'name']):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Validate password strength
        password_validation = validate_password(data['password'])
        if not password_validation['valid']:
            return jsonify({'error': password_validation['message']}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        user = User(
            email=data['email'].lower().strip(),
            name=data['name'].strip(),
            age=data.get('age'),
            weight=data.get('weight'),
            height=data.get('height'),
            gender=data.get('gender'),
            activity_level=data.get('activity_level', 'sedentary'),
            goal_type=data.get('goal_type', 'maintain')
        )
        user.set_password(data['password'])
        
        # Calculate daily calorie goal if profile info provided
        if user.weight and user.height and user.age and user.gender:
            user.daily_calorie_goal = user.calculate_daily_calories()
        
        db.session.add(user)
        db.session.commit()
        
        # Create access token (convert user.id to string for JWT)
        access_token = create_access_token(identity=str(user.id))
        
        # Create refresh token
        refresh_token = RefreshToken(
            user_id=user.id,
            device_info=request.headers.get('User-Agent'),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(refresh_token)
        db.session.commit()
        
        return success_response(
            SUCCESS_REGISTRATION,
            {
                'access_token': access_token,
                'refresh_token': refresh_token.token,
                'user': user.to_dict()
            },
            HTTP_CREATED
        )
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return access token"""
    print("\n" + "="*50)
    print("LOGIN REQUEST RECEIVED")
    print("="*50)
    
    try:
        data = request.get_json()
        print(f"Request data: {data}")
        print(f"Request headers: {dict(request.headers)}")
        
        if not all(k in data for k in ['email', 'password']):
            print("ERROR: Missing email or password")
            return jsonify({'error': 'Missing email or password'}), 400
        
        # Find user by email - handle potential session issues
        try:
            user = User.query.filter_by(email=data['email'].lower().strip()).first()
        except Exception as query_error:
            print(f"Query error: {str(query_error)}")
            # If there's a session issue, rollback and retry
            db.session.rollback()
            user = User.query.filter_by(email=data['email'].lower().strip()).first()
        
        print(f"User found: {user is not None}")
        
        if not user:
            print("ERROR: User not found")
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.check_password(data['password']):
            print("ERROR: Invalid password")
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create access token (convert user.id to string for JWT)
        access_token = create_access_token(identity=str(user.id))
        
        # Create refresh token
        refresh_token = RefreshToken(
            user_id=user.id,
            device_info=request.headers.get('User-Agent'),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent')
        )
        db.session.add(refresh_token)
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        print(f"Login successful for user: {user.email}")
        
        return success_response(
            SUCCESS_LOGIN,
            {
                'access_token': access_token,
                'refresh_token': refresh_token.token,
                'user': user.to_dict()
            }
        )
        
    except Exception as e:
        print(f"EXCEPTION: {str(e)}")
        import traceback
        traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/complete-onboarding', methods=['POST'])
@jwt_required()
def complete_onboarding():
    """Save onboarding profile data and calculate daily calorie plan"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return error_response(ERROR_USER_NOT_FOUND, status_code=HTTP_NOT_FOUND)

        data = request.get_json()
        if not data:
            return error_response(ERROR_MISSING_FIELDS, status_code=HTTP_BAD_REQUEST)

        # Update profile fields from onboarding steps
        profile_fields = [
            'gender', 'age', 'height', 'weight', 'target_weight',
            'goal_type', 'activity_level', 'diet_type', 'workout_frequency'
        ]

        for field in profile_fields:
            if field in data and data[field] is not None:
                setattr(user, field, data[field])

        # Calculate daily calorie goal
        if user.weight and user.height and user.age and user.gender:
            tdee = user.calculate_daily_calories()
            if tdee:
                if user.goal_type == 'lose_weight':
                    user.daily_calorie_goal = max(1200, tdee - 500)
                elif user.goal_type == 'gain_weight':
                    user.daily_calorie_goal = tdee + 400
                else:
                    user.daily_calorie_goal = tdee

        # Calculate default macro goals (protein/carbs/fat)
        if user.daily_calorie_goal:
            from models.user_preference import UserPreference
            pref = UserPreference.query.filter_by(user_id=user_id).first()
            if not pref:
                pref = UserPreference(user_id=user_id)
                db.session.add(pref)

            cal = user.daily_calorie_goal
            if user.diet_type == 'keto':
                pref.protein_goal_g = round(cal * 0.25 / 4)
                pref.carbs_goal_g = round(cal * 0.05 / 4)
                pref.fat_goal_g = round(cal * 0.70 / 9)
            elif user.diet_type in ('vegan', 'vegetarian'):
                pref.protein_goal_g = round(cal * 0.20 / 4)
                pref.carbs_goal_g = round(cal * 0.55 / 4)
                pref.fat_goal_g = round(cal * 0.25 / 9)
            else:
                pref.protein_goal_g = round(cal * 0.30 / 4)
                pref.carbs_goal_g = round(cal * 0.40 / 4)
                pref.fat_goal_g = round(cal * 0.30 / 9)

            if user.target_weight:
                pref.goal_weight_kg = user.target_weight

        user.onboarding_completed = True
        db.session.commit()

        # Build macros dict for response
        macros = None
        if user.daily_calorie_goal:
            pref_obj = UserPreference.query.filter_by(user_id=user_id).first()
            if pref_obj:
                macros = {
                    'protein': pref_obj.protein_goal_g,
                    'carbs': pref_obj.carbs_goal_g,
                    'fats': pref_obj.fat_goal_g,
                }

        return success_response(
            'Onboarding completed successfully',
            {
                'user': user.to_dict(),
                'daily_calorie_goal': user.daily_calorie_goal,
                'macros': macros,
            }
        )

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to complete onboarding', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    """Change user password"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not all(k in data for k in ['current_password', 'new_password']):
            return jsonify({'error': 'Missing current_password or new_password'}), 400
        
        # Verify current password
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 401
        
        # Validate new password
        password_validation = validate_password(data['new_password'])
        if not password_validation['valid']:
            return jsonify({'error': password_validation['message']}), 400
        
        # Update password
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to change password', 'details': str(e)}), 500