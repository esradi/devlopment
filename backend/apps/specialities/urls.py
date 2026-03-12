from django.urls import path
from . import views

urlpatterns = [
    path('domains/', views.DomainListCreateView.as_view(), name='domain_list_create'),
    path('domains/<int:domain_pk>/specialities/', views.SpecialitiesByDomainView.as_view(), name='specialities_by_domain'),
    path('specialities/', views.SpecialityListCreateView.as_view(), name='speciality_list_create'),
    path('specialities/<int:speciality_pk>/competencies/', views.CompetenciesBySpecialityView.as_view(), name='competencies_by_speciality'),
    path('competencies/', views.CompetencyListCreateView.as_view(), name='competency_list_create'),
]
