from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.get_user_profile, name='profile'),
    path('auth/me/', views.get_me, name='auth_me'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('verify-email/resend/', views.resend_verification_code, name='resend_verification_code'),
    path('password-reset/', views.forgot_password, name='password_reset'),
    path('password-reset/confirm/', views.reset_password_confirm, name='password_reset_confirm'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('social/google/', views.google_auth_placeholder, name='google_auth'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('password-change/', views.change_password, name='password_change'),
    path('delete-account/', views.delete_account, name='delete_account'),
    
    # --- BROWSE STUDENTS ---
    path('students/', views.StudentListView.as_view(), name='student_list'),
    path('students/<int:pk>/', views.StudentDetailView.as_view(), name='student_detail'),
]
