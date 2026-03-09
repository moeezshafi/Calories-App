from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from utils.error_handlers import success_response, error_response
from utils.constants import *
from datetime import datetime, timedelta, date
from sqlalchemy import func


exercises_bp = Blueprint('exercises', __name__)


# ---------------------------------------------------------------------------
# Model: ExerciseLog
# ---------------------------------------------------------------------------
class ExerciseLog(db.Model):
    __tablename__ = 'exercise_log'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    exercise_type = db.Column(db.String(100), nullable=False)
    duration_minutes = db.Column(db.Float, nullable=False)
    calories_burned = db.Column(db.Float, default=0)
    notes = db.Column(db.Text)
    performed_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'exercise_type': self.exercise_type,
            'duration_minutes': self.duration_minutes,
            'calories_burned': self.calories_burned,
            'notes': self.notes,
            'performed_at': self.performed_at.isoformat() if self.performed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@exercises_bp.route('/log', methods=['POST'])
@jwt_required()
def log_exercise():
    """Log an exercise session"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data or 'exercise_type' not in data or 'duration_minutes' not in data:
            return error_response(ERROR_MISSING_FIELDS, status_code=HTTP_BAD_REQUEST)

        duration = data['duration_minutes']
        if not isinstance(duration, (int, float)) or duration <= 0:
            return error_response('duration_minutes must be a positive number', status_code=HTTP_BAD_REQUEST)

        performed_at = datetime.utcnow()
        if data.get('performed_at'):
            try:
                performed_at = datetime.fromisoformat(data['performed_at'])
            except ValueError:
                return error_response('Invalid performed_at format', status_code=HTTP_BAD_REQUEST)

        exercise = ExerciseLog(
            user_id=user_id,
            exercise_type=data['exercise_type'],
            duration_minutes=duration,
            calories_burned=data.get('calories_burned', 0),
            notes=data.get('notes'),
            performed_at=performed_at,
        )

        db.session.add(exercise)
        db.session.commit()

        return success_response('Exercise logged successfully', data=exercise.to_dict(), status_code=HTTP_CREATED)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to log exercise', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@exercises_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_exercise_logs():
    """Get exercise logs for a specific date"""
    try:
        user_id = get_current_user_id()
        date_str = request.args.get('date')

        query = ExerciseLog.query.filter_by(user_id=user_id)

        if date_str:
            try:
                target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                query = query.filter(func.date(ExerciseLog.performed_at) == target_date)
            except ValueError:
                return error_response('Invalid date format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)

        logs = query.order_by(ExerciseLog.performed_at.desc()).all()

        total_duration = sum(log.duration_minutes for log in logs)
        total_burned = sum(log.calories_burned or 0 for log in logs)

        return success_response('Exercise logs retrieved', data={
            'logs': [log.to_dict() for log in logs],
            'count': len(logs),
            'total_duration_minutes': round(total_duration, 1),
            'total_calories_burned': round(total_burned, 1),
        })

    except Exception as e:
        return error_response('Failed to get exercise logs', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@exercises_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_weekly_summary():
    """Get weekly exercise summary (current week Mon-Sun)"""
    try:
        user_id = get_current_user_id()

        today = date.today()
        # Monday of the current week
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=6)

        logs = ExerciseLog.query.filter(
            ExerciseLog.user_id == user_id,
            func.date(ExerciseLog.performed_at) >= start_of_week,
            func.date(ExerciseLog.performed_at) <= end_of_week,
        ).order_by(ExerciseLog.performed_at.asc()).all()

        # Aggregate by day
        daily = {}
        for log in logs:
            day_str = log.performed_at.strftime('%Y-%m-%d') if log.performed_at else str(today)
            if day_str not in daily:
                daily[day_str] = {'duration_minutes': 0, 'calories_burned': 0, 'sessions': 0}
            daily[day_str]['duration_minutes'] += log.duration_minutes
            daily[day_str]['calories_burned'] += log.calories_burned or 0
            daily[day_str]['sessions'] += 1

        # Aggregate by exercise type
        by_type = {}
        for log in logs:
            t = log.exercise_type
            if t not in by_type:
                by_type[t] = {'duration_minutes': 0, 'calories_burned': 0, 'sessions': 0}
            by_type[t]['duration_minutes'] += log.duration_minutes
            by_type[t]['calories_burned'] += log.calories_burned or 0
            by_type[t]['sessions'] += 1

        total_duration = sum(log.duration_minutes for log in logs)
        total_burned = sum(log.calories_burned or 0 for log in logs)

        return success_response('Weekly exercise summary', data={
            'week_start': start_of_week.isoformat(),
            'week_end': end_of_week.isoformat(),
            'total_sessions': len(logs),
            'total_duration_minutes': round(total_duration, 1),
            'total_calories_burned': round(total_burned, 1),
            'daily_breakdown': daily,
            'by_type': by_type,
        })

    except Exception as e:
        return error_response('Failed to get weekly summary', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@exercises_bp.route('/<int:exercise_id>', methods=['DELETE'])
@jwt_required()
def delete_exercise(exercise_id):
    """Delete an exercise log entry"""
    try:
        user_id = get_current_user_id()

        exercise = ExerciseLog.query.filter_by(id=exercise_id, user_id=user_id).first()
        if not exercise:
            return error_response('Exercise log not found', status_code=HTTP_NOT_FOUND)

        db.session.delete(exercise)
        db.session.commit()

        return success_response(SUCCESS_DELETE)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to delete exercise log', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)
