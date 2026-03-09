"""
Authentication Tests
"""

import pytest
from models.user import User

class TestRegistration:
    """Test user registration"""
    
    def test_successful_registration(self, client, session):
        """Test successful user registration"""
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
        assert 'access_token' in response.json['data']
        assert response.json['data']['user']['email'] == 'newuser@example.com'
    
    def test_registration_missing_fields(self, client):
        """Test registration with missing fields"""
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com'
        })
        
        assert response.status_code == 400
        assert 'error' in response.json
    
    def test_registration_invalid_email(self, client):
        """Test registration with invalid email"""
        response = client.post('/api/auth/register', json={
            'email': 'invalid-email',
            'password': 'SecurePass123!',
            'name': 'Test User'
        })
        
        assert response.status_code == 400
    
    def test_registration_weak_password(self, client):
        """Test registration with weak password"""
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com',
            'password': 'weak',
            'name': 'Test User'
        })
        
        assert response.status_code == 400
    
    def test_registration_duplicate_email(self, client, test_user):
        """Test registration with existing email"""
        response = client.post('/api/auth/register', json={
            'email': 'test@example.com',
            'password': 'SecurePass123!',
            'name': 'Another User'
        })
        
        assert response.status_code == 409

class TestLogin:
    """Test user login"""
    
    def test_successful_login(self, client, test_user):
        """Test successful login"""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'TestPass123!'
        })
        
        assert response.status_code == 200
        assert 'access_token' in response.json['data']
        assert 'refresh_token' in response.json['data']
    
    def test_login_invalid_credentials(self, client, test_user):
        """Test login with invalid credentials"""
        response = client.post('/api/auth/login', json={
            'email': 'test@example.com',
            'password': 'WrongPassword'
        })
        
        assert response.status_code == 401
    
    def test_login_nonexistent_user(self, client, db):
        """Test login with nonexistent user"""
        response = client.post('/api/auth/login', json={
            'email': 'nonexistent@example.com',
            'password': 'TestPass123!'
        })
        
        assert response.status_code == 401

class TestProfile:
    """Test profile endpoints"""
    
    def test_get_profile(self, client, auth_headers):
        """Test getting user profile"""
        response = client.get('/api/user/profile', headers=auth_headers)
        
        assert response.status_code == 200
        assert 'user' in response.json['data']
    
    def test_get_profile_unauthorized(self, client):
        """Test getting profile without authentication"""
        response = client.get('/api/user/profile')
        
        assert response.status_code == 401
