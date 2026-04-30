from django.urls import re_path
from .consumers import StudyGroupConsumer

websocket_urlpatterns = [
    re_path(r"ws/groups/(?P<group_id>\d+)/chat/$", StudyGroupConsumer.as_asgi()),
]
