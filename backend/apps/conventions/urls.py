from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConventionViewSet

router = DefaultRouter()
router.register(r'conventions', ConventionViewSet, basename='convention')

urlpatterns = [
    path('', include(router.urls)),
]
