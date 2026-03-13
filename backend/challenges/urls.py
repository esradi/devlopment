from django.urls import path
from . import views

urlpatterns = [
    path('challenges/',                         views.list_challenges,      name='challenges-list'),
    path('challenges/<str:skill_name>/',        views.challenge_detail,     name='challenge-detail'),
    path('challenges/<str:skill_name>/start/',  views.start_challenge_session, name='challenge-start'),
    path('challenges/<str:skill_name>/submit/', views.submit_challenge,     name='challenge-submit'),
]