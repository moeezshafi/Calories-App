from database import db
from datetime import datetime, timedelta
import secrets

class RefreshToken(db.Model):
    """Refresh Token Model for JWT token rotation"""
    __tablename__ = 'refresh_tokens'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    revoked = db.Column(db.Boolean, default=False)
    revoked_at = db.Column(db.DateTime)
    
    # Device information for security
    device_info = db.Column(db.String(255))
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    
    # Relationship
    user = db.relationship('User', backref=db.backref('refresh_tokens', lazy=True))
    
    def __init__(self, user_id, expires_in_days=30, device_info=None, ip_address=None, user_agent=None):
        self.user_id = user_id
        self.token = secrets.token_urlsafe(64)
        self.expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        self.device_info = device_info
        self.ip_address = ip_address
        self.user_agent = user_agent
    
    def is_valid(self):
        """Check if token is valid (not expired and not revoked)"""
        return not self.revoked and datetime.utcnow() < self.expires_at
    
    def revoke(self):
        """Revoke the refresh token"""
        self.revoked = True
        self.revoked_at = datetime.utcnow()
    
    @staticmethod
    def cleanup_expired():
        """Remove expired tokens from database"""
        expired_tokens = RefreshToken.query.filter(
            RefreshToken.expires_at < datetime.utcnow()
        ).all()
        for token in expired_tokens:
            db.session.delete(token)
        db.session.commit()
        return len(expired_tokens)
    
    def to_dict(self):
        return {
            'id': self.id,
            'token': self.token,
            'expires_at': self.expires_at.isoformat(),
            'created_at': self.created_at.isoformat(),
            'revoked': self.revoked,
            'device_info': self.device_info
        }
