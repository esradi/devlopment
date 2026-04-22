from django.urls import re_path
from .consumers import NotificationConsumer
from apps.groups.routing import websocket_urlpatterns as groups_websocket_urlpatterns

websocket_urlpatterns = [
    re_path(r"ws/notifications/$", NotificationConsumer.as_asgi()),
    *groups_websocket_urlpatterns,
]
