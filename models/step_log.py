from database import db
from datetime import datetime


class StepLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    steps = db.Column(db.Integer, nullable=False)
    calories_burned = db.Column(db.Float, default=0)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    source = db.Column(db.String(20), default='manual')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'steps': self.steps,
            'calories_burned': self.calories_burned,
            'logged_at': self.logged_at.isoformat() if self.logged_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'source': self.source
        }
