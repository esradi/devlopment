from django.urls import path
from . import views

urlpatterns = [
    path('students/profile/', views.StudentProfileView.as_view(), name='student_profile'),
    path('student/competencies/', views.StudentCompetenciesView.as_view(), name='student_competencies'),
    path('student/competencies/<int:competency_id>/', views.StudentCompetencyDetailView.as_view(), name='student_competency_detail'),
]