from database import db
from datetime import datetime


class WaterLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount_ml = db.Column(db.Float, nullable=False)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'amount_ml': self.amount_ml,
            'logged_at': self.logged_at.isoformat() if self.logged_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
