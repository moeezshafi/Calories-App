"""
Timezone Helper Utilities
Handles timezone-aware datetime operations
"""

from datetime import datetime, timezone
import pytz

def utc_now():
    """Get current UTC time (timezone-aware)"""
    return datetime.now(timezone.utc)

def to_utc(dt, from_timezone='UTC'):
    """
    Convert datetime to UTC
    Args:
        dt: datetime object
        from_timezone: source timezone string (e.g., 'America/New_York')
    """
    if dt.tzinfo is None:
        # Naive datetime, assume it's in from_timezone
        tz = pytz.timezone(from_timezone)
        dt = tz.localize(dt)
    return dt.astimezone(pytz.UTC)

def from_utc(dt, to_timezone='UTC'):
    """
    Convert UTC datetime to target timezone
    Args:
        dt: UTC datetime object
        to_timezone: target timezone string
    """
    if dt.tzinfo is None:
        dt = pytz.UTC.localize(dt)
    
    tz = pytz.timezone(to_timezone)
    return dt.astimezone(tz)

def get_user_timezone(user):
    """Get user's timezone (default to UTC if not set)"""
    return getattr(user, 'timezone', 'UTC') or 'UTC'

def format_datetime(dt, format_str='%Y-%m-%d %H:%M:%S', timezone_str='UTC'):
    """
    Format datetime in specific timezone
    """
    if dt.tzinfo is None:
        dt = pytz.UTC.localize(dt)
    
    tz = pytz.timezone(timezone_str)
    local_dt = dt.astimezone(tz)
    return local_dt.strftime(format_str)

def parse_datetime(date_str, format_str='%Y-%m-%d %H:%M:%S', timezone_str='UTC'):
    """
    Parse datetime string in specific timezone
    """
    tz = pytz.timezone(timezone_str)
    naive_dt = datetime.strptime(date_str, format_str)
    return tz.localize(naive_dt)

# Common timezone list
COMMON_TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
    'Pacific/Auckland'
]
