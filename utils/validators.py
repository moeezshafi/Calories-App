import re
from email_validator import validate_email as email_validate, EmailNotValidError

# Common weak passwords to reject
COMMON_PASSWORDS = {
    'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
    'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
    'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
    'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
    'football', 'welcome', 'jesus', 'ninja', 'mustang', 'password1'
}

def validate_email(email):
    """Validate email format"""
    if not email:
        return False
    try:
        # Validate and normalize the email
        valid = email_validate(email, check_deliverability=False)
        return True
    except EmailNotValidError:
        return False
    except Exception:
        return False

def validate_password(password):
    """
    Validate password strength
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter  
    - At least one digit
    - At least one special character
    - Not a common password
    """
    if len(password) < 8:
        return {
            'valid': False,
            'message': 'Password must be at least 8 characters long'
        }
    
    if len(password) > 128:
        return {
            'valid': False,
            'message': 'Password must be less than 128 characters'
        }
    
    if not re.search(r'[A-Z]', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one uppercase letter'
        }
    
    if not re.search(r'[a-z]', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one lowercase letter'
        }
    
    if not re.search(r'\d', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one digit'
        }
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return {
            'valid': False,
            'message': 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'
        }
    
    # Check for sequential characters (4 or more in a row for stricter validation)
    lower_pass = password.lower()
    has_sequential = False
    for i in range(len(lower_pass) - 3):
        # Check numeric sequences (4+ digits)
        if lower_pass[i:i+4].isdigit():
            if (ord(lower_pass[i+1]) == ord(lower_pass[i]) + 1 and 
                ord(lower_pass[i+2]) == ord(lower_pass[i+1]) + 1 and
                ord(lower_pass[i+3]) == ord(lower_pass[i+2]) + 1):
                has_sequential = True
                break
        # Check alphabetic sequences (4+ letters)
        elif lower_pass[i:i+4].isalpha():
            if (ord(lower_pass[i+1]) == ord(lower_pass[i]) + 1 and 
                ord(lower_pass[i+2]) == ord(lower_pass[i+1]) + 1 and
                ord(lower_pass[i+3]) == ord(lower_pass[i+2]) + 1):
                has_sequential = True
                break
    
    if has_sequential:
        return {
            'valid': False,
            'message': 'Password contains sequential characters. Please choose a stronger password'
        }
    
    # Check against common passwords (strip special characters for comparison)
    password_alphanumeric = re.sub(r'[^a-z0-9]', '', password.lower())
    if password.lower() in COMMON_PASSWORDS or password_alphanumeric in COMMON_PASSWORDS:
        return {
            'valid': False,
            'message': 'Password is too common. Please choose a stronger password'
        }
    
    return {
        'valid': True,
        'message': 'Password is valid',
        'strength': calculate_password_strength(password)
    }

def calculate_password_strength(password):
    """
    Calculate password strength score (0-100)
    """
    score = 0
    
    # Length score (max 30 points)
    score += min(len(password) * 2, 30)
    
    # Character variety (max 40 points)
    if re.search(r'[a-z]', password):
        score += 10
    if re.search(r'[A-Z]', password):
        score += 10
    if re.search(r'\d', password):
        score += 10
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 10
    
    # Complexity bonus (max 30 points)
    unique_chars = len(set(password))
    score += min(unique_chars * 2, 30)
    
    return min(score, 100)

def validate_nutritional_data(data):
    """Validate nutritional data input"""
    errors = []
    
    # Check for required fields
    required_fields = ['calories']
    for field in required_fields:
        if field not in data or data[field] is None:
            errors.append(f'{field} is required')
    
    # Validate numeric fields
    numeric_fields = [
        'calories', 'proteins', 'carbs', 'fats', 
        'fiber', 'sodium', 'sugars', 'serving_size'
    ]
    
    for field in numeric_fields:
        if field in data and data[field] is not None:
            try:
                value = float(data[field])
                if value < 0:
                    errors.append(f'{field} cannot be negative')
            except (ValueError, TypeError):
                errors.append(f'{field} must be a valid number')
    
    # Validate serving size
    if 'serving_size' in data and data['serving_size'] is not None:
        try:
            serving_size = float(data['serving_size'])
            if serving_size <= 0:
                errors.append('Serving size must be greater than 0')
            elif serving_size > 10000:  # 10kg seems reasonable as max
                errors.append('Serving size seems unusually large')
        except (ValueError, TypeError):
            errors.append('Serving size must be a valid number')
    
    # Validate calorie reasonableness
    if 'calories' in data and data['calories'] is not None:
        try:
            calories = float(data['calories'])
            if calories > 10000:  # Per serving
                errors.append('Calories seem unusually high')
        except (ValueError, TypeError):
            pass  # Already handled above
    
    return {
        'valid': len(errors) == 0,
        'errors': errors
    }

def validate_user_profile(data):
    """Validate user profile data"""
    errors = []
    
    # Age validation
    if 'age' in data and data['age'] is not None:
        try:
            age = int(data['age'])
            if age < 13 or age > 120:
                errors.append('Age must be between 13 and 120')
        except (ValueError, TypeError):
            errors.append('Age must be a valid number')
    
    # Weight validation (in kg)
    if 'weight' in data and data['weight'] is not None:
        try:
            weight = float(data['weight'])
            if weight < 20 or weight > 500:
                errors.append('Weight must be between 20 and 500 kg')
        except (ValueError, TypeError):
            errors.append('Weight must be a valid number')
    
    # Height validation (in cm)
    if 'height' in data and data['height'] is not None:
        try:
            height = float(data['height'])
            if height < 100 or height > 250:
                errors.append('Height must be between 100 and 250 cm')
        except (ValueError, TypeError):
            errors.append('Height must be a valid number')
    
    # Gender validation
    if 'gender' in data and data['gender'] is not None:
        if data['gender'].lower() not in ['male', 'female']:
            errors.append('Gender must be either "male" or "female"')
    
    # Activity level validation
    if 'activity_level' in data and data['activity_level'] is not None:
        valid_levels = ['sedentary', 'light', 'moderate', 'very_active', 'extra_active']
        if data['activity_level'] not in valid_levels:
            errors.append(f'Activity level must be one of: {", ".join(valid_levels)}')
    
    # Goal type validation
    if 'goal_type' in data and data['goal_type'] is not None:
        valid_goals = ['lose_weight', 'maintain', 'gain_weight']
        if data['goal_type'] not in valid_goals:
            errors.append(f'Goal type must be one of: {", ".join(valid_goals)}')
    
    # Daily calorie goal validation
    if 'daily_calorie_goal' in data and data['daily_calorie_goal'] is not None:
        try:
            calorie_goal = int(data['daily_calorie_goal'])
            if calorie_goal < 800 or calorie_goal > 5000:
                errors.append('Daily calorie goal must be between 800 and 5000')
        except (ValueError, TypeError):
            errors.append('Daily calorie goal must be a valid number')
    
    return {
        'valid': len(errors) == 0,
        'errors': errors
    }


def sanitize_input(text, max_length=255):
    """
    Sanitize user input to prevent SQL injection and XSS
    """
    if not text:
        return ''
    
    # Convert to string
    text = str(text)
    
    # Trim to max length
    text = text[:max_length]
    
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text

def sanitize_html(text):
    """
    Remove HTML tags and escape special characters
    """
    if not text:
        return ''
    
    import html
    # Escape HTML special characters
    text = html.escape(str(text))
    
    # Remove any remaining HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    return text

def validate_file_upload(file, allowed_extensions=None, max_size_mb=16):
    """
    Validate uploaded file
    """
    if allowed_extensions is None:
        allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    errors = []
    
    # Check if file exists
    if not file or not file.filename:
        errors.append('No file provided')
        return {'valid': False, 'errors': errors}
    
    # Check file extension
    if '.' not in file.filename:
        errors.append('File has no extension')
    else:
        ext = file.filename.rsplit('.', 1)[1].lower()
        if ext not in allowed_extensions:
            errors.append(f'File type .{ext} not allowed. Allowed types: {", ".join(allowed_extensions)}')
    
    # Check file size
    file.seek(0, 2)  # Seek to end
    size = file.tell()
    file.seek(0)  # Reset to beginning
    
    max_size_bytes = max_size_mb * 1024 * 1024
    if size > max_size_bytes:
        errors.append(f'File size {size / 1024 / 1024:.2f}MB exceeds maximum {max_size_mb}MB')
    
    if size == 0:
        errors.append('File is empty')
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'size': size,
        'extension': file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else None
    }
