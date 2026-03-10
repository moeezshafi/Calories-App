# Backend API Documentation

## Base URL

```
Production: http://46.62.254.185:5001
Development: http://localhost:5000
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### POST /api/auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/token/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Food Logging Endpoints

#### POST /api/food/analyze
Analyze food image using AI.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
image: <file>
```

**Response (200):**
```json
{
  "food_name": "Grilled Chicken Breast",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 3.6,
  "fiber": 0,
  "sugar": 0,
  "serving_size": "100g",
  "confidence": 0.95
}
```

#### POST /api/food/log
Log a food entry.

**Request Body:**
```json
{
  "food_name": "Grilled Chicken Breast",
  "calories": 165,
  "protein": 31,
  "carbs": 0,
  "fat": 3.6,
  "fiber": 0,
  "sugar": 0,
  "serving_size": "100g",
  "meal_type": "lunch",
  "date": "2026-03-10",
  "image_url": "/uploads/food_123.jpg"
}
```

**Response (201):**
```json
{
  "message": "Food logged successfully",
  "food_log": {
    "id": 123,
    "food_name": "Grilled Chicken Breast",
    "calories": 165,
    "meal_type": "lunch",
    "date": "2026-03-10",
    "created_at": "2026-03-10T12:30:00Z"
  }
}
```

#### GET /api/food/logs
Get user's food logs.

**Query Parameters:**
- `date` (optional): Filter by date (YYYY-MM-DD)
- `meal_type` (optional): Filter by meal type
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

**Response (200):**
```json
{
  "logs": [
    {
      "id": 123,
      "food_name": "Grilled Chicken Breast",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "meal_type": "lunch",
      "date": "2026-03-10",
      "image_url": "/uploads/food_123.jpg"
    }
  ],
  "total": 1,
  "date_summary": {
    "total_calories": 165,
    "total_protein": 31,
    "total_carbs": 0,
    "total_fat": 3.6
  }
}
```

#### DELETE /api/food/log/<log_id>
Delete a food log entry.

**Response (200):**
```json
{
  "message": "Food log deleted successfully"
}
```

### User Profile Endpoints

#### GET /api/user/profile
Get user profile information.

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "age": 30,
  "gender": "male",
  "height": 175,
  "weight": 75,
  "target_weight": 70,
  "activity_level": "moderate",
  "goal": "lose_weight",
  "daily_calorie_goal": 2000,
  "daily_protein_goal": 150,
  "daily_carbs_goal": 200,
  "daily_fat_goal": 65,
  "created_at": "2026-01-01T00:00:00Z"
}
```

#### PUT /api/user/profile
Update user profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "age": 30,
  "height": 175,
  "weight": 75,
  "target_weight": 70,
  "activity_level": "moderate",
  "goal": "lose_weight"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "profile": { ... }
}
```

### Water Tracking Endpoints

#### POST /api/water/log
Log water intake.

**Request Body:**
```json
{
  "amount_ml": 250,
  "date": "2026-03-10",
  "time": "14:30:00"
}
```

**Response (201):**
```json
{
  "message": "Water logged successfully",
  "log": {
    "id": 456,
    "amount_ml": 250,
    "date": "2026-03-10",
    "time": "14:30:00"
  }
}
```

#### GET /api/water/logs
Get water intake logs.

**Query Parameters:**
- `date` (optional): Filter by date
- `start_date` (optional): Range start
- `end_date` (optional): Range end

**Response (200):**
```json
{
  "logs": [
    {
      "id": 456,
      "amount_ml": 250,
      "date": "2026-03-10",
      "time": "14:30:00"
    }
  ],
  "total_ml": 2000,
  "goal_ml": 2500,
  "percentage": 80
}
```

### Weight Tracking Endpoints

#### POST /api/weight/log
Log weight measurement.

**Request Body:**
```json
{
  "weight_kg": 74.5,
  "date": "2026-03-10",
  "notes": "Morning weight"
}
```

**Response (201):**
```json
{
  "message": "Weight logged successfully",
  "log": {
    "id": 789,
    "weight_kg": 74.5,
    "date": "2026-03-10",
    "bmi": 24.3
  }
}
```

#### GET /api/weight/logs
Get weight history.

**Query Parameters:**
- `start_date` (optional): Range start
- `end_date` (optional): Range end
- `limit` (optional): Number of results

**Response (200):**
```json
{
  "logs": [
    {
      "id": 789,
      "weight_kg": 74.5,
      "date": "2026-03-10",
      "bmi": 24.3
    }
  ],
  "current_weight": 74.5,
  "target_weight": 70,
  "progress": 5.5,
  "trend": "decreasing"
}
```

### Steps Tracking Endpoints

#### POST /api/steps/log
Log daily steps.

**Request Body:**
```json
{
  "steps": 8500,
  "date": "2026-03-10",
  "calories_burned": 340
}
```

**Response (201):**
```json
{
  "message": "Steps logged successfully",
  "log": {
    "id": 101,
    "steps": 8500,
    "date": "2026-03-10",
    "calories_burned": 340
  }
}
```

#### GET /api/steps/logs
Get steps history.

**Response (200):**
```json
{
  "logs": [
    {
      "id": 101,
      "steps": 8500,
      "date": "2026-03-10",
      "calories_burned": 340
    }
  ],
  "daily_goal": 10000,
  "average_steps": 7800,
  "total_steps_week": 54600
}
```

### Analytics Endpoints

#### GET /api/analytics/summary
Get comprehensive analytics summary.

**Query Parameters:**
- `period`: "day", "week", "month", "year"
- `date` (optional): Specific date

**Response (200):**
```json
{
  "period": "week",
  "calories": {
    "consumed": 14000,
    "goal": 14000,
    "average_daily": 2000,
    "remaining_today": 500
  },
  "macros": {
    "protein": { "consumed": 1050, "goal": 1050, "percentage": 100 },
    "carbs": { "consumed": 1400, "goal": 1400, "percentage": 100 },
    "fat": { "consumed": 455, "goal": 455, "percentage": 100 }
  },
  "water": {
    "consumed_ml": 17500,
    "goal_ml": 17500,
    "average_daily": 2500
  },
  "weight": {
    "current": 74.5,
    "change": -0.5,
    "trend": "decreasing"
  },
  "steps": {
    "total": 54600,
    "average_daily": 7800,
    "goal": 10000
  }
}
```

#### GET /api/analytics/nutrition-insights
Get detailed nutritional insights.

**Response (200):**
```json
{
  "insights": [
    {
      "type": "warning",
      "message": "Protein intake below target for 3 days",
      "recommendation": "Consider adding protein-rich foods"
    },
    {
      "type": "success",
      "message": "Consistent calorie tracking for 7 days",
      "recommendation": "Keep up the good work!"
    }
  ],
  "nutrient_breakdown": {
    "vitamins": { ... },
    "minerals": { ... }
  }
}
```

### Meal Planning Endpoints

#### POST /api/meal-plans
Create a meal plan.

**Request Body:**
```json
{
  "name": "Weekly Meal Plan",
  "start_date": "2026-03-10",
  "end_date": "2026-03-16",
  "meals": [
    {
      "date": "2026-03-10",
      "meal_type": "breakfast",
      "food_items": [...]
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Meal plan created successfully",
  "meal_plan": { ... }
}
```

#### GET /api/meal-plans
Get user's meal plans.

**Response (200):**
```json
{
  "meal_plans": [
    {
      "id": 1,
      "name": "Weekly Meal Plan",
      "start_date": "2026-03-10",
      "end_date": "2026-03-16",
      "total_calories": 14000
    }
  ]
}
```

### Recipe Endpoints

#### POST /api/recipes
Create a custom recipe.

**Request Body:**
```json
{
  "name": "Protein Smoothie",
  "ingredients": [
    {
      "name": "Banana",
      "amount": "1 medium",
      "calories": 105
    },
    {
      "name": "Protein Powder",
      "amount": "30g",
      "calories": 120
    }
  ],
  "instructions": "Blend all ingredients...",
  "servings": 1,
  "prep_time": 5,
  "total_calories": 225
}
```

**Response (201):**
```json
{
  "message": "Recipe created successfully",
  "recipe": { ... }
}
```

#### GET /api/recipes
Get user's recipes.

**Response (200):**
```json
{
  "recipes": [
    {
      "id": 1,
      "name": "Protein Smoothie",
      "total_calories": 225,
      "servings": 1,
      "prep_time": 5
    }
  ]
}
```

### Badges Endpoints

#### GET /api/badges
Get user's achievement badges.

**Response (200):**
```json
{
  "badges": [
    {
      "id": 1,
      "name": "First Week",
      "description": "Logged food for 7 consecutive days",
      "icon": "trophy",
      "earned_at": "2026-03-10T00:00:00Z"
    }
  ],
  "total_badges": 1,
  "available_badges": 15
}
```

### Progress Photos Endpoints

#### POST /api/progress-photos
Upload a progress photo.

**Headers:**
```
Content-Type: multipart/form-data
```

**Request Body:**
```
image: <file>
date: "2026-03-10"
weight_kg: 74.5
notes: "Front view"
```

**Response (201):**
```json
{
  "message": "Progress photo uploaded successfully",
  "photo": {
    "id": 1,
    "image_url": "/uploads/progress_123.jpg",
    "date": "2026-03-10",
    "weight_kg": 74.5
  }
}
```

#### GET /api/progress-photos
Get progress photos.

**Response (200):**
```json
{
  "photos": [
    {
      "id": 1,
      "image_url": "/uploads/progress_123.jpg",
      "date": "2026-03-10",
      "weight_kg": 74.5,
      "thumbnail_url": "/uploads/progress_123_thumb.jpg"
    }
  ]
}
```

### Search Endpoints

#### GET /api/search/foods
Search for foods in database.

**Query Parameters:**
- `q`: Search query
- `limit`: Number of results (default: 20)

**Response (200):**
```json
{
  "results": [
    {
      "id": 1,
      "name": "Chicken Breast",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "serving_size": "100g"
    }
  ],
  "total": 1
}
```

### Preferences Endpoints

#### GET /api/preferences
Get user preferences.

**Response (200):**
```json
{
  "preferences": {
    "language": "en",
    "theme": "light",
    "notifications_enabled": true,
    "reminder_times": ["08:00", "12:00", "18:00"],
    "units": "metric"
  }
}
```

#### PUT /api/preferences
Update user preferences.

**Request Body:**
```json
{
  "language": "ar",
  "theme": "dark",
  "notifications_enabled": true
}
```

**Response (200):**
```json
{
  "message": "Preferences updated successfully",
  "preferences": { ... }
}
```

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### HTTP Status Codes

- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authentication endpoints**: 5 requests per minute
- **Image upload endpoints**: 10 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1678454400
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `limit`: Number of results per page (default: 50, max: 100)
- `offset`: Number of results to skip

**Response Headers:**
```
X-Total-Count: 150
X-Page-Limit: 50
X-Page-Offset: 0
```

## API Versioning

Current version: v1 (implicit)

Future versions will use URL versioning:
```
/api/v2/endpoint
```

---

For additional support or questions about the API, please contact the development team.
