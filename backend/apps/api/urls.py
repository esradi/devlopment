from django.urls import path, include

from .views_matching import MatchingView

urlpatterns = [
    path('', include('apps.accounts.urls')),
    path('', include('apps.offers.urls')),
    path('', include('apps.students.urls')),
    path('', include('apps.specialities.urls')),
    path('', include('apps.conventions.urls')),
    path('', include('apps.notifications.urls')),
    path('', include('challenges.urls')),   # ← ADD THIS

    path('matching/', MatchingView.as_view(), name='matching'),
]
