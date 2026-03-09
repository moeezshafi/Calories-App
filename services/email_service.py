"""
Email Service
Handles email sending for verification, password reset, etc.
"""

import os
import secrets
from datetime import datetime, timedelta
from flask import current_app, render_template_string
from database import db

# Email templates
VERIFICATION_EMAIL_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1> Calorie Tracker</h1>
        </div>
        <div class="content">
            <h2>Welcome, {{ name }}!</h2>
            <p>Thank you for registering with Calorie Tracker. Please verify your email address to activate your account.</p>
            <p style="text-align: center;">
                <a href="{{ verification_url }}" class="button">Verify Email Address</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4CAF50;">{{ verification_url }}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 Calorie Tracker. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

PASSWORD_RESET_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Calorie Tracker</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hi {{ name }},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
                <a href="{{ reset_url }}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4CAF50;">{{ reset_url }}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
            <p>&copy; 2026 Calorie Tracker. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
"""

class EmailService:
    """Email service for sending transactional emails"""
    
    @staticmethod
    def send_verification_email(user, base_url):
        """
        Send email verification link to user
        """
        try:
            # Generate verification token
            token = secrets.token_urlsafe(32)
            user.verification_token = token
            user.verification_token_expires = datetime.utcnow() + timedelta(hours=24)
            db.session.commit()
            
            # Create verification URL
            verification_url = f"{base_url}/api/auth/verify-email?token={token}"
            
            # Render email template
            html_content = render_template_string(
                VERIFICATION_EMAIL_TEMPLATE,
                name=user.name,
                verification_url=verification_url
            )
            
            # In production, use actual email service (SendGrid, AWS SES, etc.)
            # For now, just log it
            current_app.logger.info(f"Verification email for {user.email}: {verification_url}")
            
            # TODO: Implement actual email sending
            # send_email(
            #     to=user.email,
            #     subject="Verify your email address",
            #     html=html_content
            # )
            
            return True
            
        except Exception as e:
            current_app.logger.error(f"Failed to send verification email: {e}")
            return False
    
    @staticmethod
    def send_password_reset_email(user, base_url):
        """
        Send password reset link to user
        """
        try:
            # Generate reset token
            token = secrets.token_urlsafe(32)
            user.password_reset_token = token
            user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
            db.session.commit()
            
            # Create reset URL
            reset_url = f"{base_url}/reset-password?token={token}"
            
            # Render email template
            html_content = render_template_string(
                PASSWORD_RESET_TEMPLATE,
                name=user.name,
                reset_url=reset_url
            )
            
            # Log for development
            current_app.logger.info(f"Password reset email for {user.email}: {reset_url}")
            
            # TODO: Implement actual email sending
            
            return True
            
        except Exception as e:
            current_app.logger.error(f"Failed to send password reset email: {e}")
            return False
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email after successful verification"""
        # TODO: Implement welcome email
        pass
