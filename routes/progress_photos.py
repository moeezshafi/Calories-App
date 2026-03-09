from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from models.progress_photo import ProgressPhoto
from models.weight_log import WeightLog
from utils.error_handlers import success_response, error_response
from utils.constants import *
from utils.helpers import save_uploaded_image, allowed_file
from datetime import datetime
import os

progress_photos_bp = Blueprint('progress_photos', __name__)


@progress_photos_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_progress_photo():
    """Upload a progress photo"""
    try:
        user_id = get_current_user_id()

        if 'photo' not in request.files:
            return error_response('No photo provided', status_code=HTTP_BAD_REQUEST)

        photo_file = request.files['photo']
        if photo_file.filename == '':
            return error_response('No photo selected', status_code=HTTP_BAD_REQUEST)

        if not allowed_file(photo_file.filename):
            return error_response(ERROR_INVALID_FILE_TYPE, status_code=HTTP_BAD_REQUEST)

        # Save file
        upload_dir = os.path.join('uploads', 'progress_photos', str(user_id))
        os.makedirs(upload_dir, exist_ok=True)
        photo_path = save_uploaded_image(photo_file, upload_dir)

        # Get latest weight for context
        latest_weight = WeightLog.query.filter_by(user_id=user_id).order_by(
            WeightLog.logged_at.desc()
        ).first()

        notes = request.form.get('notes', '')

        progress_photo = ProgressPhoto(
            user_id=user_id,
            photo_path=photo_path,
            weight_at_time=latest_weight.weight_kg if latest_weight else None,
            notes=notes,
            taken_at=datetime.utcnow()
        )

        db.session.add(progress_photo)
        db.session.commit()

        return success_response('Progress photo uploaded', data=progress_photo.to_dict(), status_code=HTTP_CREATED)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to upload progress photo', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@progress_photos_bp.route('/', methods=['GET'])
@jwt_required()
def get_progress_photos():
    """Get all progress photos for the user"""
    try:
        user_id = get_current_user_id()

        photos = ProgressPhoto.query.filter_by(user_id=user_id).order_by(
            ProgressPhoto.taken_at.desc()
        ).all()

        return success_response('Progress photos retrieved', data={
            'photos': [p.to_dict() for p in photos],
            'count': len(photos)
        })

    except Exception as e:
        return error_response('Failed to get progress photos', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)


@progress_photos_bp.route('/<int:photo_id>', methods=['DELETE'])
@jwt_required()
def delete_progress_photo(photo_id):
    """Delete a progress photo"""
    try:
        user_id = get_current_user_id()

        photo = ProgressPhoto.query.filter_by(id=photo_id, user_id=user_id).first()
        if not photo:
            return error_response('Progress photo not found', status_code=HTTP_NOT_FOUND)

        # Delete file from disk
        if photo.photo_path and os.path.exists(photo.photo_path):
            os.remove(photo.photo_path)

        db.session.delete(photo)
        db.session.commit()

        return success_response(SUCCESS_DELETE)

    except Exception as e:
        db.session.rollback()
        return error_response('Failed to delete progress photo', errors=str(e), status_code=HTTP_INTERNAL_SERVER_ERROR)
