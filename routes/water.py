from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from models.water_log import WaterLog
from utils.error_handlers import success_response, error_response
from utils.constants import *
from datetime import datetime
from sqlalchemy import func

water_bp = Blueprint('water', __name__)


@water_bp.route('/log', methods=['POST'])
@jwt_required()
def log_water():
    """Log water intake"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data or 'amount_ml' not in data:
            return error_response(ERROR_MISSING_FIELDS, status_code=HTTP_BAD_REQUEST)

        amount_ml = data['amount_ml']
        if not isinstance(amount_ml, (int, float)) or amount_ml <= 0:
            return error_response('amount_ml must be a positive number', status_code=HTTP_BAD_REQUEST)

        logged_at = datetime.utcnow()
        if data.get('logged_at'):
            try:
                logged_at = datetime.fromisoformat(data['logged_at'])
            except ValueError:
                return error_response('Invalid logged_at format', status_code=HTTP_BAD_REQUEST)

        water_log = WaterLog(
            user_id=user_id,
            amount_ml=amount_ml,
            logged_at=logged_at
        )

        db.session.add(water_log)
        db.session.commit()

        return success_response('Water logged successfully', data=water_log.to_dict(), status_code=HTTP_CREATED)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to log water', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@water_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_water_logs():
    """Get water logs for a specific date"""
    try:
        user_id = get_current_user_id()
        date_str = request.args.get('date')

        query = WaterLog.query.filter_by(user_id=user_id)

        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter(func.date(WaterLog.logged_at) == target_date)
            except ValueError:
                return error_response('Invalid date format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)

        logs = query.order_by(WaterLog.logged_at.desc()).all()

        return success_response('Water logs retrieved', data={
            'logs': [log.to_dict() for log in logs],
            'count': len(logs)
        })

    except Exception as e:
        return error_response('Failed to get water logs', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@water_bp.route('/daily-total', methods=['GET'])
@jwt_required()
def get_daily_total():
    """Get total water intake for a specific date"""
    try:
        user_id = get_current_user_id()
        date_str = request.args.get('date')

        if not date_str:
            date_str = datetime.utcnow().strftime('%Y-%m-%d')

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return error_response('Invalid date format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)

        total_ml = db.session.query(func.sum(WaterLog.amount_ml)).filter(
            WaterLog.user_id == user_id,
            func.date(WaterLog.logged_at) == target_date
        ).scalar() or 0

        return success_response('Daily total retrieved', data={
            'date': date_str,
            'total_ml': round(total_ml, 1)
        })

    except Exception as e:
        return error_response('Failed to get daily total', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@water_bp.route('/logs/<int:log_id>', methods=['DELETE'])
@jwt_required()
def delete_water_log(log_id):
    """Delete a water log entry"""
    try:
        user_id = get_current_user_id()

        water_log = WaterLog.query.filter_by(id=log_id, user_id=user_id).first()
        if not water_log:
            return error_response('Water log not found', status_code=HTTP_NOT_FOUND)

        db.session.delete(water_log)
        db.session.commit()

        return success_response(SUCCESS_DELETE)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to delete water log', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)
