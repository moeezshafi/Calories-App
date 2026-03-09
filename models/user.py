from database import db
from datetime import datetime
import bcrypt
from utils.constants import ACTIVITY_MULTIPLIERS

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Profile information
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    weight = db.Column(db.Float)  # in kg
    height = db.Column(db.Float)  # in cm
    gender = db.Column(db.String(10))
    activity_level = db.Column(db.String(20))  # sedentary, light, moderate, very_active, extra_active
    timezone = db.Column(db.String(50), default='UTC')  # User's timezone
    
    # Goals
    goal_type = db.Column(db.String(20))  # lose_weight, maintain, gain_weight
    daily_calorie_goal = db.Column(db.Integer)
    target_weight = db.Column(db.Float)  # in kg
    diet_type = db.Column(db.String(30))  # none, keto, vegan, vegetarian, paleo, mediterranean
    workout_frequency = db.Column(db.String(20))  # never, light_1_2, moderate_3_4, heavy_5_plus

    # Onboarding
    onboarding_completed = db.Column(db.Boolean, default=False)
    
    # Account status
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(255))
    verification_token_expires = db.Column(db.DateTime)
    password_reset_token = db.Column(db.String(255))
    password_reset_expires = db.Column(db.DateTime)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    food_logs = db.relationship('FoodLog', backref='user', lazy=True, cascade='all, delete-orphan')
    custom_foods = db.relationship('CustomFood', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        """Check if provided password matches hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def calculate_bmr(self):
        """Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation"""
        if not all([self.weight, self.height, self.age, self.gender]):
            return None
        
        if self.gender.lower() == 'male':
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age + 5
        else:
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age - 161
        
        return bmr
    
    def calculate_daily_calories(self):
        """Calculate daily calorie needs based on activity level"""
        bmr = self.calculate_bmr()
        if not bmr:
            return None
        
        multiplier = ACTIVITY_MULTIPLIERS.get(self.activity_level, 1.2)
        return int(bmr * multiplier)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'age': self.age,
            'weight': self.weight,
            'height': self.height,
            'gender': self.gender,
            'activity_level': self.activity_level,
            'goal_type': self.goal_type,
            'daily_calorie_goal': self.daily_calorie_goal,
            'target_weight': self.target_weight,
            'diet_type': self.diet_type,
            'workout_frequency': self.workout_frequency,
            'onboarding_completed': self.onboarding_completed,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }