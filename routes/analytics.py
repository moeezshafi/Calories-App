from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.auth_service import get_current_user_id
from database import db
from models.user import User
from models.food_log import FoodLog
from datetime import datetime, timedelta, date
from sqlalchemy import func, and_
from models.weight_log import WeightLog
from utils.cache import cache_manager, cache_key_for_user

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/daily/<date_str>', methods=['GET'])
@jwt_required()
def get_daily_analytics(date_str):
    """Get daily nutrition analytics for a specific date"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Parse date
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Get all food logs for the date
        food_logs = FoodLog.query.filter(
            FoodLog.user_id == user_id,
            func.date(FoodLog.consumed_at) == target_date
        ).all()
        
        # Calculate totals
        total_calories = sum(log.total_calories() for log in food_logs)
        total_proteins = sum(log.total_nutrients()['proteins'] for log in food_logs)
        total_carbs = sum(log.total_nutrients()['carbs'] for log in food_logs)
        total_fats = sum(log.total_nutrients()['fats'] for log in food_logs)
        total_fiber = sum(log.total_nutrients()['fiber'] for log in food_logs)
        total_sugars = sum(log.total_nutrients().get('sugars', 0) for log in food_logs)
        total_sodium = sum(log.total_nutrients()['sodium'] for log in food_logs)
        
        # Calculate meal breakdown
        meal_breakdown = {}
        for meal_type in ['breakfast', 'lunch', 'dinner', 'snack']:
            meal_logs = [log for log in food_logs if log.meal_type == meal_type]
            meal_calories = sum(log.total_calories() for log in meal_logs)
            
            meal_breakdown[meal_type] = {
                'calories': round(meal_calories, 2),
                'count': len(meal_logs),
                'foods': [log.food_name for log in meal_logs]
            }
        
        # Calculate progress vs goals
        calorie_goal = user.daily_calorie_goal or 2000
        calorie_progress = {
            'consumed': round(total_calories, 2),
            'goal': calorie_goal,
            'remaining': max(0, calorie_goal - total_calories),
            'percentage': round((total_calories / calorie_goal) * 100, 1) if calorie_goal > 0 else 0
        }
        
        # Macro breakdown (percentage of total calories)
        macro_breakdown = {
            'proteins': {
                'grams': round(total_proteins, 2),
                'calories': round(total_proteins * 4, 2),
                'percentage': round((total_proteins * 4 / total_calories) * 100, 1) if total_calories > 0 else 0
            },
            'carbs': {
                'grams': round(total_carbs, 2),
                'calories': round(total_carbs * 4, 2),
                'percentage': round((total_carbs * 4 / total_calories) * 100, 1) if total_calories > 0 else 0
            },
            'fats': {
                'grams': round(total_fats, 2),
                'calories': round(total_fats * 9, 2),
                'percentage': round((total_fats * 9 / total_calories) * 100, 1) if total_calories > 0 else 0
            }
        }
        
        response = {
            'date': date_str,
            'calorie_progress': calorie_progress,
            'totals': {
                'calories': round(total_calories, 2),
                'proteins': round(total_proteins, 2),
                'carbs': round(total_carbs, 2),
                'fats': round(total_fats, 2),
                'fiber': round(total_fiber, 2),
                'sugars': round(total_sugars, 2),
                'sodium': round(total_sodium, 2)
            },
            'macro_breakdown': macro_breakdown,
            'meal_breakdown': meal_breakdown,
            'food_count': len(food_logs)
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get daily analytics', 
            'details': str(e)
        }), 500

@analytics_bp.route('/weekly', methods=['GET'])
@jwt_required()
def get_weekly_analytics():
    """Get weekly nutrition analytics with caching"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get start date (default to current week)
        start_date_str = request.args.get('start_date')
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            today = date.today()
            start_date = today - timedelta(days=today.weekday())  # Monday of current week
        
        # Check cache
        cache_key = cache_key_for_user(user_id, 'analytics', 'weekly', start_date.isoformat())
        cached_result = cache_manager.get(cache_key)
        if cached_result:
            return jsonify(cached_result), 200
        
        end_date = start_date + timedelta(days=6)  # Sunday
        
        # Get all food logs for the week
        food_logs = FoodLog.query.filter(
            FoodLog.user_id == user_id,
            func.date(FoodLog.consumed_at) >= start_date,
            func.date(FoodLog.consumed_at) <= end_date
        ).all()
        
        # Group by day
        daily_data = {}
        for i in range(7):
            current_date = start_date + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            
            day_logs = [log for log in food_logs if log.consumed_at.date() == current_date]
            daily_calories = sum(log.total_calories() for log in day_logs)
            
            daily_data[date_str] = {
                'date': date_str,
                'day_name': current_date.strftime('%A'),
                'calories': round(daily_calories, 2),
                'food_count': len(day_logs)
            }
        
        # Calculate weekly averages
        total_calories = sum(log.total_calories() for log in food_logs)
        total_proteins = sum(log.total_nutrients()['proteins'] for log in food_logs)
        total_carbs = sum(log.total_nutrients()['carbs'] for log in food_logs)
        total_fats = sum(log.total_nutrients()['fats'] for log in food_logs)
        
        days_with_data = len([day for day in daily_data.values() if day['calories'] > 0])
        
        weekly_averages = {
            'avg_calories': round(total_calories / max(days_with_data, 1), 2),
            'avg_proteins': round(total_proteins / max(days_with_data, 1), 2),
            'avg_carbs': round(total_carbs / max(days_with_data, 1), 2),
            'avg_fats': round(total_fats / max(days_with_data, 1), 2)
        }
        
        response = {
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'daily_data': list(daily_data.values()),
            'weekly_totals': {
                'calories': round(total_calories, 2),
                'proteins': round(total_proteins, 2),
                'carbs': round(total_carbs, 2),
                'fats': round(total_fats, 2)
            },
            'weekly_averages': weekly_averages,
            'days_logged': days_with_data
        }
        
        # Cache for 5 minutes
        cache_manager.set(cache_key, response, ttl=300)
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get weekly analytics', 
            'details': str(e)
        }), 500

@analytics_bp.route('/monthly', methods=['GET'])
@jwt_required()
def get_monthly_analytics():
    """Get monthly nutrition analytics"""
    try:
        user_id = get_current_user_id()
        
        # Get month (default to current month)
        # Support both formats: month="YYYY-MM" or year=YYYY&month=MM
        month_str = request.args.get('month')
        year_param = request.args.get('year')
        month_param = request.args.get('month') if not month_str else None
        
        if month_str and '-' in str(month_str):
            # Format: YYYY-MM
            year, month = map(int, month_str.split('-'))
        elif year_param and month_param:
            # Format: year=YYYY&month=MM
            year = int(year_param)
            month = int(month_param)
        else:
            # Default to current month
            today = date.today()
            year, month = today.year, today.month
        
        # Calculate date range
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end_date = date(year, month + 1, 1) - timedelta(days=1)
        
        # Get all food logs for the month
        food_logs = FoodLog.query.filter(
            FoodLog.user_id == user_id,
            func.date(FoodLog.consumed_at) >= start_date,
            func.date(FoodLog.consumed_at) <= end_date
        ).all()
        
        # Group by day
        days_in_month = (end_date - start_date).days + 1
        daily_data = {}
        
        for i in range(days_in_month):
            current_date = start_date + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            
            day_logs = [log for log in food_logs if log.consumed_at.date() == current_date]
            daily_calories = sum(log.total_calories() for log in day_logs)
            
            daily_data[date_str] = {
                'date': date_str,
                'day': current_date.day,
                'calories': round(daily_calories, 2),
                'food_count': len(day_logs)
            }
        
        # Calculate monthly statistics
        total_calories = sum(log.total_calories() for log in food_logs)
        days_with_data = len([day for day in daily_data.values() if day['calories'] > 0])
        
        # Most frequently logged foods
        food_frequency = {}
        for log in food_logs:
            food_name = log.food_name
            if food_name in food_frequency:
                food_frequency[food_name] += 1
            else:
                food_frequency[food_name] = 1
        
        top_foods = sorted(food_frequency.items(), key=lambda x: x[1], reverse=True)[:10]
        
        response = {
            'month': f"{year}-{month:02d}",
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'daily_data': list(daily_data.values()),
            'monthly_stats': {
                'total_calories': round(total_calories, 2),
                'avg_daily_calories': round(total_calories / max(days_with_data, 1), 2),
                'days_logged': days_with_data,
                'total_days': days_in_month,
                'total_foods_logged': len(food_logs)
            },
            'top_foods': [{'name': name, 'count': count} for name, count in top_foods]
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get monthly analytics', 
            'details': str(e)
        }), 500

@analytics_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    """Get overall user analytics summary"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get total stats
        total_logs = FoodLog.query.filter_by(user_id=user_id).count()
        
        if total_logs == 0:
            return jsonify({
                'message': 'No food logs found',
                'total_logs': 0
            }), 200
        
        # Get date range of logging
        first_log = FoodLog.query.filter_by(user_id=user_id).order_by(FoodLog.consumed_at.asc()).first()
        last_log = FoodLog.query.filter_by(user_id=user_id).order_by(FoodLog.consumed_at.desc()).first()
        
        days_since_start = (last_log.consumed_at.date() - first_log.consumed_at.date()).days + 1
        
        # Calculate unique days logged
        unique_days = db.session.query(func.date(FoodLog.consumed_at)).filter_by(user_id=user_id).distinct().count()
        
        # Average calories per day (only counting days with logs)
        total_calories = db.session.query(func.sum(FoodLog.calories * FoodLog.servings_consumed)).filter_by(user_id=user_id).scalar() or 0
        avg_daily_calories = total_calories / max(unique_days, 1)
        
        # Most common meal types
        meal_type_counts = db.session.query(
            FoodLog.meal_type, 
            func.count(FoodLog.id)
        ).filter_by(user_id=user_id).group_by(FoodLog.meal_type).all()
        
        # Streak calculation - single query for all logged dates in past year
        current_streak = 0
        today = date.today()
        year_ago = today - timedelta(days=365)

        logged_dates = set(
            row[0] for row in db.session.query(
                func.date(FoodLog.consumed_at)
            ).filter(
                FoodLog.user_id == user_id,
                func.date(FoodLog.consumed_at) >= year_ago,
                func.date(FoodLog.consumed_at) <= today
            ).distinct().all()
        )

        for i in range(365):
            check_date = today - timedelta(days=i)
            if str(check_date) in {str(d) for d in logged_dates}:
                current_streak += 1
            else:
                break
        
        response = {
            'user_info': {
                'name': user.name,
                'daily_calorie_goal': user.daily_calorie_goal,
                'member_since': user.created_at.strftime('%Y-%m-%d')
            },
            'logging_stats': {
                'total_food_logs': total_logs,
                'unique_days_logged': unique_days,
                'days_since_start': days_since_start,
                'logging_frequency': round((unique_days / max(days_since_start, 1)) * 100, 1),
                'current_streak': current_streak,
                'first_log_date': first_log.consumed_at.strftime('%Y-%m-%d'),
                'last_log_date': last_log.consumed_at.strftime('%Y-%m-%d')
            },
            'nutrition_averages': {
                'avg_daily_calories': round(avg_daily_calories, 2),
                'total_calories_logged': round(total_calories, 2)
            },
            'meal_preferences': {
                meal_type: count for meal_type, count in meal_type_counts
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get summary analytics', 
            'details': str(e)
        }), 500

@analytics_bp.route('/ai-insights/<date_str>', methods=['GET'])
@jwt_required()
def get_ai_insights(date_str):
    """Get AI-powered nutrition insights for a specific date"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Parse date
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Get food logs for the date
        food_logs = FoodLog.query.filter(
            FoodLog.user_id == user_id,
            func.date(FoodLog.consumed_at) == target_date
        ).all()
        
        if not food_logs:
            return jsonify({
                'insights': 'No meals logged for this date. Start tracking your meals to get personalized AI insights!'
            }), 200
        
        # Prepare data for Gemini AI
        from services.gemini_service import get_nutrition_advice
        
        user_data = {
            'age': user.age,
            'weight': user.weight,
            'height': user.height,
            'gender': user.gender,
            'goal_type': user.goal_type,
            'activity_level': user.activity_level,
            'daily_calorie_goal': user.daily_calorie_goal
        }
        
        food_data = [{
            'food_name': log.food_name,
            'meal_type': log.meal_type,
            'total_calories': log.total_calories(),
            'proteins': log.proteins * log.servings_consumed,
            'carbs': log.carbs * log.servings_consumed,
            'fats': log.fats * log.servings_consumed,
            'fiber': log.fiber * log.servings_consumed
        } for log in food_logs]
        
        # Get AI insights
        insights = get_nutrition_advice(user_data, food_data)
        
        return jsonify({
            'date': date_str,
            'insights': insights,
            'meals_analyzed': len(food_logs)
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get AI insights', 
            'details': str(e)
        }), 500

@analytics_bp.route('/progress', methods=['GET'])
@jwt_required()
def get_progress():
    """Get progress analytics over time"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get period (default to last 30 days)
        period = request.args.get('period', '30')  # days
        try:
            days = int(period)
        except ValueError:
            return jsonify({'error': 'Invalid period. Must be a number of days'}), 400
        
        # Calculate date range
        end_date = date.today()
        start_date = end_date - timedelta(days=days-1)
        
        # Get food logs for the period
        food_logs = FoodLog.query.filter(
            FoodLog.user_id == user_id,
            func.date(FoodLog.consumed_at) >= start_date,
            func.date(FoodLog.consumed_at) <= end_date
        ).order_by(FoodLog.consumed_at.asc()).all()
        
        # Group by date for trend analysis
        daily_progress = {}
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            
            day_logs = [log for log in food_logs if log.consumed_at.date() == current_date]
            
            if day_logs:
                daily_calories = sum(log.total_calories() for log in day_logs)
                daily_nutrients = {
                    'proteins': sum(log.total_nutrients()['proteins'] for log in day_logs),
                    'carbs': sum(log.total_nutrients()['carbs'] for log in day_logs),
                    'fats': sum(log.total_nutrients()['fats'] for log in day_logs)
                }
                
                # Calculate goal achievement
                goal_achievement = 0
                if user.daily_calorie_goal and user.daily_calorie_goal > 0:
                    goal_achievement = round((daily_calories / user.daily_calorie_goal) * 100, 1)
                
                daily_progress[date_str] = {
                    'date': date_str,
                    'calories': round(daily_calories, 2),
                    'proteins': round(daily_nutrients['proteins'], 2),
                    'carbs': round(daily_nutrients['carbs'], 2),
                    'fats': round(daily_nutrients['fats'], 2),
                    'goal_achievement': goal_achievement,
                    'food_count': len(day_logs)
                }
            else:
                daily_progress[date_str] = {
                    'date': date_str,
                    'calories': 0,
                    'proteins': 0,
                    'carbs': 0,
                    'fats': 0,
                    'goal_achievement': 0,
                    'food_count': 0
                }
        
        # Calculate trends
        progress_data = list(daily_progress.values())
        calories_data = [day['calories'] for day in progress_data if day['calories'] > 0]
        
        # Simple trend calculation (comparing first half vs second half)
        if len(calories_data) >= 4:
            mid_point = len(calories_data) // 2
            first_half_avg = sum(calories_data[:mid_point]) / mid_point
            second_half_avg = sum(calories_data[mid_point:]) / (len(calories_data) - mid_point)
            
            trend = "increasing" if second_half_avg > first_half_avg else "decreasing"
            trend_percentage = round(((second_half_avg - first_half_avg) / first_half_avg) * 100, 1) if first_half_avg > 0 else 0
        else:
            trend = "stable"
            trend_percentage = 0
        
        response = {
            'period': f"{days} days",
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'daily_progress': progress_data,
            'trend_analysis': {
                'trend': trend,
                'trend_percentage': trend_percentage,
                'avg_daily_calories': round(sum(calories_data) / len(calories_data), 2) if calories_data else 0,
                'days_with_data': len(calories_data),
                'consistency_score': round((len(calories_data) / days) * 100, 1)
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to get progress analytics',
            'details': str(e)
        }), 500


@analytics_bp.route('/bmi', methods=['GET'])
@jwt_required()
def get_bmi():
    """Calculate and return BMI based on user profile or latest weight log"""
    try:
        user_id = get_current_user_id()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        height_cm = user.height
        if not height_cm:
            return jsonify({'error': 'Height not set in user profile'}), 400

        # Use latest weight log if available, otherwise fall back to user profile weight
        latest_weight_log = WeightLog.query.filter_by(user_id=user_id).order_by(
            WeightLog.logged_at.desc()
        ).first()

        weight_kg = latest_weight_log.weight_kg if latest_weight_log else user.weight
        if not weight_kg:
            return jsonify({'error': 'No weight data available'}), 400

        height_m = height_cm / 100.0
        bmi = round(weight_kg / (height_m * height_m), 1)

        # Determine BMI category
        if bmi < 18.5:
            category = 'Underweight'
        elif bmi < 25:
            category = 'Normal weight'
        elif bmi < 30:
            category = 'Overweight'
        else:
            category = 'Obese'

        return jsonify({
            'bmi': bmi,
            'category': category,
            'weight_kg': weight_kg,
            'height_cm': height_cm,
            'weight_source': 'weight_log' if latest_weight_log else 'profile'
        }), 200

    except Exception as e:
        return jsonify({
            'error': 'Failed to calculate BMI',
            'details': str(e)
        }), 500


@analytics_bp.route('/streak', methods=['GET'])
@jwt_required()
def get_streak():
    """Get the current logging streak"""
    try:
        user_id = get_current_user_id()

        today = date.today()
        year_ago = today - timedelta(days=365)

        logged_dates = set(
            row[0] for row in db.session.query(
                func.date(FoodLog.consumed_at)
            ).filter(
                FoodLog.user_id == user_id,
                func.date(FoodLog.consumed_at) >= year_ago,
                func.date(FoodLog.consumed_at) <= today
            ).distinct().all()
        )

        current_streak = 0
        for i in range(365):
            check_date = today - timedelta(days=i)
            if str(check_date) in {str(d) for d in logged_dates}:
                current_streak += 1
            else:
                break

        # Calculate longest streak
        longest_streak = 0
        streak = 0
        for i in range(365):
            check_date = today - timedelta(days=i)
            if str(check_date) in {str(d) for d in logged_dates}:
                streak += 1
                longest_streak = max(longest_streak, streak)
            else:
                streak = 0

        return jsonify({
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'total_days_logged': len(logged_dates)
        }), 200

    except Exception as e:
        return jsonify({
            'error': 'Failed to get streak',
            'details': str(e)
        }), 500