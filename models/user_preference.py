from database import db
from datetime import datetime, date


class UserPreference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    theme = db.Column(db.String(10), default='system')
    language = db.Column(db.String(5), default='en')
    badge_celebrations = db.Column(db.Boolean, default=True)
    live_activity = db.Column(db.Boolean, default=False)
    add_burned_calories = db.Column(db.Boolean, default=True)
    rollover_calories = db.Column(db.Boolean, default=False)
    auto_adjust_macros = db.Column(db.Boolean, default=True)
    protein_goal_g = db.Column(db.Float)
    carbs_goal_g = db.Column(db.Float)
    fat_goal_g = db.Column(db.Float)
    daily_step_goal = db.Column(db.Integer, default=10000)
    goal_weight_kg = db.Column(db.Float)
    date_of_birth = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'theme': self.theme,
            'language': self.language,
            'badge_celebrations': self.badge_celebrations,
            'live_activity': self.live_activity,
            'add_burned_calories': self.add_burned_calories,
            'rollover_calories': self.rollover_calories,
            'auto_adjust_macros': self.auto_adjust_macros,
            'protein_goal_g': self.protein_goal_g,
            'carbs_goal_g': self.carbs_goal_g,
            'fat_goal_g': self.fat_goal_g,
            'daily_step_goal': self.daily_step_goal,
            'goal_weight_kg': self.goal_weight_kg,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
