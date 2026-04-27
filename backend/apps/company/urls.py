from django.urls import path
from . import views

urlpatterns = [
    # Group 1: Profile & Verification
    path('profile/', views.CompanyProfileView.as_view(), name='company_profile'),
    path('profile/logo/', views.CompanyLogoView.as_view(), name='company_logo'),
    path('request-verification/', views.CompanyVerificationRequestView.as_view(), name='company_request_verification'),
    path('verification-status/', views.CompanyVerificationStatusView.as_view(), name='company_verification_status'),
    path('profile/completeness/', views.CompanyProfileCompletenessView.as_view(), name='company_profile_completeness'),
    
    # Group 2: Dashboard & Analytics
    path('dashboard/', views.CompanyDashboardView.as_view(), name='company_dashboard'),
    path('analytics/', views.CompanyAnalyticsView.as_view(), name='company_analytics'),
    path('stats/', views.CompanyStatsView.as_view(), name='company_stats'),

    # Group 3: Application Management
    path('applications/', views.CompanyApplicationListView.as_view(), name='company_applications_list'),
    path('applications/<int:pk>/status/', views.CompanyApplicationStatusView.as_view(), name='company_application_status'),
    path('applications/<int:pk>/notes/', views.CompanyApplicationNoteView.as_view(), name='company_application_notes'),

    # Group 4: Interview Management
    path('interviews/schedule/', views.CompanyInterviewScheduleView.as_view(), name='company_interview_schedule'),
    path('interviews/', views.CompanyInterviewListView.as_view(), name='company_interview_list'),
    path('interviews/<int:pk>/', views.CompanyInterviewManageView.as_view(), name='company_interview_manage'),
    path('interviews/<int:pk>/complete/', views.CompanyInterviewCompleteView.as_view(), name='company_interview_complete'),
    path('interviews/<int:pk>/feedback/', views.CompanyInterviewFeedbackView.as_view(), name='company_interview_feedback'),

    # Group 5: Convention Management
    path('conventions/', views.CompanyConventionListView.as_view(), name='company_convention_list'),
    path('conventions/stats/', views.CompanyConventionStatsView.as_view(), name='company_convention_stats'),
    path('conventions/<int:pk>/', views.CompanyConventionDetailView.as_view(), name='company_convention_detail'),
    path('conventions/<int:pk>/sign/', views.CompanyConventionSignView.as_view(), name='company_convention_sign'),

    # Group 8: Search & Sourcing
    path('students/search/', views.CompanyStudentSearchView.as_view(), name='company_student_search'),

    # Group 10: Team Management
    path('team/', views.CompanyTeamListView.as_view(), name='company_team_list'),
    path('team/invite/', views.CompanyTeamListView.as_view(), name='company_team_invite'),
    path('team/activity/', views.CompanyTeamActivityView.as_view(), name='company_team_activity'),
    path('team/<int:pk>/', views.CompanyTeamDetailView.as_view(), name='company_team_detail'),
]
