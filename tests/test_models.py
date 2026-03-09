"""
Model Tests
"""

import pytest
from models.user import User
from models.food_log import FoodLog
from models.custom_food import CustomFood
from models.refresh_token import RefreshToken

class TestUserModel:
    """Test User model"""
    
    def test_create_user(self, session):
        """Test creating a user"""
        user = User(
            email='test@example.com',
            name='Test User',
            age=30,
            weight=75,
            height=175,
            gender='male'
        )
        user.set_password('TestPass123!')
        session.add(user)
        session.commit()
        
        assert user.id is not None
        assert user.email == 'test@example.com'
        assert user.check_password('TestPass123!')
    
    def test_password_hashing(self, session):
        """Test password hashing"""
        user = User(email='test@example.com', name='Test')
        user.set_password('SecurePass123!')
        
        assert user.password_hash != 'SecurePass123!'
        assert user.check_password('SecurePass123!')
        assert not user.check_password('WrongPassword')
    
    def test_calculate_bmr(self, test_user):
        """Test BMR calculation"""
        bmr = test_user.calculate_bmr()
        assert bmr is not None
        assert bmr > 0
    
    def test_calculate_daily_calories(self, test_user):
        """Test daily calorie calculation"""
        calories = test_user.calculate_daily_calories()
        assert calories is not None
        assert calories > 0

class TestFoodLogModel:
    """Test FoodLog model"""
    
    def test_create_food_log(self, session, test_user):
        """Test creating a food log"""
        food_log = FoodLog(
            user_id=test_user.id,
            food_name='Banana',
            serving_size=100,
            servings_consumed=1,
            calories=89,
            proteins=1.1,
            carbs=22.8,
            fats=0.3,
            meal_type='breakfast'
        )
        session.add(food_log)
        session.commit()
        
        assert food_log.id is not None
        assert food_log.total_calories() == 89
    
    def test_total_nutrients(self, session, test_user):
        """Test total nutrients calculation"""
        food_log = FoodLog(
            user_id=test_user.id,
            food_name='Test Food',
            serving_size=100,
            servings_consumed=2,
            calories=100,
            proteins=10,
            carbs=20,
            fats=5
        )
        
        nutrients = food_log.total_nutrients()
        assert nutrients['calories'] == 200
        assert nutrients['proteins'] == 20
        assert nutrients['carbs'] == 40
        assert nutrients['fats'] == 10

class TestCustomFoodModel:
    """Test CustomFood model"""
    
    def test_create_custom_food(self, session, test_user):
        """Test creating custom food"""
        custom_food = CustomFood(
            user_id=test_user.id,
            name='Custom Meal',
            calories_per_100g=200,
            proteins_per_100g=10,
            carbs_per_100g=30,
            fats_per_100g=5
        )
        session.add(custom_food)
        session.commit()
        
        assert custom_food.id is not None
        assert custom_food.usage_count == 0
    
    def test_calculate_nutrition(self, session, test_user):
        """Test nutrition calculation"""
        custom_food = CustomFood(
            user_id=test_user.id,
            name='Test Food',
            calories_per_100g=200,
            proteins_per_100g=10,
            carbs_per_100g=30,
            fats_per_100g=5
        )
        
        nutrition = custom_food.calculate_nutrition(150)
        assert nutrition['calories'] == 300
        assert nutrition['proteins'] == 15

class TestRefreshTokenModel:
    """Test RefreshToken model"""
    
    def test_create_refresh_token(self, session, test_user):
        """Test creating refresh token"""
        token = RefreshToken(user_id=test_user.id)
        session.add(token)
        session.commit()
        
        assert token.id is not None
        assert token.token is not None
        assert token.is_valid()
    
    def test_revoke_token(self, session, test_user):
        """Test revoking token"""
        token = RefreshToken(user_id=test_user.id)
        session.add(token)
        session.commit()
        
        token.revoke()
        assert token.revoked
        assert not token.is_valid()
