from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from models.step_log import StepLog
from utils.error_handlers import success_response, error_response
from utils.constants import *
from datetime import datetime
from sqlalchemy import func

steps_bp = Blueprint('steps', __name__)


@steps_bp.route('/log', methods=['POST'])
@jwt_required()
def log_steps():
    """Log step count"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data or 'steps' not in data:
            return error_response(ERROR_MISSING_FIELDS, status_code=HTTP_BAD_REQUEST)

        steps = data['steps']
        if not isinstance(steps, int) or steps < 0:
            return error_response('steps must be a non-negative integer', status_code=HTTP_BAD_REQUEST)

        logged_at = datetime.utcnow()
        if data.get('logged_at'):
            try:
                logged_at = datetime.fromisoformat(data['logged_at'])
            except ValueError:
                return error_response('Invalid logged_at format', status_code=HTTP_BAD_REQUEST)

        step_log = StepLog(
            user_id=user_id,
            steps=steps,
            calories_burned=data.get('calories_burned', 0),
            logged_at=logged_at,
            source=data.get('source', 'manual')
        )

        db.session.add(step_log)
        db.session.commit()

        return success_response('Steps logged successfully', data=step_log.to_dict(), status_code=HTTP_CREATED)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to log steps', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@steps_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_step_logs():
    """Get step logs for a specific date"""
    try:
        user_id = get_current_user_id()
        date_str = request.args.get('date')

        query = StepLog.query.filter_by(user_id=user_id)

        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter(func.date(StepLog.logged_at) == target_date)
            except ValueError:
                return error_response('Invalid date format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)

        logs = query.order_by(StepLog.logged_at.desc()).all()

        return success_response('Step logs retrieved', data={
            'logs': [log.to_dict() for log in logs],
            'count': len(logs)
        })

    except Exception as e:
        return error_response('Failed to get step logs', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@steps_bp.route('/daily-total', methods=['GET'])
@jwt_required()
def get_daily_total():
    """Get total steps for a specific date"""
    try:
        user_id = get_current_user_id()
        date_str = request.args.get('date')

        if not date_str:
            date_str = datetime.utcnow().strftime('%Y-%m-%d')

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return error_response('Invalid date format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)

        result = db.session.query(
            func.sum(StepLog.steps),
            func.sum(StepLog.calories_burned)
        ).filter(
            StepLog.user_id == user_id,
            func.date(StepLog.logged_at) == target_date
        ).first()

        total_steps = result[0] or 0
        total_calories_burned = result[1] or 0

        return success_response('Daily step total retrieved', data={
            'date': date_str,
            'total_steps': total_steps,
            'total_calories_burned': round(total_calories_burned, 1)
        })

    except Exception as e:
        return error_response('Failed to get daily total', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)
