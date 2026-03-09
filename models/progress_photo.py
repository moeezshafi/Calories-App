from database import db
from datetime import datetime


class ProgressPhoto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    photo_path = db.Column(db.String(255), nullable=False)
    weight_at_time = db.Column(db.Float)
    notes = db.Column(db.Text)
    taken_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'photo_path': self.photo_path,
            'weight_at_time': self.weight_at_time,
            'notes': self.notes,
            'taken_at': self.taken_at.isoformat() if self.taken_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
