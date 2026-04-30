from django.urls import path, include

from .views_matching import (
    MatchingView, 
    StudentMatchScoresView, 
    OfferMatchScoresView, 
    RecalculateMatchesView
)

urlpatterns = [
    path('', include('apps.accounts.urls')),
    path('', include('apps.offers.urls')),
    path('', include('apps.students.urls')),
    path('', include('apps.specialities.urls')),
    path('', include('apps.conventions.urls')),
    path('', include('apps.notifications.urls')),
    path('', include('apps.groups.urls')),
    path('', include('apps.references.urls')),
    path('', include('apps.contact.urls')),
    path('admin/', include('apps.admin_panel.urls')),
    path('company/', include('apps.company.urls')),
    path('', include('challenges.urls')),
    path('matching/', MatchingView.as_view(), name='matching'),
    path('matching/my-scores/', StudentMatchScoresView.as_view(), name='matching-my-scores'),
    path('matching/offer/<int:offer_id>/scores/', OfferMatchScoresView.as_view(), name='matching-offer-scores'),
    path('matching/recalculate/', RecalculateMatchesView.as_view(), name='matching-recalculate'),
]