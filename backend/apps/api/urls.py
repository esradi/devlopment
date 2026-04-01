from django.urls import path, include

from .views_matching import MatchingView

urlpatterns = [
    path('', include('apps.accounts.urls')),
    path('', include('apps.offers.urls')),
    path('', include('apps.students.urls')),
    path('', include('apps.specialities.urls')),
    path('', include('apps.conventions.urls')),
    path('', include('apps.notifications.urls')),
    path('', include('apps.groups.urls')),
    path('', include('apps.references.urls')),
    path('admin/', include('apps.admin_panel.urls')),
    path('', include('challenges.urls')), 

    path('matching/', MatchingView.as_view(), name='matching'),
]
