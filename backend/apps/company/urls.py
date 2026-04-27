from django.urls import path
from . import views

urlpatterns = [
    path('company/profile/', views.CompanyProfileView.as_view(), name='company_profile'),
    path('company/profile/logo/', views.CompanyLogoUploadView.as_view(), name='company_logo_upload'),
]
