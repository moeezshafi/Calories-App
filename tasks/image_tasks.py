"""
Image Processing Tasks
Background tasks for image analysis
"""

from celery_app import celery
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


@celery.task(bind=True, max_retries=3)
def process_food_image(self, image_path: str, user_id: int) -> Dict[str, Any]:
    """
    Process food image and extract nutritional information
    
    Args:
        image_path: Path to the image file
        user_id: User ID who uploaded the image
    
    Returns:
        Dictionary with nutritional information
    """
    try:
        from services.gemini_service import analyze_food_image
        
        logger.info(f"Processing image for user {user_id}: {image_path}")
        
        # Analyze image
        result = analyze_food_image(image_path)
        
        logger.info(f"Image processed successfully for user {user_id}")
        return {
            'success': True,
            'data': result,
            'user_id': user_id
        }
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        # Retry with exponential backoff
        raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@celery.task
def optimize_image(image_path: str, max_size: tuple = (1024, 1024)) -> str:
    """
    Optimize image size and quality
    
    Args:
        image_path: Path to the image file
        max_size: Maximum dimensions (width, height)
    
    Returns:
        Path to optimized image
    """
    try:
        from PIL import Image
        import os
        
        logger.info(f"Optimizing image: {image_path}")
        
        # Open and resize image
        with Image.open(image_path) as img:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save optimized image
            optimized_path = f"{os.path.splitext(image_path)[0]}_optimized.jpg"
            img.save(optimized_path, 'JPEG', quality=85, optimize=True)
        
        logger.info(f"Image optimized: {optimized_path}")
        return optimized_path
        
    except Exception as e:
        logger.error(f"Error optimizing image: {str(e)}")
        return image_path


@celery.task
def cleanup_old_images(days: int = 30) -> int:
    """
    Clean up images older than specified days
    
    Args:
        days: Number of days to keep images
    
    Returns:
        Number of images deleted
    """
    try:
        import os
        from datetime import datetime, timedelta
        
        logger.info(f"Cleaning up images older than {days} days")
        
        upload_folder = 'uploads'
        cutoff_date = datetime.now() - timedelta(days=days)
        deleted_count = 0
        
        if os.path.exists(upload_folder):
            for filename in os.listdir(upload_folder):
                file_path = os.path.join(upload_folder, filename)
                if os.path.isfile(file_path):
                    file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                    if file_time < cutoff_date:
                        os.remove(file_path)
                        deleted_count += 1
        
        logger.info(f"Cleaned up {deleted_count} old images")
        return deleted_count
        
    except Exception as e:
        logger.error(f"Error cleaning up images: {str(e)}")
        return 0
