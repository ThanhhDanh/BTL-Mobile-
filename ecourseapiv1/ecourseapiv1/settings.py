"""
Django settings for ecourseapiv1 project.

Generated by 'django-admin startproject' using Django 5.0.3.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

MEDIA_ROOT = '%s/courses/static/' % BASE_DIR

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-aa$3sc8quxnhel+xv)^gyjje5ez123w3&431*erx19o=d&akid'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
#https://thanhdanh.pythonanywhere.com/
ALLOWED_HOSTS = []

import pymysql

pymysql.install_as_MySQLdb()

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'courses',
    'ckeditor',
    'ckeditor_uploader',
    'rest_framework',
    'drf_yasg',
    # 'rest_framework.authtoken',
    'oauth2_provider',
    'django_filters',
    'bootstrap5'
]

CKEDITOR_UPLOAD_PATH = "ckeditors/images/"

AUTH_USER_MODEL = 'courses.User'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ecourseapiv1.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ecourseapiv1.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'databamboo',
        'USER': 'root',
        'PASSWORD': 'Admin@123',
        'HOST': ''  # mặc định localhost
    }
}

INTERNAL_IPS = [
    "127.0.0.1",
]

import cloudinary

cloudinary.config(
    cloud_name="dsyzahqsj",
    api_key="696835852437271",
    api_secret="RZ_vLJDhgOkaNTEpQSNebIxd7SM"
)

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST_FRAMEWORK = {
#     'DEFAULT_AUTHENTICATION_CLASSES': [
#         'rest_framework.authentication.BasicAuthentication',
#         'rest_framework.authentication.TokenAuthentication',
#     ]
# }

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        # 'rest_framework.parsers.JSONParser',
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication'
    ]
}

client_id = 'GCoXEPFNLLSLXO3Uv3u1GOlZiow1q9EFNyR3DnJ3'
client_secret = 'mOcSyi1orI1JTzUB9pwrwk84gB3wwrSPwk35Yj2spe4MM4OlyFOeriIguc1ejyGAbmO1NsVcIVjhmB6LhhbJk4kj5AhErt2IpuoeuFXXkkbnknuaaRZ1W8nliC6wAAE4'
