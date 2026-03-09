-- Database Optimization: Add Indexes
-- Run this after initial migration to improve query performance

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);
CREATE INDEX IF NOT EXISTS idx_user_name ON user(name);
CREATE INDEX IF NOT EXISTS idx_user_is_active ON user(is_active);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON user(created_at);

-- Food Log table indexes
CREATE INDEX IF NOT EXISTS idx_food_log_user_id ON food_log(user_id);
CREATE INDEX IF NOT EXISTS idx_food_log_food_name ON food_log(food_name);
CREATE INDEX IF NOT EXISTS idx_food_log_consumed_at ON food_log(consumed_at);
CREATE INDEX IF NOT EXISTS idx_food_log_created_at ON food_log(created_at);
CREATE INDEX IF NOT EXISTS idx_food_log_meal_type ON food_log(meal_type);

-- Custom Food table indexes
CREATE INDEX IF NOT EXISTS idx_custom_food_user_id ON custom_food(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_food_name ON custom_food(name);
CREATE INDEX IF NOT EXISTS idx_custom_food_barcode ON custom_food(barcode);
CREATE INDEX IF NOT EXISTS idx_custom_food_created_at ON custom_food(created_at);

-- Refresh Token table indexes
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_token(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_token ON refresh_token(token);
CREATE INDEX IF NOT EXISTS idx_refresh_token_is_revoked ON refresh_token(is_revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_token_created_at ON refresh_token(created_at);
CREATE INDEX IF NOT EXISTS idx_refresh_token_expires_at ON refresh_token(expires_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_food_log_user_date ON food_log(user_id, consumed_at);
CREATE INDEX IF NOT EXISTS idx_food_log_user_meal ON food_log(user_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_active ON refresh_token(user_id, is_revoked);
