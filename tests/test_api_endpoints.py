"""
API Endpoint Tests
Comprehensive testing of all API endpoints
"""

import pytest
import json
from datetime import datetime

class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self, client):
        """Test health check returns 200"""
        response = client.get('/api/health')
        assert response.status_code == 200
        assert response.json['status'] == 'healthy'

class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_register_success(self, client, session):
        """Test successful registration"""
        response = client.post('/api/auth/register', json={
            'email': 'newuser@example.com',
            'password': 'SecurePass123!',
            'name': 'New User',
            'age': 25,
            'weight': 70,
            'height': 170,
            'gender': 'female'
        })
        
        assert response.status_code == 201
        data = response.json['data']
        assert 'access_token' in data
        assert 'refresh_token' in data
        assert data['user']['email'] == 'newuser@example.com'
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registration with existing email"""
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com',
            'password': 'SecurePass123!',
            'name': 'Another User'
        })
        
        assert response.status_code == 409
    
    def test_register_weak_password(self, client):
        """Test registration with weak password"""
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com',
            'password': 'weak',
            'name': 'Test User'
        })
        
        assert response.status_code == 400
    
    def test_login_success(self, client, test_user):
        """Test successful login"""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        
        assert response.status_code == 200
        data = response.json['data']
        assert 'access_token' in data
        assert 'refresh_token' in data
    
    def test_login_invalid_credentials(self, client, test_user):
        """Test login with wrong password"""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'WrongPassword'
        })
        
        assert response.status_code == 401

class TestTokenEndpoints:
    """Test token management endpoints"""
    
    def test_refresh_token(self, client, test_user):
        """Test refreshing access token"""
        # Login first
        login_response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        refresh_token = login_response.json['data']['refresh_token']
        
        # Refresh token
        response = client.post('/api/token/refresh', json={
            'refresh_token': refresh_token
        })
        
        assert response.status_code == 200
        assert 'access_token' in response.json['data']
    
    def test_revoke_token(self, client, auth_headers, test_user):
        """Test revoking refresh token"""
        # Get refresh token
        login_response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        refresh_token = login_response.json['data']['refresh_token']
        
        # Revoke token
        response = client.post('/api/token/revoke', 
                              headers=auth_headers,
                              json={'refresh_token': refresh_token})
        
        assert response.status_code == 200

class TestUserEndpoints:
    """Test user management endpoints"""
    
    def test_get_profile(self, client, auth_headers):
        """Test getting user profile"""
        response = client.get('/api/user/profile', headers=auth_headers)
        
        assert response.status_code == 200
        assert 'user' in response.json['data']
    
    def test_update_profile(self, client, auth_headers):
        """Test updating user profile"""
        response = client.put('/api/user/profile', 
                             headers=auth_headers,
                             json={'weight': 76, 'age': 31})
        
        assert response.status_code == 200
        assert response.json['data']['user']['weight'] == 76

class TestFoodEndpoints:
    """Test food-related endpoints"""
    
    def test_log_food(self, client, auth_headers):
        """Test logging food"""
        response = client.post('/api/food/log',
                              headers=auth_headers,
                              json={
                                  'food_name': 'Banana',
                                  'serving_size': 100,
                                  'servings_consumed': 1,
                                  'calories': 89,
                                  'proteins': 1.1,
                                  'carbs': 22.8,
                                  'fats': 0.3,
                                  'meal_type': 'breakfast'
                              })
        
        assert response.status_code == 201
        assert response.json['food_log']['food_name'] == 'Banana'
    
    def test_get_food_logs(self, client, auth_headers):
        """Test getting food logs"""
        # Log a food first
        client.post('/api/food/log',
                   headers=auth_headers,
                   json={
                       'food_name': 'Apple',
                       'serving_size': 100,
                       'servings_consumed': 1,
                       'calories': 52,
                       'meal_type': 'snack'
                   })
        
        # Get logs
        response = client.get('/api/food/logs', headers=auth_headers)
        
        assert response.status_code == 200
        assert 'food_logs' in response.json
    
    def test_create_custom_food(self, client, auth_headers):
        """Test creating custom food"""
        response = client.post('/api/food/custom',
                              headers=auth_headers,
                              json={
                                  'name': 'My Custom Meal',
                                  'calories_per_100g': 250,
                                  'proteins_per_100g': 15,
                                  'carbs_per_100g': 30,
                                  'fats_per_100g': 10
                              })
        
        assert response.status_code == 201
        assert response.json['custom_food']['name'] == 'My Custom Meal'

class TestAnalyticsEndpoints:
    """Test analytics endpoints"""
    
    def test_daily_analytics(self, client, auth_headers):
        """Test getting daily analytics"""
        today = datetime.now().strftime('%Y-%m-%d')
        response = client.get(f'/api/analytics/daily/{today}', 
                             headers=auth_headers)
        
        assert response.status_code == 200
        assert 'calorie_progress' in response.json
    
    def test_weekly_analytics(self, client, auth_headers):
        """Test getting weekly analytics"""
        response = client.get('/api/analytics/weekly', 
                             headers=auth_headers)
        
        assert response.status_code == 200
        assert 'daily_data' in response.json
    
    def test_monthly_analytics(self, client, auth_headers):
        """Test getting monthly analytics"""
        response = client.get('/api/analytics/monthly?year=2026&month=3', 
                             headers=auth_headers)
        
        assert response.status_code == 200
        assert 'monthly_stats' in response.json

class TestSecurityFeatures:
    """Test security features"""
    
    def test_unauthorized_access(self, client):
        """Test accessing protected endpoint without auth"""
        response = client.get('/api/user/profile')
        assert response.status_code == 401
    
    def test_invalid_token(self, client):
        """Test accessing with invalid token"""
        headers = {'Authorization': 'Bearer invalid_token'}
        response = client.get('/api/user/profile', headers=headers)
        assert response.status_code == 422
    
    def test_xss_protection(self, client, auth_headers):
        """Test XSS protection in inputs"""
        response = client.post('/api/food/log',
                              headers=auth_headers,
                              json={
                                  'food_name': '<script>alert("xss")</script>',
                                  'serving_size': 100,
                                  'calories': 100,
                                  'meal_type': 'snack'
                              })
        
        # Should still create but sanitize
        assert response.status_code == 201
