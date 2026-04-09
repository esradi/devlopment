from django.urls import path
from . import views

urlpatterns = [
    path('domains/', views.DomainListCreateView.as_view(), name='domain_list_create'),
    path('domains/<int:domain_pk>/specialities/', views.SpecialitiesByDomainView.as_view(), name='specialities_by_domain'),
    path('specialities/', views.SpecialityListCreateView.as_view(), name='speciality_list_create'),
    path('specialities/<int:speciality_pk>/skills/', views.SkillsBySpecialityView.as_view(), name='skills_by_speciality'),
    path('skills/', views.SkillListCreateView.as_view(), name='skill_list_create'),
    path('verify/quizzes/', views.VerifyQuizListView.as_view(), name='verify_quiz_list'),
    path('verify/quizzes/<int:skill_id>/', views.VerifyQuizDetailView.as_view(), name='verify_quiz_detail'),
    path('verify/quizzes/<int:skill_id>/submit/', views.VerifyQuizSubmitView.as_view(), name='verify_quiz_submit'),
    path('verify/portfolio/<int:skill_id>/submit/', views.VerifyPortfolioSubmitView.as_view(), name='verify_portfolio_submit'),
    path('verify/portfolio/<int:skill_id>/status/', views.VerifyPortfolioStatusView.as_view(), name='verify_portfolio_status'),
]
