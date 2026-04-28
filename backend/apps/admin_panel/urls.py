from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.admin_panel.views import (
    AdminDashboardView,
    AdminActionLogViewSet,
    InternshipValidationViewSet,
    AdminUserViewSet,
    AdminCompanyViewSet,
    AdminAnalyticsView,
    AdminAlertsView,
    AdminActivityFeedView
)

router = DefaultRouter()
router.register(r'logs', AdminActionLogViewSet, basename='admin-logs')
router.register(r'internships', InternshipValidationViewSet, basename='admin-internships')
router.register(r'users', AdminUserViewSet, basename='admin-users')
router.register(r'companies', AdminCompanyViewSet, basename='admin-companies')

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('dashboard/alerts/', AdminAlertsView.as_view(), name='admin-alerts'),
    path('dashboard/activity-feed/', AdminActivityFeedView.as_view(), name='admin-activity-feed'),
    path('', include(router.urls)),
]