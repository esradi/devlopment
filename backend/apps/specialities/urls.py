from django.urls import path
from . import views

urlpatterns = [
    path('domains/', views.DomainListView.as_view(), name='domain_list'),
    path('domains/<int:domain_pk>/specialities/', views.SpecialitiesByDomainView.as_view(), name='specialities_by_domain'),
    path('specialities/', views.SpecialityListView.as_view(), name='speciality_list'),
    path('specialities/<int:speciality_pk>/skills/', views.SkillsBySpecialityView.as_view(), name='skills_by_speciality'),
    path('skills/available/', views.AvailableSkillsView.as_view(), name='skills_available'),
    path('skills/', views.SkillListView.as_view(), name='skill_list'),
    path('verify/quizzes/', views.VerifyQuizListView.as_view(), name='verify_quiz_list'),
    path('verify/quizzes/<int:skill_id>/', views.VerifyQuizDetailView.as_view(), name='verify_quiz_detail'),
    path('verify/quizzes/<int:skill_id>/submit/', views.VerifyQuizSubmitView.as_view(), name='verify_quiz_submit'),
    path('verify/portfolio/<int:skill_id>/submit/', views.VerifyPortfolioSubmitView.as_view(), name='verify_portfolio_submit'),
    path('verify/portfolio/<int:skill_id>/status/', views.VerifyPortfolioStatusView.as_view(), name='verify_portfolio_status'),
]

