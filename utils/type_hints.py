"""
Type Hints and Type Aliases
Common type definitions used across the application
"""

from typing import Dict, List, Optional, Tuple, Any, Union
from datetime import datetime

# Response types
JsonResponse = Tuple[Dict[str, Any], int]
ValidationResult = Dict[str, Union[bool, str, List[str]]]

# User types
UserDict = Dict[str, Any]
UserId = int

# Food types
FoodDict = Dict[str, Any]
NutritionDict = Dict[str, Union[int, float]]

# Token types
TokenPair = Dict[str, str]

# Database types
DatabaseResult = Tuple[bool, Optional[str]]

# Pagination types
PaginationInfo = Dict[str, Union[int, bool]]
PaginatedResult = Tuple[List[Any], int]

# Common types
ErrorDetails = Optional[str]
SuccessMessage = str
