"""
Celery Application Configuration
Background task processing
"""

from celery import Celery
from config import Config

# Initialize Celery
celery = Celery(
    'calorie_app',
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND,
    include=['tasks.image_tasks', 'tasks.email_tasks', 'tasks.analytics_tasks']
)

# Celery configuration
celery.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
)

# Task routes
celery.conf.task_routes = {
    'tasks.image_tasks.*': {'queue': 'images'},
    'tasks.email_tasks.*': {'queue': 'emails'},
    'tasks.analytics_tasks.*': {'queue': 'analytics'},
}

if __name__ == '__main__':
    celery.start()
