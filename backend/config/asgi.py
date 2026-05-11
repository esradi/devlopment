"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

# IMPORTANT: DJANGO_SETTINGS_MODULE must be set BEFORE any django.* or apps.*
# imports, otherwise Django's app registry isn't ready and any module that
# touches a model (e.g. AnonymousUser inside our JWT middleware) blows up with
# ImproperlyConfigured. Locally this often "works" because the shell exports
# DJANGO_SETTINGS_MODULE; on Railway it doesn't, which is why this file used
# to crash on first import. Order matters here — don't move these lines down.
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")

from django.core.asgi import get_asgi_application

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

# Safe to import Channels + project modules now that the app registry is loaded.
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from apps.notifications.middleware import JWTAuthMiddleware
import apps.notifications.routing
import apps.groups.routing

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            URLRouter(
                apps.notifications.routing.websocket_urlpatterns +
                apps.groups.routing.websocket_urlpatterns
            )
        )
    ),
})
