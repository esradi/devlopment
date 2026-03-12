from django.urls import path, include

from .views_matching import MatchingView

urlpatterns = [
    path('', include('apps.accounts.urls')),
    path('', include('apps.offers.urls')),
    path('', include('apps.students.urls')),
    path('', include('apps.specialities.urls')),
    path('matching/', MatchingView.as_view(), name='matching'),
]
