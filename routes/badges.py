from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from models.badge import Badge, UserBadge
from models.food_log import FoodLog
from models.water_log import WaterLog
from models.weight_log import WeightLog
from models.progress_photo import ProgressPhoto
from models.user_preference import UserPreference
from utils.error_handlers import success_response, error_response
from utils.constants import *
from datetime import datetime, timedelta, date
from sqlalchemy import func

badges_bp = Blueprint('badges', __name__)

# Badge definitions with check logic identifiers
BADGE_DEFINITIONS = [
    {
        'name': 'First Log',
        'key': 'first_log',
        'description': 'Log your first food',
        'icon': 'star',
        'requirement_type': 'total_logs',
        'requirement_value': 1,
    },
    {
        'name': '7 Day Streak',
        'key': 'streak_7',
        'description': '7-day logging streak',
        'icon': 'fire',
        'requirement_type': 'streak',
        'requirement_value': 7,
    },
    {
        'name': '30 Day Streak',
        'key': 'streak_30',
        'description': '30-day logging streak',
        'icon': 'fire',
        'requirement_type': 'streak',
        'requirement_value': 30,
    },
    {
        'name': 'Water Warrior',
        'key': 'water_warrior',
        'description': 'Log water 7 days in a row',
        'icon': 'droplet',
        'requirement_type': 'water_streak',
        'requirement_value': 7,
    },
    {
        'name': 'Century',
        'key': 'century',
        'description': 'Log 100 food items total',
        'icon': 'trophy',
        'requirement_type': 'total_logs',
        'requirement_value': 100,
    },
    {
        'name': 'Photo First',
        'key': 'photo_first',
        'description': 'Upload first progress photo',
        'icon': 'camera',
        'requirement_type': 'photo_count',
        'requirement_value': 1,
    },
    {
        'name': 'Weight Tracker',
        'key': 'weight_tracker',
        'description': 'Log weight 5 times',
        'icon': 'scale',
        'requirement_type': 'weight_logs',
        'requirement_value': 5,
    },
    {
        'name': 'Macro Master',
        'key': 'macro_master',
        'description': 'Hit protein goal for 7 days',
        'icon': 'target',
        'requirement_type': 'protein_goal_streak',
        'requirement_value': 7,
    },
]


def _seed_badges():
    """Create default badges if they don't exist"""
    existing_names = set(row[0] for row in db.session.query(Badge.name).all())
    for b in BADGE_DEFINITIONS:
        if b['name'] not in existing_names:
            db.session.add(Badge(
                name=b['name'],
                description=b['description'],
                icon=b['icon'],
                requirement_type=b['requirement_type'],
                requirement_value=b['requirement_value'],
            ))
    db.session.commit()


def _calculate_food_streak(user_id):
    """Calculate the current consecutive-day food logging streak"""
    today = date.today()
    year_ago = today - timedelta(days=365)
    logged_dates = set(
        str(row[0]) for row in db.session.query(
            func.date(FoodLog.consumed_at)
        ).filter(
            FoodLog.user_id == user_id,
            func.date(FoodLog.consumed_at) >= year_ago,
            func.date(FoodLog.consumed_at) <= today
        ).distinct().all()
    )

    streak = 0
    for i in range(365):
        if str(today - timedelta(days=i)) in logged_dates:
            streak += 1
        else:
            break
    return streak


def _calculate_water_streak(user_id):
    """Calculate the current consecutive-day water logging streak"""
    today = date.today()
    year_ago = today - timedelta(days=365)
    logged_dates = set(
        str(row[0]) for row in db.session.query(
            func.date(WaterLog.logged_at)
        ).filter(
            WaterLog.user_id == user_id,
            func.date(WaterLog.logged_at) >= year_ago,
            func.date(WaterLog.logged_at) <= today
        ).distinct().all()
    )

    streak = 0
    for i in range(365):
        if str(today - timedelta(days=i)) in logged_dates:
            streak += 1
        else:
            break
    return streak


def _calculate_protein_goal_streak(user_id):
    """Calculate consecutive days where the user hit their protein goal"""
    pref = UserPreference.query.filter_by(user_id=user_id).first()
    if not pref or not pref.protein_goal_g:
        return 0

    protein_goal = pref.protein_goal_g
    today = date.today()

    streak = 0
    for i in range(365):
        check_date = today - timedelta(days=i)
        daily_protein = db.session.query(
            func.sum(FoodLog.proteins * FoodLog.servings_consumed)
        ).filter(
            FoodLog.user_id == user_id,
            func.date(FoodLog.consumed_at) == check_date
        ).scalar() or 0

        if daily_protein >= protein_goal:
            streak += 1
        else:
            break

    return streak


def _check_badge_earned(badge, user_id, stats):
    """Check whether a specific badge has been earned based on pre-computed stats"""
    req_type = badge.requirement_type
    req_val = badge.requirement_value

    if req_type == 'total_logs':
        return stats['total_logs'] >= req_val
    elif req_type == 'streak':
        return stats['food_streak'] >= req_val
    elif req_type == 'water_streak':
        return stats['water_streak'] >= req_val
    elif req_type == 'photo_count':
        return stats['photo_count'] >= req_val
    elif req_type == 'weight_logs':
        return stats['weight_log_count'] >= req_val
    elif req_type == 'protein_goal_streak':
        return stats['protein_goal_streak'] >= req_val
    return False


@badges_bp.route('/', methods=['GET'])
@jwt_required()
def get_all_badges():
    """Get all available badges with user's earned status"""
    try:
        user_id = get_current_user_id()
        _seed_badges()

        badges = Badge.query.all()

        # Get earned badge ids and their data for this user
        earned_map = {}
        earned_records = UserBadge.query.filter_by(user_id=user_id).all()
        for ub in earned_records:
            earned_map[ub.badge_id] = {
                'earned_at': ub.earned_at.isoformat() if ub.earned_at else None,
                'id': ub.id,
            }

        badge_list = []
        for b in badges:
            badge_data = b.to_dict()
            earned_info = earned_map.get(b.id)
            badge_data['earned'] = earned_info is not None
            badge_data['earned_at'] = earned_info['earned_at'] if earned_info else None
            badge_data['user_badge_id'] = earned_info['id'] if earned_info else None
            badge_list.append(badge_data)

        return success_response('Badges retrieved', data={
            'badges': badge_list,
            'total_earned': len(earned_map),
            'total_available': len(badges),
        })
    except Exception as e:
        return error_response('Failed to get badges', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@badges_bp.route('/check', methods=['GET'])
@jwt_required()
def check_badges():
    """Check and award any newly earned badges"""
    try:
        user_id = get_current_user_id()
        _seed_badges()

        # Get already earned badge IDs
        earned_ids = set(
            row[0] for row in db.session.query(UserBadge.badge_id).filter_by(user_id=user_id).all()
        )

        # Pre-compute all stats needed for badge checks
        stats = {
            'total_logs': FoodLog.query.filter_by(user_id=user_id).count(),
            'food_streak': _calculate_food_streak(user_id),
            'water_streak': _calculate_water_streak(user_id),
            'photo_count': ProgressPhoto.query.filter_by(user_id=user_id).count(),
            'weight_log_count': WeightLog.query.filter_by(user_id=user_id).count(),
            'protein_goal_streak': _calculate_protein_goal_streak(user_id),
        }

        # Check each badge
        all_badges = Badge.query.all()
        newly_earned = []

        for badge in all_badges:
            if badge.id in earned_ids:
                continue

            if _check_badge_earned(badge, user_id, stats):
                user_badge = UserBadge(user_id=user_id, badge_id=badge.id)
                db.session.add(user_badge)
                newly_earned.append(badge.to_dict())

        db.session.commit()

        return success_response('Badge check complete', data={
            'newly_earned': newly_earned,
            'total_earned': len(earned_ids) + len(newly_earned),
            'stats': stats,
        })

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to check badges', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@badges_bp.route('/claim/<int:badge_id>', methods=['POST'])
@jwt_required()
def claim_badge(badge_id):
    """Mark a badge as seen/claimed by the user"""
    try:
        user_id = get_current_user_id()

        user_badge = UserBadge.query.filter_by(user_id=user_id, badge_id=badge_id).first()
        if not user_badge:
            return error_response('Badge not earned or does not exist', status_code=HTTP_NOT_FOUND)

        # Update earned_at to mark as claimed/seen (acts as claimed timestamp)
        user_badge.earned_at = datetime.utcnow()
        db.session.commit()

        return success_response('Badge claimed', data=user_badge.to_dict())

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to claim badge', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)
