from django.urls import path
from .views import (
    AdminDashboardStatsView,
    PendingValidationListView,
    ValidationDetailView,
    ValidationApproveView,
    ValidationRejectView,
    AdminDocumentsListView,
    AdminUserListView,
    AdminUserStatusView,
    AdminCompanyListView,
    AdminCompanyVerifyView,
    AdminSpecialitiesListView,
    PortfolioSubmissionReviewView
)

urlpatterns = [
    path('dashboard/', AdminDashboardStatsView.as_view(), name='admin-dashboard'),
    path('documents/', AdminDocumentsListView.as_view(), name='admin-documents'),
    path('validations/', PendingValidationListView.as_view(), name='admin-validations'),
    path('validations/<int:pk>/', ValidationDetailView.as_view(), name='admin-validation-detail'),
    path('validations/<int:pk>/approve/', ValidationApproveView.as_view(), name='admin-validation-approve'),
    path('validations/<int:pk>/reject/', ValidationRejectView.as_view(), name='admin-validation-reject'),
    path('users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('users/<int:pk>/status/', AdminUserStatusView.as_view(), name='admin-user-status'),
    path('users/<int:pk>/verify-id/', AdminUserVerifyIdView.as_view(), name='admin-user-verify-id'),
    path('companies/', AdminCompanyListView.as_view(), name='admin-companies-list'),
    path('companies/<int:pk>/verify/', AdminCompanyVerifyView.as_view(), name='admin-company-verify'),
    path('specialities/', AdminSpecialitiesListView.as_view(), name='admin-specialities-list'),
    path('portfolio/<int:pk>/review/', PortfolioSubmissionReviewView.as_view(), name='admin-portfolio-review'),
]