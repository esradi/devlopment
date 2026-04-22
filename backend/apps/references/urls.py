from django.urls import path
from .views import (
    ReferenceLetterListCreateView,
    ReferenceLetterDetailView,
    ReferenceLetterSignView,
    ReferenceLetterVerifyView
)

urlpatterns = [

    path('references/', ReferenceLetterListCreateView.as_view(), name='reference-list-create'),
    path('references/<int:pk>/', ReferenceLetterDetailView.as_view(), name='reference-detail'),
    path('references/<int:pk>/sign/', ReferenceLetterSignView.as_view(), name='reference-sign'),
    path('references/verify/<uuid:token>/', ReferenceLetterVerifyView.as_view(), name='reference-verify'),
]
