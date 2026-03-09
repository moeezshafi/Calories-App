"""
Email Tasks
Background tasks for sending emails
"""

from celery_app import celery
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


@celery.task(bind=True, max_retries=3)
def send_verification_email(self, email: str, token: str, user_name: str) -> Dict[str, Any]:
    """
    Send email verification link
    
    Args:
        email: User email address
        token: Verification token
        user_name: User's name
    
    Returns:
        Dictionary with send status
    """
    try:
        from services.email_service import send_email
        
        logger.info(f"Sending verification email to {email}")
        
        subject = "Verify Your Email - Calorie Tracker"
        body = f"""
        Hi {user_name},
        
        Thank you for registering with Calorie Tracker!
        
        Please verify your email address by clicking the link below:
        
        http://your-domain.com/verify?token={token}
        
        This link will expire in 24 hours.
        
        If you didn't create an account, please ignore this email.
        
        Best regards,
        Calorie Tracker Team
        """
        
        result = send_email(email, subject, body)
        
        logger.info(f"Verification email sent to {email}")
        return {
            'success': True,
            'email': email,
            'result': result
        }
        
    except Exception as e:
        logger.error(f"Error sending verification email: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@celery.task(bind=True, max_retries=3)
def send_password_reset_email(self, email: str, token: str, user_name: str) -> Dict[str, Any]:
    """
    Send password reset link
    
    Args:
        email: User email address
        token: Reset token
        user_name: User's name
    
    Returns:
        Dictionary with send status
    """
    try:
        from services.email_service import send_email
        
        logger.info(f"Sending password reset email to {email}")
        
        subject = "Password Reset - Calorie Tracker"
        body = f"""
        Hi {user_name},
        
        We received a request to reset your password.
        
        Click the link below to reset your password:
        
        http://your-domain.com/reset-password?token={token}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, please ignore this email.
        
        Best regards,
        Calorie Tracker Team
        """
        
        result = send_email(email, subject, body)
        
        logger.info(f"Password reset email sent to {email}")
        return {
            'success': True,
            'email': email,
            'result': result
        }
        
    except Exception as e:
        logger.error(f"Error sending password reset email: {str(e)}")
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@celery.task
def send_daily_summary_email(user_id: int) -> Dict[str, Any]:
    """
    Send daily nutrition summary email
    
    Args:
        user_id: User ID
    
    Returns:
        Dictionary with send status
    """
    try:
        from models.user import User
        from models.food_log import FoodLog
        from datetime import datetime, timedelta
        from services.email_service import send_email
        
        logger.info(f"Sending daily summary email for user {user_id}")
        
        user = User.query.get(user_id)
        if not user or not user.email:
            return {'success': False, 'error': 'User not found'}
        
        # Get today's food logs
        today = datetime.utcnow().date()
        logs = FoodLog.query.filter(
            FoodLog.user_id == user_id,
            FoodLog.consumed_at >= today,
            FoodLog.consumed_at < today + timedelta(days=1)
        ).all()
        
        total_calories = sum(log.calories * log.servings_consumed for log in logs)
        
        subject = "Your Daily Nutrition Summary"
        body = f"""
        Hi {user.name},
        
        Here's your nutrition summary for {today.strftime('%B %d, %Y')}:
        
        Total Calories: {total_calories:.0f}
        Goal: {user.daily_calorie_goal or 'Not set'}
        Meals Logged: {len(logs)}
        
        Keep up the great work!
        
        Best regards,
        Calorie Tracker Team
        """
        
        result = send_email(user.email, subject, body)
        
        logger.info(f"Daily summary email sent to user {user_id}")
        return {
            'success': True,
            'user_id': user_id,
            'result': result
        }
        
    except Exception as e:
        logger.error(f"Error sending daily summary email: {str(e)}")
        return {'success': False, 'error': str(e)}
