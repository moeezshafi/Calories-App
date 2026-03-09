"""
Token Management Routes
Handles refresh token operations
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from database import db
from models.user import User
from models.refresh_token import RefreshToken
from utils.error_handlers import error_response, success_response
from utils.constants import *

token_bp = Blueprint('token', __name__)

@token_bp.route('/refresh', methods=['POST'])
def refresh_access_token():
    """
    Refresh access token using refresh token
    """
    try:
        data = request.get_json()
        refresh_token_str = data.get('refresh_token')
        
        if not refresh_token_str:
            return error_response('Refresh token required', status_code=HTTP_BAD_REQUEST)
        
        # Find refresh token in database
        refresh_token = RefreshToken.query.filter_by(token=refresh_token_str).first()
        
        if not refresh_token:
            return error_response('Invalid refresh token', status_code=HTTP_UNAUTHORIZED)
        
        # Check if token is valid
        if not refresh_token.is_valid():
            return error_response('Refresh token expired or revoked', status_code=HTTP_UNAUTHORIZED)
        
        # Get user
        user = User.query.get(refresh_token.user_id)
        if not user or not user.is_active:
            return error_response('User not found or inactive', status_code=HTTP_UNAUTHORIZED)
        
        # Create new access token
        access_token = create_access_token(identity=str(user.id))
        
        # Optional: Rotate refresh token for better security
        if request.args.get('rotate') == 'true':
            # Revoke old token
            refresh_token.revoke()
            
            # Create new refresh token
            new_refresh_token = RefreshToken(
                user_id=user.id,
                device_info=request.headers.get('User-Agent'),
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent')
            )
            db.session.add(new_refresh_token)
            db.session.commit()
            
            return success_response(
                'Token refreshed successfully',
                {
                    'access_token': access_token,
                    'refresh_token': new_refresh_token.token,
                    'user': user.to_dict()
                }
            )
        
        return success_response(
            'Token refreshed successfully',
            {
                'access_token': access_token,
                'user': user.to_dict()
            }
        )
        
    except Exception as e:
        return error_response(f'Token refresh failed: {str(e)}', status_code=HTTP_INTERNAL_SERVER_ERROR)

@token_bp.route('/revoke', methods=['POST'])
@jwt_required()
def revoke_refresh_token():
    """
    Revoke a refresh token
    """
    try:
        user_id = int(get_jwt_identity())
        data = request.get_json()
        refresh_token_str = data.get('refresh_token')
        
        if not refresh_token_str:
            return error_response('Refresh token required', status_code=HTTP_BAD_REQUEST)
        
        # Find and revoke token
        refresh_token = RefreshToken.query.filter_by(
            token=refresh_token_str,
            user_id=user_id
        ).first()
        
        if not refresh_token:
            return error_response('Refresh token not found', status_code=HTTP_NOT_FOUND)
        
        refresh_token.revoke()
        db.session.commit()
        
        return success_response('Refresh token revoked successfully')
        
    except Exception as e:
        return error_response(f'Token revocation failed: {str(e)}', status_code=HTTP_INTERNAL_SERVER_ERROR)

@token_bp.route('/revoke-all', methods=['POST'])
@jwt_required()
def revoke_all_tokens():
    """
    Revoke all refresh tokens for current user
    """
    try:
        user_id = int(get_jwt_identity())
        
        # Revoke all user's tokens
        tokens = RefreshToken.query.filter_by(user_id=user_id, revoked=False).all()
        
        for token in tokens:
            token.revoke()
        
        db.session.commit()
        
        return success_response(
            f'Successfully revoked {len(tokens)} refresh tokens'
        )
        
    except Exception as e:
        return error_response(f'Token revocation failed: {str(e)}', status_code=HTTP_INTERNAL_SERVER_ERROR)

@token_bp.route('/list', methods=['GET'])
@jwt_required()
def list_refresh_tokens():
    """
    List all active refresh tokens for current user
    """
    try:
        user_id = int(get_jwt_identity())
        
        tokens = RefreshToken.query.filter_by(
            user_id=user_id,
            revoked=False
        ).order_by(RefreshToken.created_at.desc()).all()
        
        return success_response(
            'Refresh tokens retrieved successfully',
            {
                'tokens': [token.to_dict() for token in tokens],
                'total': len(tokens)
            }
        )
        
    except Exception as e:
        return error_response(f'Failed to retrieve tokens: {str(e)}', status_code=HTTP_INTERNAL_SERVER_ERROR)

@token_bp.route('/cleanup', methods=['POST'])
@jwt_required()
def cleanup_expired_tokens():
    """
    Cleanup expired refresh tokens (admin only)
    """
    try:
        # In production, add admin check here
        count = RefreshToken.cleanup_expired()
        
        return success_response(
            f'Cleaned up {count} expired tokens'
        )
        
    except Exception as e:
        return error_response(f'Cleanup failed: {str(e)}', status_code=HTTP_INTERNAL_SERVER_ERROR)
