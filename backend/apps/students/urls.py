from django.urls import path
from . import views

urlpatterns = [
    path('students/profile/', views.StudentProfileView.as_view(),name='student_profile'),
    path('student/profile/upload-cv/', views.StudentCVUploadView.as_view(),name='student_upload_cv'),
    path('student/profile/cv/', views.StudentCVDeleteView.as_view(),name='student_delete_cv'),
    path('student/profile/cv/download/', views.StudentCVDownloadView.as_view(),name='student_download_cv'),
    path('student/profile/upload-picture/',views.StudentPictureUploadView.as_view(),name='student_upload_picture'),
    path('student/profile/picture/',views.StudentPictureDeleteView.as_view(),name='student_delete_picture'),
    path('student/dashboard/',views.StudentDashboardView.as_view(),name='student_dashboard'),
    path('student/analytics/',views.StudentAnalyticsView.as_view(),name='student_analytics'),
    path('student/recommendations/',views.StudentRecommendationsView.as_view(),name='student_recommendations'),
    path('student/skills/',views.StudentSkillsView.as_view(),name='student_skills'),
    path('student/skills/<int:skill_id>/', views.StudentSkillDetailView.as_view(), name='student_skill_detail'),
    path('student/applications/stats/',views.StudentApplicationStatsView.as_view(),name='student_application_stats'),
]