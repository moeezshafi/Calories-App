"""
Analytics Tasks
Background tasks for calculating analytics
"""

from celery_app import celery
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


@celery.task
def calculate_daily_analytics(user_id: int, date: str) -> Dict[str, Any]:
    """
    Calculate daily analytics for a user
    
    Args:
        user_id: User ID
        date: Date string (YYYY-MM-DD)
    
    Returns:
        Dictionary with analytics data
    """
    try:
        from models.food_log import FoodLog
        from datetime import datetime, timedelta
        
        logger.info(f"Calculating daily analytics for user {user_id} on {date}")
        
        # Parse date
        target_date = datetime.strptime(date, '%Y-%m-%d').date()
        
        # Get food logs for the day
        logs = FoodLog.query.filter(
            FoodLog.user_id == user_id,
            FoodLog.consumed_at >= target_date,
            FoodLog.consumed_at < target_date + timedelta(days=1)
        ).all()
        
        # Calculate totals
        total_calories = sum(log.calories * log.servings_consumed for log in logs)
        total_proteins = sum((log.proteins or 0) * log.servings_consumed for log in logs)
        total_carbs = sum((log.carbs or 0) * log.servings_consumed for log in logs)
        total_fats = sum((log.fats or 0) * log.servings_consumed for log in logs)
        
        analytics = {
            'user_id': user_id,
            'date': date,
            'total_calories': round(total_calories, 2),
            'total_proteins': round(total_proteins, 2),
            'total_carbs': round(total_carbs, 2),
            'total_fats': round(total_fats, 2),
            'meals_logged': len(logs),
            'calculated_at': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Daily analytics calculated for user {user_id}")
        return {
            'success': True,
            'data': analytics
        }
        
    except Exception as e:
        logger.error(f"Error calculating daily analytics: {str(e)}")
        return {'success': False, 'error': str(e)}


@celery.task
def calculate_weekly_analytics(user_id: int, start_date: str) -> Dict[str, Any]:
    """
    Calculate weekly analytics for a user
    
    Args:
        user_id: User ID
        start_date: Week start date string (YYYY-MM-DD)
    
    Returns:
        Dictionary with analytics data
    """
    try:
        from models.food_log import FoodLog
        from datetime import datetime, timedelta
        
        logger.info(f"Calculating weekly analytics for user {user_id} starting {start_date}")
        
        # Parse date
        week_start = datetime.strptime(start_date, '%Y-%m-%d').date()
        week_end = week_start + timedelta(days=7)
        
        # Get food logs for the week
        logs = FoodLog.query.filter(
            FoodLog.user_id == user_id,
            FoodLog.consumed_at >= week_start,
            FoodLog.consumed_at < week_end
        ).all()
        
        # Calculate daily averages
        daily_calories = {}
        for log in logs:
            day = log.consumed_at.date().isoformat()
            if day not in daily_calories:
                daily_calories[day] = 0
            daily_calories[day] += log.calories * log.servings_consumed
        
        avg_daily_calories = sum(daily_calories.values()) / 7 if daily_calories else 0
        
        analytics = {
            'user_id': user_id,
            'week_start': start_date,
            'week_end': week_end.isoformat(),
            'avg_daily_calories': round(avg_daily_calories, 2),
            'days_logged': len(daily_calories),
            'total_meals': len(logs),
            'daily_breakdown': daily_calories,
            'calculated_at': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Weekly analytics calculated for user {user_id}")
        return {
            'success': True,
            'data': analytics
        }
        
    except Exception as e:
        logger.error(f"Error calculating weekly analytics: {str(e)}")
        return {'success': False, 'error': str(e)}


@celery.task
def generate_monthly_report(user_id: int, year: int, month: int) -> Dict[str, Any]:
    """
    Generate monthly nutrition report
    
    Args:
        user_id: User ID
        year: Year
        month: Month (1-12)
    
    Returns:
        Dictionary with report data
    """
    try:
        from models.food_log import FoodLog
        from datetime import datetime
        from calendar import monthrange
        
        logger.info(f"Generating monthly report for user {user_id}: {year}-{month}")
        
        # Get month date range
        _, last_day = monthrange(year, month)
        month_start = datetime(year, month, 1)
        month_end = datetime(year, month, last_day, 23, 59, 59)
        
        # Get all logs for the month
        logs = FoodLog.query.filter(
            FoodLog.user_id == user_id,
            FoodLog.consumed_at >= month_start,
            FoodLog.consumed_at <= month_end
        ).all()
        
        # Calculate statistics
        total_calories = sum(log.calories * log.servings_consumed for log in logs)
        avg_daily_calories = total_calories / last_day if logs else 0
        
        report = {
            'user_id': user_id,
            'year': year,
            'month': month,
            'total_calories': round(total_calories, 2),
            'avg_daily_calories': round(avg_daily_calories, 2),
            'total_meals': len(logs),
            'days_logged': len(set(log.consumed_at.date() for log in logs)),
            'generated_at': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Monthly report generated for user {user_id}")
        return {
            'success': True,
            'data': report
        }
        
    except Exception as e:
        logger.error(f"Error generating monthly report: {str(e)}")
        return {'success': False, 'error': str(e)}
