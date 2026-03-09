# Contributing to Calorie Tracker API

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Python version, etc.)
   - Screenshots if applicable

### Suggesting Enhancements

1. Check if the enhancement has been suggested
2. Create a new issue with:
   - Clear title and description
   - Use case and benefits
   - Possible implementation approach

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**:
   - Follow the code style guide
   - Add tests for new features
   - Update documentation
   - Ensure all tests pass

4. **Commit your changes**:
   ```bash
   git commit -m "Add amazing feature"
   ```
   Follow conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation
   - `style:` Formatting
   - `refactor:` Code restructuring
   - `test:` Adding tests
   - `chore:` Maintenance

5. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**:
   - Describe your changes
   - Reference related issues
   - Add screenshots if applicable

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/calorie-tracker-api.git
   cd calorie-tracker-api
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run tests**:
   ```bash
   pytest
   ```

6. **Run the application**:
   ```bash
   python run.py
   ```

## Code Style

### Python
- Follow PEP 8
- Use type hints
- Maximum line length: 100 characters
- Use meaningful variable names
- Add docstrings to functions and classes

### Example:
```python
def calculate_bmr(weight: float, height: float, age: int, gender: str) -> float:
    """
    Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
    
    Args:
        weight: Weight in kilograms
        height: Height in centimeters
        age: Age in years
        gender: 'male' or 'female'
    
    Returns:
        BMR in calories per day
    """
    if gender.lower() == 'male':
        return 10 * weight + 6.25 * height - 5 * age + 5
    else:
        return 10 * weight + 6.25 * height - 5 * age - 161
```

## Testing

- Write tests for all new features
- Maintain test coverage above 80%
- Use pytest for testing
- Follow AAA pattern (Arrange, Act, Assert)

### Example Test:
```python
def test_user_registration(client):
    """Test successful user registration"""
    # Arrange
    user_data = {
        'email': 'test@example.com',
        'password': 'SecurePass123!',
        'name': 'Test User'
    }
    
    # Act
    response = client.post('/api/auth/register', json=user_data)
    
    # Assert
    assert response.status_code == 201
    assert 'access_token' in response.json['data']
```

## Documentation

- Update README.md for user-facing changes
- Update API documentation for endpoint changes
- Add inline comments for complex logic
- Update CHANGELOG.md

## Review Process

1. All PRs require at least one review
2. All tests must pass
3. Code coverage must not decrease
4. Documentation must be updated
5. No merge conflicts

## Questions?

Feel free to:
- Open an issue for questions
- Join our Discord/Slack channel
- Email: dev@calorietracker.com

Thank you for contributing! 🎉
