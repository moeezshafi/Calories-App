"""
Redis caching utilities for performance optimization
"""
import json
import redis
from functools import wraps
from flask import current_app
from typing import Optional, Callable, Any
import hashlib


class CacheManager:
    """Manages Redis caching operations"""
    
    def __init__(self):
        self._redis_client: Optional[redis.Redis] = None
    
    def init_app(self, app):
        """Initialize Redis connection"""
        redis_url = app.config.get('REDIS_URL')
        if redis_url:
            try:
                self._redis_client = redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5
                )
                # Test connection
                self._redis_client.ping()
                app.logger.info("Redis cache initialized successfully")
            except Exception as e:
                app.logger.warning(f"Redis connection failed: {e}. Caching disabled.")
                self._redis_client = None
        else:
            app.logger.info("Redis URL not configured. Caching disabled.")
    
    @property
    def is_available(self) -> bool:
        """Check if Redis is available"""
        return self._redis_client is not None
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.is_available:
            return None
        
        try:
            value = self._redis_client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            current_app.logger.error(f"Cache get error: {e}")
        return None
    
    def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Set value in cache with TTL (default 5 minutes)"""
        if not self.is_available:
            return False
        
        try:
            serialized = json.dumps(value, default=str)
            self._redis_client.setex(key, ttl, serialized)
            return True
        except Exception as e:
            current_app.logger.error(f"Cache set error: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.is_available:
            return False
        
        try:
            self._redis_client.delete(key)
            return True
        except Exception as e:
            current_app.logger.error(f"Cache delete error: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern"""
        if not self.is_available:
            return 0
        
        try:
            keys = self._redis_client.keys(pattern)
            if keys:
                return self._redis_client.delete(*keys)
        except Exception as e:
            current_app.logger.error(f"Cache delete pattern error: {e}")
        return 0
    
    def invalidate_user_cache(self, user_id: int):
        """Invalidate all cache entries for a user"""
        patterns = [
            f"analytics:user:{user_id}:*",
            f"meal_plans:user:{user_id}:*",
            f"recipes:user:{user_id}:*",
        ]
        for pattern in patterns:
            self.delete_pattern(pattern)


# Global cache manager instance
cache_manager = CacheManager()


def cached(ttl: int = 300, key_prefix: str = ""):
    """
    Decorator for caching function results
    
    Args:
        ttl: Time to live in seconds (default 5 minutes)
        key_prefix: Prefix for cache key
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key from function name and arguments
            key_parts = [key_prefix or func.__name__]
            
            # Add args to key
            for arg in args:
                if isinstance(arg, (int, str, float, bool)):
                    key_parts.append(str(arg))
            
            # Add kwargs to key
            for k, v in sorted(kwargs.items()):
                if isinstance(v, (int, str, float, bool)):
                    key_parts.append(f"{k}:{v}")
            
            cache_key = ":".join(key_parts)
            
            # Try to get from cache
            cached_value = cache_manager.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Store in cache
            cache_manager.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


def cache_key_for_user(user_id: int, *parts: str) -> str:
    """Generate a cache key for user-specific data"""
    return ":".join(["user", str(user_id)] + list(parts))
