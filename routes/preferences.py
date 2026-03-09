from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from models.user_preference import UserPreference
from models.meal_reminder import MealReminder
from utils.error_handlers import success_response, error_response
from utils.constants import *
from datetime import datetime, date

preferences_bp = Blueprint('preferences', __name__)

DEFAULT_REMINDERS = [
    {'meal_type': 'breakfast', 'reminder_time': '08:00', 'enabled': True},
    {'meal_type': 'lunch', 'reminder_time': '12:30', 'enabled': True},
    {'meal_type': 'dinner', 'reminder_time': '18:30', 'enabled': True},
    {'meal_type': 'snack', 'reminder_time': '15:00', 'enabled': False},
]


@preferences_bp.route('/', methods=['GET'])
@jwt_required()
def get_preferences():
    """Get user preferences, creating defaults if they don't exist"""
    try:
        user_id = get_current_user_id()

        preference = UserPreference.query.filter_by(user_id=user_id).first()

        if not preference:
            preference = UserPreference(user_id=user_id)
            db.session.add(preference)
            db.session.commit()

        return success_response('Preferences retrieved', data=preference.to_dict())

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to get preferences', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@preferences_bp.route('/', methods=['PUT'])
@jwt_required()
def update_preferences():
    """Update user preferences"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return error_response(ERROR_MISSING_FIELDS, status_code=HTTP_BAD_REQUEST)

        preference = UserPreference.query.filter_by(user_id=user_id).first()

        if not preference:
            preference = UserPreference(user_id=user_id)
            db.session.add(preference)

        allowed_fields = [
            'theme', 'language', 'badge_celebrations', 'live_activity',
            'add_burned_calories', 'rollover_calories', 'auto_adjust_macros',
            'protein_goal_g', 'carbs_goal_g', 'fat_goal_g',
            'daily_step_goal', 'goal_weight_kg', 'date_of_birth'
        ]

        for field in allowed_fields:
            if field in data:
                if field == 'date_of_birth' and data[field]:
                    try:
                        setattr(preference, field, date.fromisoformat(data[field]))
                    except ValueError:
                        return error_response('Invalid date_of_birth format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)
                else:
                    setattr(preference, field, data[field])

        db.session.commit()

        return success_response(SUCCESS_UPDATE, data=preference.to_dict())

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to update preferences', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@preferences_bp.route('/reminders', methods=['GET'])
@jwt_required()
def get_reminders():
    """Get meal reminders, creating defaults if they don't exist"""
    try:
        user_id = get_current_user_id()

        reminders = MealReminder.query.filter_by(user_id=user_id).all()

        if not reminders:
            for default in DEFAULT_REMINDERS:
                reminder = MealReminder(
                    user_id=user_id,
                    meal_type=default['meal_type'],
                    reminder_time=default['reminder_time'],
                    enabled=default['enabled']
                )
                db.session.add(reminder)
            db.session.commit()
            reminders = MealReminder.query.filter_by(user_id=user_id).all()

        return success_response('Reminders retrieved', data={
            'reminders': [r.to_dict() for r in reminders]
        })

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to get reminders', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@preferences_bp.route('/reminders', methods=['PUT'])
@jwt_required()
def update_reminders():
    """Update meal reminders"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data or 'reminders' not in data:
            return error_response(ERROR_MISSING_FIELDS, status_code=HTTP_BAD_REQUEST)

        for reminder_data in data['reminders']:
            if 'id' in reminder_data:
                reminder = MealReminder.query.filter_by(
                    id=reminder_data['id'], user_id=user_id
                ).first()
                if reminder:
                    if 'reminder_time' in reminder_data:
                        reminder.reminder_time = reminder_data['reminder_time']
                    if 'enabled' in reminder_data:
                        reminder.enabled = reminder_data['enabled']
            elif 'meal_type' in reminder_data:
                reminder = MealReminder.query.filter_by(
                    user_id=user_id, meal_type=reminder_data['meal_type']
                ).first()
                if reminder:
                    if 'reminder_time' in reminder_data:
                        reminder.reminder_time = reminder_data['reminder_time']
                    if 'enabled' in reminder_data:
                        reminder.enabled = reminder_data['enabled']
                else:
                    new_reminder = MealReminder(
                        user_id=user_id,
                        meal_type=reminder_data['meal_type'],
                        reminder_time=reminder_data.get('reminder_time', '12:00'),
                        enabled=reminder_data.get('enabled', True)
                    )
                    db.session.add(new_reminder)

        db.session.commit()

        reminders = MealReminder.query.filter_by(user_id=user_id).all()

        return success_response(SUCCESS_UPDATE, data={
            'reminders': [r.to_dict() for r in reminders]
        })

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to update reminders', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)
