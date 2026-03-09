"""
Validator Tests
"""

import pytest
from utils.validators import (
    validate_email,
    validate_password,
    sanitize_input,
    sanitize_html,
    validate_file_upload
)

class TestEmailValidation:
    """Test email validation"""
    
    def test_valid_email(self):
        assert validate_email('test@example.com') == True
        assert validate_email('user.name@domain.co.uk') == True
    
    def test_invalid_email(self):
        assert validate_email('invalid') == False
        assert validate_email('@example.com') == False
        assert validate_email('test@') == False

class TestPasswordValidation:
    """Test password validation"""
    
    def test_valid_password(self):
        result = validate_password('SecurePass123!')
        assert result['valid'] == True
    
    def test_short_password(self):
        result = validate_password('Short1!')
        assert result['valid'] == False
        assert 'at least 8 characters' in result['message']
    
    def test_no_uppercase(self):
        result = validate_password('lowercase123!')
        assert result['valid'] == False
    
    def test_no_lowercase(self):
        result = validate_password('UPPERCASE123!')
        assert result['valid'] == False
    
    def test_no_digit(self):
        result = validate_password('NoDigits!')
        assert result['valid'] == False
    
    def test_no_special_char(self):
        result = validate_password('NoSpecial123')
        assert result['valid'] == False
    
    def test_common_password(self):
        result = validate_password('Password123!')
        assert result['valid'] == False
        assert 'too common' in result['message']

class TestInputSanitization:
    """Test input sanitization"""
    
    def test_sanitize_normal_input(self):
        result = sanitize_input('  normal text  ')
        assert result == 'normal text'
    
    def test_sanitize_null_bytes(self):
        result = sanitize_input('text\x00with\x00nulls')
        assert '\x00' not in result
    
    def test_sanitize_html(self):
        result = sanitize_html('<script>alert("xss")</script>')
        assert '<script>' not in result
        assert '&lt;script&gt;' in result
