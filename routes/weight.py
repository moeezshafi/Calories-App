from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from models.weight_log import WeightLog
from models.user import User
from models.user_preference import UserPreference
from utils.error_handlers import success_response, error_response
from utils.constants import *
from datetime import datetime, timedelta, date
from sqlalchemy import func

weight_bp = Blueprint('weight', __name__)


@weight_bp.route('/log', methods=['POST'])
@jwt_required()
def log_weight():
    """Log a weight entry"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data or 'weight_kg' not in data:
            return error_response(ERROR_MISSING_FIELDS, status_code=HTTP_BAD_REQUEST)

        weight_kg = data['weight_kg']
        if not isinstance(weight_kg, (int, float)) or weight_kg < MIN_WEIGHT_KG or weight_kg > MAX_WEIGHT_KG:
            return error_response(
                f'weight_kg must be between {MIN_WEIGHT_KG} and {MAX_WEIGHT_KG}',
                status_code=HTTP_BAD_REQUEST
            )

        weight_log = WeightLog(
            user_id=user_id,
            weight_kg=weight_kg,
            notes=data.get('notes'),
            logged_at=datetime.utcnow()
        )

        db.session.add(weight_log)
        db.session.commit()

        return success_response('Weight logged successfully', data=weight_log.to_dict(), status_code=HTTP_CREATED)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to log weight', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@weight_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_weight_logs():
    """Get weight history for a given period (default 30 days)"""
    try:
        user_id = get_current_user_id()
        period = request.args.get('period', 30, type=int)

        start_date = datetime.utcnow() - timedelta(days=period)

        logs = WeightLog.query.filter(
            WeightLog.user_id == user_id,
            WeightLog.logged_at >= start_date
        ).order_by(WeightLog.logged_at.desc()).all()

        return success_response('Weight logs retrieved', data={
            'logs': [log.to_dict() for log in logs],
            'count': len(logs),
            'period_days': period
        })

    except Exception as e:
        return error_response('Failed to get weight logs', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@weight_bp.route('/latest', methods=['GET'])
@jwt_required()
def get_latest_weight():
    """Get the latest weight entry"""
    try:
        user_id = get_current_user_id()

        latest = WeightLog.query.filter_by(user_id=user_id).order_by(
            WeightLog.logged_at.desc()
        ).first()

        if not latest:
            return error_response('No weight logs found', status_code=HTTP_NOT_FOUND)

        return success_response('Latest weight retrieved', data=latest.to_dict())

    except Exception as e:
        return error_response('Failed to get latest weight', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@weight_bp.route('/progress', methods=['GET'])
@jwt_required()
def get_weight_progress():
    """Get weight progress including start, current, goal, and projected date"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)

        if not user:
            return error_response(ERROR_USER_NOT_FOUND, status_code=HTTP_NOT_FOUND)

        # Get first and latest weight logs
        first_log = WeightLog.query.filter_by(user_id=user_id).order_by(
            WeightLog.logged_at.asc()
        ).first()

        latest_log = WeightLog.query.filter_by(user_id=user_id).order_by(
            WeightLog.logged_at.desc()
        ).first()

        if not first_log or not latest_log:
            return error_response('Not enough weight data for progress', status_code=HTTP_NOT_FOUND)

        # Get goal weight from preferences
        preference = UserPreference.query.filter_by(user_id=user_id).first()
        goal_weight = preference.goal_weight_kg if preference and preference.goal_weight_kg else None

        start_weight = first_log.weight_kg
        current_weight = latest_log.weight_kg
        weight_change = round(current_weight - start_weight, 2)

        # Calculate projected date to reach goal
        projected_date = None
        if goal_weight and first_log.logged_at != latest_log.logged_at:
            days_elapsed = (latest_log.logged_at - first_log.logged_at).days
            if days_elapsed > 0 and weight_change != 0:
                daily_change = weight_change / days_elapsed
                remaining = goal_weight - current_weight
                if daily_change != 0 and (remaining / daily_change) > 0:
                    days_to_goal = int(remaining / daily_change)
                    projected_date = (date.today() + timedelta(days=days_to_goal)).isoformat()

        return success_response('Weight progress retrieved', data={
            'start_weight': start_weight,
            'current_weight': current_weight,
            'goal_weight': goal_weight,
            'weight_change': weight_change,
            'start_date': first_log.logged_at.strftime('%Y-%m-%d'),
            'latest_date': latest_log.logged_at.strftime('%Y-%m-%d'),
            'projected_goal_date': projected_date
        })

    except Exception as e:
        return error_response('Failed to get weight progress', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@weight_bp.route('/logs/<int:log_id>', methods=['DELETE'])
@jwt_required()
def delete_weight_log(log_id):
    """Delete a weight log entry"""
    try:
        user_id = get_current_user_id()

        weight_log = WeightLog.query.filter_by(id=log_id, user_id=user_id).first()
        if not weight_log:
            return error_response('Weight log not found', status_code=HTTP_NOT_FOUND)

        db.session.delete(weight_log)
        db.session.commit()

        return success_response(SUCCESS_DELETE)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to delete weight log', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)
