from database import db
from datetime import datetime

class FoodLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Food identification
    food_name = db.Column(db.String(200), nullable=False)
    brand = db.Column(db.String(100))
    barcode = db.Column(db.String(50))
    
    # Serving information
    serving_size = db.Column(db.Float, nullable=False)  # in grams
    servings_consumed = db.Column(db.Float, default=1.0)
    
    # Nutritional information (per serving)
    calories = db.Column(db.Float, nullable=False)
    proteins = db.Column(db.Float, default=0)
    carbs = db.Column(db.Float, default=0)
    fats = db.Column(db.Float, default=0)
    fiber = db.Column(db.Float, default=0)
    sodium = db.Column(db.Float, default=0)
    sugars = db.Column(db.Float, default=0)
    
    # Meal categorization
    meal_type = db.Column(db.String(20))  # breakfast, lunch, dinner, snack
    
    # AI analysis data
    confidence_score = db.Column(db.Float)  # 0-1 scale
    ai_analysis = db.Column(db.Text)  # JSON string of AI response
    
    # Images
    image_path = db.Column(db.String(255))
    
    # Timestamps
    consumed_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def total_calories(self):
        """Calculate total calories consumed"""
        return self.calories * self.servings_consumed
    
    def total_nutrients(self):
        """Calculate total nutrients consumed"""
        multiplier = self.servings_consumed
        return {
            'calories': (self.calories or 0) * multiplier,
            'proteins': (self.proteins or 0) * multiplier,
            'carbs': (self.carbs or 0) * multiplier,
            'fats': (self.fats or 0) * multiplier,
            'fiber': (self.fiber or 0) * multiplier,
            'sodium': (self.sodium or 0) * multiplier,
            'sugars': (self.sugars or 0) * multiplier
        }
    
    def to_dict(self):
        return {
            'id': self.id,
            'food_name': self.food_name,
            'brand': self.brand,
            'barcode': self.barcode,
            'serving_size': self.serving_size,
            'servings_consumed': self.servings_consumed,
            'calories': self.calories,
            'proteins': self.proteins,
            'carbs': self.carbs,
            'fats': self.fats,
            'fiber': self.fiber,
            'sodium': self.sodium,
            'sugars': self.sugars,
            'meal_type': self.meal_type,
            'confidence_score': self.confidence_score,
            'total_calories': self.total_calories(),
            'total_nutrients': self.total_nutrients(),
            'consumed_at': self.consumed_at.isoformat() if self.consumed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }