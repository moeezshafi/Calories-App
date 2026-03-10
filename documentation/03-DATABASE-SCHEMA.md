# Database Schema

## Overview

The application uses SQLite as the primary database with SQLAlchemy ORM for data management. The database consists of 18 tables organized to support user management, food tracking, analytics, and social features.

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┬──────────────┐
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ FoodLog  │   │WaterLog  │   │WeightLog │   │ StepLog  │   │UserPref  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
       │
       ▼
┌──────────────┐
│ CustomFood   │
└──────────────┘
       │
       ▼
┌──────────────┐
│  SavedFood   │
└──────────────┘
```

## Table Definitions

### 1. User Table

Stores user account information and authentication credentials.

```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    age INTEGER,
    gender VARCHAR(10),
    height FLOAT,
    weight FLOAT,
    target_weight FLOAT,
    activity_level VARCHAR(20),
    goal VARCHAR(20),
    daily_calorie_goal INTEGER DEFAULT 2000,
    daily_protein_goal INTEGER,
    daily_carbs_goal INTEGER,
    daily_fat_goal INTEGER,
    daily_water_goal INTEGER DEFAULT 2500,
    daily_step_goal INTEGER DEFAULT 10000,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- `idx_user_email` on `email`

**Relationships:**
- One-to-Many with `food_log`
- One-to-Many with `water_log`
- One-to-Many with `weight_log`
- One-to-Many with `step_log`
- One-to-One with `user_preference`

### 2. Food Log Table

Records all food entries logged by users.

```sql
CREATE TABLE food_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    food_name VARCHAR(200) NOT NULL,
    calories FLOAT NOT NULL,
    protein FLOAT DEFAULT 0,
    carbs FLOAT DEFAULT 0,
    fat FLOAT DEFAULT 0,
    fiber FLOAT DEFAULT 0,
    sugar FLOAT DEFAULT 0,
    sodium FLOAT DEFAULT 0,
    serving_size VARCHAR(50),
    amount_g FLOAT,
    meal_type VARCHAR(20),
    date DATE NOT NULL,
    time TIME,
    image_url VARCHAR(500),
    notes TEXT,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_food_log_user_date` on `user_id, date`
- `idx_food_log_meal_type` on `meal_type`

**Constraints:**
- `meal_type` CHECK IN ('breakfast', 'lunch', 'dinner', 'snack')

### 3. Custom Food Table

Stores user-created custom food items.

```sql
CREATE TABLE custom_food (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    calories FLOAT NOT NULL,
    protein FLOAT DEFAULT 0,
    carbs FLOAT DEFAULT 0,
    fat FLOAT DEFAULT 0,
    fiber FLOAT DEFAULT 0,
    sugar FLOAT DEFAULT 0,
    sodium FLOAT DEFAULT 0,
    serving_size VARCHAR(50),
    serving_unit VARCHAR(20),
    barcode VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_custom_food_user` on `user_id`
- `idx_custom_food_barcode` on `barcode`

### 4. Saved Food Table

Stores frequently used foods for quick access.

```sql
CREATE TABLE saved_food (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    food_name VARCHAR(200) NOT NULL,
    calories FLOAT NOT NULL,
    protein FLOAT DEFAULT 0,
    carbs FLOAT DEFAULT 0,
    fat FLOAT DEFAULT 0,
    serving_size VARCHAR(50),
    last_used DATETIME,
    use_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_saved_food_user` on `user_id`
- `idx_saved_food_last_used` on `last_used DESC`

### 5. Water Log Table

Tracks daily water intake.

```sql
CREATE TABLE water_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount_ml INTEGER NOT NULL,
    date DATE NOT NULL,
    time TIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_water_log_user_date` on `user_id, date`

### 6. Weight Log Table

Records weight measurements over time.

```sql
CREATE TABLE weight_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    weight_kg FLOAT NOT NULL,
    bmi FLOAT,
    body_fat_percentage FLOAT,
    muscle_mass FLOAT,
    date DATE NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_weight_log_user_date` on `user_id, date DESC`

### 7. Step Log Table

Tracks daily step count and activity.

```sql
CREATE TABLE step_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    steps INTEGER NOT NULL,
    distance_km FLOAT,
    calories_burned FLOAT,
    active_minutes INTEGER,
    date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_step_log_user_date` on `user_id, date`

### 8. User Preference Table

Stores user application preferences and settings.

```sql
CREATE TABLE user_preference (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    theme VARCHAR(20) DEFAULT 'light',
    units VARCHAR(10) DEFAULT 'metric',
    notifications_enabled BOOLEAN DEFAULT TRUE,
    reminder_breakfast TIME,
    reminder_lunch TIME,
    reminder_dinner TIME,
    reminder_water BOOLEAN DEFAULT TRUE,
    reminder_weight BOOLEAN DEFAULT TRUE,
    privacy_profile VARCHAR(20) DEFAULT 'private',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Constraints:**
- `language` CHECK IN ('en', 'ar')
- `theme` CHECK IN ('light', 'dark', 'auto')
- `units` CHECK IN ('metric', 'imperial')

### 9. Refresh Token Table

Manages JWT refresh tokens for authentication.

```sql
CREATE TABLE refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_refresh_token` on `token`
- `idx_refresh_token_user` on `user_id`

### 10. Badge Table

Defines available achievement badges.

```sql
CREATE TABLE badge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50),
    requirement_type VARCHAR(50),
    requirement_value INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Categories:**
- streak: Consecutive day achievements
- milestone: Weight/calorie milestones
- social: Community engagement
- consistency: Regular tracking

### 11. User Badge Table

Tracks badges earned by users.

```sql
CREATE TABLE user_badge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_id INTEGER NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (badge_id) REFERENCES badge(id) ON DELETE CASCADE,
    UNIQUE(user_id, badge_id)
);
```

**Indexes:**
- `idx_user_badge_user` on `user_id`

### 12. Progress Photo Table

Stores user progress photos.

```sql
CREATE TABLE progress_photo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    date DATE NOT NULL,
    weight_kg FLOAT,
    notes TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_progress_photo_user_date` on `user_id, date DESC`

### 13. Meal Plan Table

Stores user meal plans.

```sql
CREATE TABLE meal_plan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_calories INTEGER,
    is_template BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_meal_plan_user` on `user_id`
- `idx_meal_plan_dates` on `start_date, end_date`

### 14. Meal Plan Template Table

Stores reusable meal plan templates.

```sql
CREATE TABLE meal_plan_template (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_days INTEGER,
    target_calories INTEGER,
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

### 15. Recipe Table

Stores custom recipes created by users.

```sql
CREATE TABLE recipe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    instructions TEXT,
    prep_time INTEGER,
    cook_time INTEGER,
    servings INTEGER DEFAULT 1,
    total_calories FLOAT,
    total_protein FLOAT,
    total_carbs FLOAT,
    total_fat FLOAT,
    image_url VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_recipe_user` on `user_id`

### 16. Recipe Ingredient Table

Stores ingredients for recipes.

```sql
CREATE TABLE recipe_ingredient (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_id INTEGER NOT NULL,
    ingredient_name VARCHAR(200) NOT NULL,
    amount VARCHAR(50),
    unit VARCHAR(20),
    calories FLOAT,
    order_index INTEGER,
    FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_recipe_ingredient_recipe` on `recipe_id`

### 17. Meal Reminder Table

Stores meal reminder settings.

```sql
CREATE TABLE meal_reminder (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    meal_type VARCHAR(20) NOT NULL,
    reminder_time TIME NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    days_of_week VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_meal_reminder_user` on `user_id`

### 18. Exercise Log Table

Tracks exercise and physical activities.

```sql
CREATE TABLE exercise_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_name VARCHAR(200) NOT NULL,
    duration_minutes INTEGER,
    calories_burned FLOAT,
    intensity VARCHAR(20),
    date DATE NOT NULL,
    time TIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);
```

**Indexes:**
- `idx_exercise_log_user_date` on `user_id, date`

## Database Migrations

The application uses Alembic for database migrations.

### Migration Commands

```bash
# Create a new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback migration
flask db downgrade

# View migration history
flask db history
```

### Migration Files Location
```
migrations/
├── versions/
│   ├── 001_initial_schema.py
│   ├── 002_add_exercise_log.py
│   └── ...
└── env.py
```

## Data Integrity

### Foreign Key Constraints
All foreign keys use `ON DELETE CASCADE` to maintain referential integrity.

### Unique Constraints
- User email addresses
- Refresh tokens
- User-badge combinations

### Check Constraints
- Meal types (breakfast, lunch, dinner, snack)
- Gender values (male, female, other)
- Activity levels (sedentary, light, moderate, very_active, extra_active)
- Goals (lose_weight, maintain, gain_weight)

## Performance Optimization

### Indexes
Strategic indexes on frequently queried columns:
- User lookups by email
- Food logs by user and date
- Weight logs by user and date (descending)
- Saved foods by last used date

### Query Optimization
- Use of SQLAlchemy lazy loading for relationships
- Pagination for large result sets
- Selective column loading with `load_only()`
- Join optimization with `joinedload()`

## Backup and Recovery

### Backup Strategy
- Daily automated backups
- Backup location: `/var/backups/calorie-app/`
- Retention: 30 days

### Backup Command
```bash
sqlite3 /var/www/calorie-app/instance/calorie_app.db ".backup '/var/backups/calorie-app/backup_$(date +%Y%m%d).db'"
```

### Restore Command
```bash
sqlite3 /var/www/calorie-app/instance/calorie_app.db ".restore '/var/backups/calorie-app/backup_YYYYMMDD.db'"
```

## Database Statistics

### Current Schema Version
Version: 1.0.1

### Table Count
18 tables

### Estimated Storage
- Average user data: ~5-10 MB per year
- Image storage: Separate file system storage
- Database size limit: None (SQLite supports up to 281 TB)

## Future Considerations

### Planned Schema Changes
- Add social groups tables
- Add payment transaction tables
- Add notification history table
- Add user activity log table

### Migration to PostgreSQL
When user base exceeds 100,000 users, migration to PostgreSQL is recommended for:
- Better concurrent write performance
- Advanced indexing capabilities
- Full-text search
- JSON field support
- Better backup and replication

---

For database-related questions or schema modification requests, please contact the development team.
