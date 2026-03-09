from database import db
from datetime import datetime


class SavedFood(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    food_name = db.Column(db.String(200), nullable=False)
    calories = db.Column(db.Float)
    proteins = db.Column(db.Float)
    carbs = db.Column(db.Float)
    fats = db.Column(db.Float)
    fiber = db.Column(db.Float)
    sodium = db.Column(db.Float)
    sugars = db.Column(db.Float)
    serving_size = db.Column(db.Float)
    health_score = db.Column(db.Integer)
    image_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'food_name': self.food_name,
            'calories': self.calories,
            'proteins': self.proteins,
            'carbs': self.carbs,
            'fats': self.fats,
            'fiber': self.fiber,
            'sodium': self.sodium,
            'sugars': self.sugars,
            'serving_size': self.serving_size,
            'health_score': self.health_score,
            'image_path': self.image_path,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
