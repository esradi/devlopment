from django.urls import path
from . import views

urlpatterns = [
    # ── Profile ───────────────────────────────────────────────────────────
    path('students/profile/',                       views.StudentProfileView.as_view(),            name='student_profile'),
    path('student/profile/upload-cv/',              views.StudentCVUploadView.as_view(),           name='student_upload_cv'),
    path('student/profile/cv/',                     views.StudentCVDeleteView.as_view(),           name='student_delete_cv'),
    path('student/profile/cv/download/',            views.StudentCVDownloadView.as_view(),         name='student_download_cv'),
    path('student/profile/upload-picture/',         views.StudentPictureUploadView.as_view(),      name='student_upload_picture'),
    path('student/profile/picture/',                views.StudentPictureDeleteView.as_view(),      name='student_delete_picture'),

    # ── NEW: Dashboard, Analytics, Recommendations ────────────────────────
    path('student/dashboard/',                      views.StudentDashboardView.as_view(),          name='student_dashboard'),
    path('student/analytics/',                      views.StudentAnalyticsView.as_view(),          name='student_analytics'),
    path('student/recommendations/',                views.StudentRecommendationsView.as_view(),    name='student_recommendations'),

    # ── Competencies ──────────────────────────────────────────────────────
    path('student/competencies/',                   views.StudentCompetenciesView.as_view(),       name='student_competencies'),
    path('student/competencies/<int:competency_id>/', views.StudentCompetencyDetailView.as_view(), name='student_competency_detail'),

    # ── Application stats ─────────────────────────────────────────────────
    path('student/applications/stats/',             views.StudentApplicationStatsView.as_view(),   name='student_application_stats'),
]