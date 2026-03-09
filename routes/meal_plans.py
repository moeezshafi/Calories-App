from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from utils.error_handlers import success_response, error_response
from utils.constants import *
from datetime import datetime, date
from sqlalchemy import func
import json


meal_plans_bp = Blueprint('meal_plans', __name__)


# ---------------------------------------------------------------------------
# Model: MealPlan
# ---------------------------------------------------------------------------
class MealPlan(db.Model):
    __tablename__ = 'meal_plan'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    plan_date = db.Column(db.Date, nullable=False)
    meal_type = db.Column(db.String(20), nullable=False)  # breakfast, lunch, dinner, snack
    food_name = db.Column(db.String(200), nullable=False)
    calories = db.Column(db.Float, default=0)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fats = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'plan_date': self.plan_date.isoformat() if self.plan_date else None,
            'meal_type': self.meal_type,
            'food_name': self.food_name,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fats': self.fats,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# Model: MealPlanTemplate
# ---------------------------------------------------------------------------
class MealPlanTemplate(db.Model):
    __tablename__ = 'meal_plan_template'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    meals = db.Column(db.Text, nullable=False)  # JSON-encoded list of meals
    total_calories = db.Column(db.Float, default=0)
    total_protein = db.Column(db.Float, default=0)
    total_carbs = db.Column(db.Float, default=0)
    total_fats = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'meals': json.loads(self.meals) if self.meals else [],
            'total_calories': self.total_calories,
            'total_protein': self.total_protein,
            'total_carbs': self.total_carbs,
            'total_fats': self.total_fats,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@meal_plans_bp.route('/', methods=['POST'])
@jwt_required()
def create_meal_plan():
    """Create or update a meal plan for a specific date"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data:
            return error_response(ERROR_MISSING_FIELDS, status_code=HTTP_BAD_REQUEST)

        # Support both single meal and multiple meals format
        if 'date' in data and 'meals' in data:
            # Multiple meals format
            try:
                plan_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return error_response('Invalid date format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)

            meals = data['meals']
            if not isinstance(meals, list):
                return error_response('meals must be an array', status_code=HTTP_BAD_REQUEST)

            created_entries = []
            for meal in meals:
                if 'meal_type' not in meal or 'food_name' not in meal:
                    continue

                entry = MealPlan(
                    user_id=user_id,
                    plan_date=plan_date,
                    meal_type=meal['meal_type'],
                    food_name=meal['food_name'],
                    calories=meal.get('calories', 0),
                    protein=meal.get('protein', 0),
                    carbs=meal.get('carbs', 0),
                    fats=meal.get('fats', 0),
                )
                db.session.add(entry)
                created_entries.append(entry)

            db.session.commit()

            return success_response('Meal plan created', data={
                'entries': [e.to_dict() for e in created_entries],
                'count': len(created_entries),
            }, status_code=HTTP_CREATED)

        elif 'date' in data and 'meal_type' in data and 'food_name' in data:
            # Single meal format (for backward compatibility)
            try:
                plan_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return error_response('Invalid date format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)

            entry = MealPlan(
                user_id=user_id,
                plan_date=plan_date,
                meal_type=data['meal_type'],
                food_name=data['food_name'],
                calories=data.get('calories', 0),
                protein=data.get('protein', 0),
                carbs=data.get('carbs', 0),
                fats=data.get('fats', 0),
            )
            db.session.add(entry)
            db.session.commit()

            return success_response('Meal plan entry created', data=entry.to_dict(), status_code=HTTP_CREATED)

        else:
            return error_response('Invalid request format. Provide either (date + meals array) or (date + meal_type + food_name)', status_code=HTTP_BAD_REQUEST)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to create meal plan', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@meal_plans_bp.route('/', methods=['GET'])
@jwt_required()
def get_meal_plans():
    """Get meal plans for a date range"""
    try:
        user_id = get_current_user_id()
        start_str = request.args.get('start_date')
        end_str = request.args.get('end_date')

        query = MealPlan.query.filter_by(user_id=user_id)

        if start_str:
            try:
                start_date = datetime.strptime(start_str, '%Y-%m-%d').date()
                query = query.filter(MealPlan.plan_date >= start_date)
            except ValueError:
                return error_response('Invalid start_date format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)

        if end_str:
            try:
                end_date = datetime.strptime(end_str, '%Y-%m-%d').date()
                query = query.filter(MealPlan.plan_date <= end_date)
            except ValueError:
                return error_response('Invalid end_date format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)

        entries = query.order_by(MealPlan.plan_date.asc(), MealPlan.meal_type.asc()).all()

        # Group by date
        by_date = {}
        for entry in entries:
            d = entry.plan_date.isoformat()
            if d not in by_date:
                by_date[d] = {'date': d, 'meals': [], 'totals': {'calories': 0, 'protein': 0, 'carbs': 0, 'fats': 0}}
            by_date[d]['meals'].append(entry.to_dict())
            by_date[d]['totals']['calories'] += entry.calories or 0
            by_date[d]['totals']['protein'] += entry.protein or 0
            by_date[d]['totals']['carbs'] += entry.carbs or 0
            by_date[d]['totals']['fats'] += entry.fats or 0

        return success_response('Meal plans retrieved', data={
            'plans': list(by_date.values()),
            'total_entries': len(entries),
        })

    except Exception as e:
        return error_response('Failed to get meal plans', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@meal_plans_bp.route('/<int:entry_id>', methods=['DELETE'])
@jwt_required()
def delete_meal_plan_entry(entry_id):
    """Delete a meal plan entry"""
    try:
        user_id = get_current_user_id()

        entry = MealPlan.query.filter_by(id=entry_id, user_id=user_id).first()
        if not entry:
            return error_response('Meal plan entry not found', status_code=HTTP_NOT_FOUND)

        db.session.delete(entry)
        db.session.commit()

        return success_response(SUCCESS_DELETE)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to delete meal plan entry', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@meal_plans_bp.route('/templates', methods=['GET'])
@jwt_required()
def get_templates():
    """Get saved meal plan templates"""
    try:
        user_id = get_current_user_id()

        templates = MealPlanTemplate.query.filter_by(user_id=user_id).order_by(
            MealPlanTemplate.created_at.desc()
        ).all()

        return success_response('Templates retrieved', data={
            'templates': [t.to_dict() for t in templates],
            'count': len(templates),
        })

    except Exception as e:
        return error_response('Failed to get templates', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@meal_plans_bp.route('/templates', methods=['POST'])
@jwt_required()
def save_template():
    """Save a day's meal plan as a reusable template"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data or 'name' not in data or 'date' not in data:
            return error_response(ERROR_MISSING_FIELDS, status_code=HTTP_BAD_REQUEST)

        try:
            plan_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return error_response('Invalid date format. Use YYYY-MM-DD', status_code=HTTP_BAD_REQUEST)

        # Fetch meals for that date
        entries = MealPlan.query.filter_by(user_id=user_id, plan_date=plan_date).all()
        if not entries:
            return error_response('No meal plan entries found for this date', status_code=HTTP_NOT_FOUND)

        meals_data = []
        total_cal = total_prot = total_carb = total_fat = 0
        for e in entries:
            meals_data.append({
                'meal_type': e.meal_type,
                'food_name': e.food_name,
                'calories': e.calories,
                'protein': e.protein,
                'carbs': e.carbs,
                'fats': e.fats,
            })
            total_cal += e.calories or 0
            total_prot += e.protein or 0
            total_carb += e.carbs or 0
            total_fat += e.fats or 0

        template = MealPlanTemplate(
            user_id=user_id,
            name=data['name'],
            meals=json.dumps(meals_data),
            total_calories=total_cal,
            total_protein=total_prot,
            total_carbs=total_carb,
            total_fats=total_fat,
        )

        db.session.add(template)
        db.session.commit()

        return success_response('Template saved', data=template.to_dict(), status_code=HTTP_CREATED)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to save template', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)
