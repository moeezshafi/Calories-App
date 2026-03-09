"""
Pytest Configuration and Fixtures
"""

import pytest
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from database import db as _db
from models.user import User
from models.food_log import FoodLog
from models.custom_food import CustomFood

@pytest.fixture(scope='session')
def app():
    """Create application for testing"""
    os.environ['TESTING'] = 'True'
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False
    
    return app

@pytest.fixture(scope='function')
def db(app):
    """Create database for testing"""
    with app.app_context():
        _db.create_all()
        yield _db
        # Clean up after each test
        _db.session.remove()
        _db.drop_all()

@pytest.fixture(scope='function')
def session(db, app):
    """Create a new database session for a test"""
    with app.app_context():
        yield db.session
        # Rollback any uncommitted changes
        db.session.rollback()

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def test_user(db):
    """Create a test user"""
    user = User(
        email='test@example.com',
        name='Test User',
        age=30,
        weight=75,
        height=175,
        gender='male',
        activity_level='moderate',
        goal_type='maintain'
    )
    user.set_password('TestPass123!')
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers"""
    response = client.post('/api/auth/login', json={
        'email': 'test@example.com',
        'password': 'TestPass123!'
    })
    token = response.json['data']['access_token']
    return {'Authorization': f'Bearer {token}'}
