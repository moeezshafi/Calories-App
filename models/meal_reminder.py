from database import db
from datetime import datetime


class MealReminder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    meal_type = db.Column(db.String(20), nullable=False)
    reminder_time = db.Column(db.String(10))
    enabled = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'meal_type': self.meal_type,
            'reminder_time': self.reminder_time,
            'enabled': self.enabled,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
