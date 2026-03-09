from database import db
from datetime import datetime

class CustomFood(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Food information
    name = db.Column(db.String(200), nullable=False)
    brand = db.Column(db.String(100))
    barcode = db.Column(db.String(50))
    
    # Nutritional information per 100g
    calories_per_100g = db.Column(db.Float, nullable=False)
    proteins_per_100g = db.Column(db.Float, default=0)
    carbs_per_100g = db.Column(db.Float, default=0)
    fats_per_100g = db.Column(db.Float, default=0)
    fiber_per_100g = db.Column(db.Float, default=0)
    sodium_per_100g = db.Column(db.Float, default=0)
    sugars_per_100g = db.Column(db.Float, default=0)
    
    # Default serving size
    default_serving_size = db.Column(db.Float, default=100)  # in grams
    
    # Metadata
    category = db.Column(db.String(100))
    is_verified = db.Column(db.Boolean, default=False)
    usage_count = db.Column(db.Integer, default=0)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def calculate_nutrition(self, weight_grams):
        """Calculate nutrition for specific weight"""
        multiplier = weight_grams / 100.0
        return {
            'calories': round((self.calories_per_100g or 0) * multiplier, 2),
            'proteins': round((self.proteins_per_100g or 0) * multiplier, 2),
            'carbs': round((self.carbs_per_100g or 0) * multiplier, 2),
            'fats': round((self.fats_per_100g or 0) * multiplier, 2),
            'fiber': round((self.fiber_per_100g or 0) * multiplier, 2),
            'sodium': round((self.sodium_per_100g or 0) * multiplier, 2),
            'sugars': round((self.sugars_per_100g or 0) * multiplier, 2),
            'weight_grams': weight_grams
        }
    
    def increment_usage(self):
        """Track how often this food is used"""
        self.usage_count += 1
        db.session.commit()
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'brand': self.brand,
            'barcode': self.barcode,
            'calories_per_100g': self.calories_per_100g,
            'proteins_per_100g': self.proteins_per_100g,
            'carbs_per_100g': self.carbs_per_100g,
            'fats_per_100g': self.fats_per_100g,
            'fiber_per_100g': self.fiber_per_100g,
            'sodium_per_100g': self.sodium_per_100g,
            'sugars_per_100g': self.sugars_per_100g,
            'default_serving_size': self.default_serving_size,
            'category': self.category,
            'is_verified': self.is_verified,
            'usage_count': self.usage_count,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }