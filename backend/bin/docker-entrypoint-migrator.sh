#!/bin/bash
set -e
export PYTHONUNBUFFERED=1

echo "=== QLCV Migrator: Waiting for database ==="
python manage.py wait_for_db

echo "=== QLCV Migrator: Running migrations ==="
python -c "
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qlcv.settings.production')
django.setup()
from django.core.management import call_command
call_command('migrate', '--noinput', stdout=sys.stderr)
print('Migrations applied successfully', file=sys.stderr)
" 2>&1

echo "=== QLCV Migrator: Ensuring S3/MinIO bucket ==="
python -c "
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qlcv.settings.production')
django.setup()
from django.core.management import call_command
call_command('create_bucket', stdout=sys.stderr)
" 2>&1 || true

echo "=== QLCV Migrator: Registering instance ==="
python -c "
import os, sys, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'qlcv.settings.production')
django.setup()
from django.core.management import call_command
call_command('register_instance', 'qlcv-genco1', stdout=sys.stderr)
call_command('seed_admin', stdout=sys.stderr)
" 2>&1 || true

echo "=== QLCV Migrator: Flushing Redis cache ==="
python -c "
import redis, os
r = redis.from_url(os.environ.get('REDIS_URL', 'redis://qlcv-redis:6379/'))
r.flushall()
print('Redis cache flushed')
" 2>&1 || true

echo "=== QLCV Migrator: Done ==="
