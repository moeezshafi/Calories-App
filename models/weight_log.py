from database import db
from datetime import datetime


class WeightLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    weight_kg = db.Column(db.Float, nullable=False)
    notes = db.Column(db.String(500))
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'weight_kg': self.weight_kg,
            'notes': self.notes,
            'logged_at': self.logged_at.isoformat() if self.logged_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
