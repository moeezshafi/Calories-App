from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from utils.error_handlers import success_response, error_response
from utils.constants import *
from datetime import datetime


recipes_bp = Blueprint('recipes', __name__)


# ---------------------------------------------------------------------------
# Model: Recipe
# ---------------------------------------------------------------------------
class Recipe(db.Model):
    __tablename__ = 'recipe'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    servings = db.Column(db.Integer, default=1)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ingredients = db.relationship(
        'RecipeIngredient', backref='recipe', lazy=True, cascade='all, delete-orphan'
    )

    def total_nutrition(self):
        """Calculate total nutrition across all ingredients"""
        totals = {'calories': 0, 'protein': 0, 'carbs': 0, 'fats': 0}
        for ing in self.ingredients:
            totals['calories'] += ing.calories or 0
            totals['protein'] += ing.protein or 0
            totals['carbs'] += ing.carbs or 0
            totals['fats'] += ing.fats or 0
        return totals

    def per_serving_nutrition(self):
        """Calculate nutrition per serving"""
        totals = self.total_nutrition()
        servings = self.servings if self.servings and self.servings > 0 else 1
        return {
            'calories': round(totals['calories'] / servings, 1),
            'protein': round(totals['protein'] / servings, 1),
            'carbs': round(totals['carbs'] / servings, 1),
            'fats': round(totals['fats'] / servings, 1),
        }

    def to_dict(self, include_ingredients=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'servings': self.servings,
            'notes': self.notes,
            'total_nutrition': self.total_nutrition(),
            'per_serving': self.per_serving_nutrition(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_ingredients:
            data['ingredients'] = [ing.to_dict() for ing in self.ingredients]
        return data


# ---------------------------------------------------------------------------
# Model: RecipeIngredient
# ---------------------------------------------------------------------------
class RecipeIngredient(db.Model):
    __tablename__ = 'recipe_ingredient'

    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipe.id'), nullable=False)
    food_name = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.String(100))  # e.g. "200g", "1 cup"
    calories = db.Column(db.Float, default=0)
    protein = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fats = db.Column(db.Float, default=0)

    def to_dict(self):
        return {
            'id': self.id,
            'recipe_id': self.recipe_id,
            'food_name': self.food_name,
            'amount': self.amount,
            'calories': self.calories,
            'protein': self.protein,
            'carbs': self.carbs,
            'fats': self.fats,
        }


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@recipes_bp.route('/', methods=['POST'])
@jwt_required()
def create_recipe():
    """Create a new recipe with ingredients"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        if not data or 'name' not in data or 'ingredients' not in data:
            return error_response(ERROR_MISSING_FIELDS, status_code=HTTP_BAD_REQUEST)

        ingredients_data = data['ingredients']
        if not isinstance(ingredients_data, list) or len(ingredients_data) == 0:
            return error_response('ingredients must be a non-empty array', status_code=HTTP_BAD_REQUEST)

        recipe = Recipe(
            user_id=user_id,
            name=data['name'],
            servings=data.get('servings', 1),
            notes=data.get('notes'),
        )
        db.session.add(recipe)
        db.session.flush()  # get recipe.id for FK

        for ing in ingredients_data:
            if 'food_name' not in ing:
                continue
            ingredient = RecipeIngredient(
                recipe_id=recipe.id,
                food_name=ing['food_name'],
                amount=ing.get('amount'),
                calories=ing.get('calories', 0),
                protein=ing.get('protein', 0),
                carbs=ing.get('carbs', 0),
                fats=ing.get('fats', 0),
            )
            db.session.add(ingredient)

        db.session.commit()

        return success_response('Recipe created', data=recipe.to_dict(), status_code=HTTP_CREATED)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to create recipe', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@recipes_bp.route('/', methods=['GET'])
@jwt_required()
def list_recipes():
    """List all recipes for the current user with pagination and search"""
    try:
        user_id = get_current_user_id()
        
        # Pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        per_page = min(per_page, 100)  # Max 100 per page
        
        # Search parameter
        search = request.args.get('search', '').strip()
        
        # Build query
        query = Recipe.query.filter_by(user_id=user_id)
        
        # Apply search filter
        if search:
            query = query.filter(Recipe.name.ilike(f'%{search}%'))
        
        # Order by most recent
        query = query.order_by(Recipe.created_at.desc())
        
        # Paginate
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return success_response('Recipes retrieved', data={
            'recipes': [r.to_dict(include_ingredients=False) for r in pagination.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev,
            },
            'count': pagination.total,
        })

    except Exception as e:
        return error_response('Failed to get recipes', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@recipes_bp.route('/<int:recipe_id>', methods=['GET'])
@jwt_required()
def get_recipe(recipe_id):
    """Get recipe detail with calculated nutrition per serving"""
    try:
        user_id = get_current_user_id()

        recipe = Recipe.query.filter_by(id=recipe_id, user_id=user_id).first()
        if not recipe:
            return error_response('Recipe not found', status_code=HTTP_NOT_FOUND)

        return success_response('Recipe retrieved', data=recipe.to_dict())

    except Exception as e:
        return error_response('Failed to get recipe', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@recipes_bp.route('/<int:recipe_id>', methods=['PUT'])
@jwt_required()
def update_recipe(recipe_id):
    """Update a recipe and its ingredients"""
    try:
        user_id = get_current_user_id()
        data = request.get_json()

        recipe = Recipe.query.filter_by(id=recipe_id, user_id=user_id).first()
        if not recipe:
            return error_response('Recipe not found', status_code=HTTP_NOT_FOUND)

        # Update top-level fields
        if 'name' in data:
            recipe.name = data['name']
        if 'servings' in data:
            recipe.servings = data['servings']
        if 'notes' in data:
            recipe.notes = data['notes']

        # Replace ingredients if provided
        if 'ingredients' in data:
            ingredients_data = data['ingredients']
            if not isinstance(ingredients_data, list):
                return error_response('ingredients must be an array', status_code=HTTP_BAD_REQUEST)

            # Remove existing ingredients (cascade would handle it, but explicit is clearer)
            RecipeIngredient.query.filter_by(recipe_id=recipe.id).delete()

            for ing in ingredients_data:
                if 'food_name' not in ing:
                    continue
                ingredient = RecipeIngredient(
                    recipe_id=recipe.id,
                    food_name=ing['food_name'],
                    amount=ing.get('amount'),
                    calories=ing.get('calories', 0),
                    protein=ing.get('protein', 0),
                    carbs=ing.get('carbs', 0),
                    fats=ing.get('fats', 0),
                )
                db.session.add(ingredient)

        recipe.updated_at = datetime.utcnow()
        db.session.commit()

        return success_response('Recipe updated', data=recipe.to_dict())

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to update recipe', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@recipes_bp.route('/<int:recipe_id>', methods=['DELETE'])
@jwt_required()
def delete_recipe(recipe_id):
    """Delete a recipe and all its ingredients"""
    try:
        user_id = get_current_user_id()

        recipe = Recipe.query.filter_by(id=recipe_id, user_id=user_id).first()
        if not recipe:
            return error_response('Recipe not found', status_code=HTTP_NOT_FOUND)

        db.session.delete(recipe)
        db.session.commit()

        return success_response(SUCCESS_DELETE)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to delete recipe', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)
