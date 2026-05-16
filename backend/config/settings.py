import os
from pathlib import Path
from dotenv import load_dotenv  # NEW: reads .env file into os.environ so secrets stay out of code
import pymysql
pymysql.version_info = (2, 2, 1, "final", 0)  
pymysql.install_as_MySQLdb()

from django.db.backends.mysql.features import DatabaseFeatures
DatabaseFeatures.can_return_rows_from_bulk_insert = False
DatabaseFeatures.can_return_columns_from_insert = False
DatabaseFeatures.supports_column_rename = property(lambda self: False)

from django.db.backends.mysql.schema import DatabaseSchemaEditor
def patched_rename_field_sql(self, table, old_field, new_field, new_type):
    return "ALTER TABLE %s CHANGE %s %s %s" % (
        self.quote_name(table),
        self.quote_name(old_field.column),
        self.quote_name(new_field.column),
        new_type,
    )
DatabaseSchemaEditor._rename_field_sql = patched_rename_field_sql

# Django 6 emits "ALTER TABLE ... ADD COLUMN IF NOT EXISTS ..." / "DROP COLUMN
# IF EXISTS ..." when it detects MySQL >= 8.0.29. Railway's MySQL plugin is
# older than that (and PyMySQL's version reporting confuses the detection
# either way), so the server rejects the SQL with ER_PARSE_ERROR during
# migrate. Forcing the schema editor back to the plain forms keeps the
# migrations portable across MySQL 5.7 / 8.0.x / MariaDB.
DatabaseSchemaEditor.sql_create_column = "ALTER TABLE %(table)s ADD COLUMN %(column)s %(definition)s"
DatabaseSchemaEditor.sql_delete_column = "ALTER TABLE %(table)s DROP COLUMN %(column)s"

from django.db.backends.base.base import BaseDatabaseWrapper
BaseDatabaseWrapper.check_database_version_supported = lambda self: None

# REMOVED: duplicate "from pathlib import Path" — already imported at the top

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')  # NEW: load the .env file at project root so all os.environ calls below work

# CHANGED: secret key was hardcoded — now read from env; falls back to a dev key if .env is missing
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'dev-fallback')

# CHANGED: DEBUG was always True — now controlled by env var so production can set it to False
DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'

# ALLOWED_HOSTS allows all hosts by default to prevent 400 Bad Request behind proxies
ALLOWED_HOSTS = [h.strip() for h in os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(',') if h.strip()]

INSTALLED_APPS = [
    'daphne',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'channels',

    'apps.accounts',
    'apps.offers',
    'apps.api',  
    'apps.specialities',
    'apps.students',
    'apps.matching',
    'apps.conventions',
    'apps.notifications',
    'apps.groups',
    'apps.references',
    'apps.admin_panel',
    'apps.company',
    'apps.challenges',

]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # NEW: serves static files in production without needing nginx/apache
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Media files (user uploads)
# WARNING: Railway's container filesystem is EPHEMERAL — every redeploy wipes
# anything written to /media. Before this project handles real user uploads in
# production, swap this to django-storages with S3 or Cloudflare R2.
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CHANGED: was always InMemoryChannelLayer (only works inside one process).
# In production we need Redis so WebSocket events can fan out across multiple
# Daphne workers — Channels uses Redis pub/sub for group sends.
# Locally, REDIS_URL is left blank in .env so we keep the simple in-memory
# layer and don't have to run a Redis server for `manage.py runserver`.
REDIS_URL = os.environ.get('REDIS_URL', '').strip()
if REDIS_URL:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {'hosts': [REDIS_URL]},
        },
    }
else:
    CHANNEL_LAYERS = {
        'default': {'BACKEND': 'channels.layers.InMemoryChannelLayer'},
    }


# Database
# CHANGED: all DB credentials were hardcoded — now read from env vars
# This prevents leaking passwords in version control
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'stagio_db'),           # NEW: from env, fallback to old value
        'USER': os.environ.get('DB_USER', 'root'),                # NEW: from env
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),             # NEW: from env
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),           # NEW: from env
        'PORT': os.environ.get('DB_PORT', '3306'),                # NEW: from env
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'  # NEW: where collectstatic gathers files for production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'  # NEW: gzip + cache-busting for static files

from datetime import timedelta
# REMOVED: duplicate "import os"

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# Allow all origins to avoid CORS issues when frontend is deployed on Vercel
CORS_ALLOW_ALL_ORIGINS = os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'True') == 'True'

if not CORS_ALLOW_ALL_ORIGINS:
    CORS_ALLOWED_ORIGINS = os.environ.get(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:3000,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:8080,http://127.0.0.1:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175,http://127.0.0.1:8080'
    ).split(',')

import logging
logging.warning(f"CORS_ALLOW_ALL_ORIGINS: {CORS_ALLOW_ALL_ORIGINS}")

CORS_ALLOW_CREDENTIALS = True

# REMOVED: duplicate MEDIA_URL / MEDIA_ROOT (already defined above around line 97)

AUTH_USER_MODEL = 'accounts.User'


EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

# CHANGED: email credentials were hardcoded — now read from env to avoid leaking secrets
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'pro.turbo-smtp.com')              # NEW: from env
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))                          # NEW: from env
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False

EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')                      # NEW: from env — no more plaintext creds
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')              # NEW: from env — no more plaintext creds

DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'stage.io.contact@gmail.com')  # NEW: from env
