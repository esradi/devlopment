from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OfferListCreateView,
    OfferDetailView,
    ToggleFavoriteView,
    FavoriteOffersListView,
    OfferStatusUpdateView,
    OfferMineListView,
    OfferMetadataView,
    ApplicationViewSet
)

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
    path('offers/', OfferListCreateView.as_view(), name='offer-list-create'),
    path('offers/<int:pk>/', OfferDetailView.as_view(), name='offer_detail'),
    path('favorites/', FavoriteOffersListView.as_view(), name='favorite_list'),
    path('offers/<int:offer_id>/favorite/', ToggleFavoriteView.as_view(), name='toggle_favorite'),
    path('offers/<int:pk>/status/', OfferStatusUpdateView.as_view(), name='offer_status_update'),
    path('offers/mine/', OfferMineListView.as_view(), name='offers_mine'),
    path('offers/options/', OfferMetadataView.as_view(), name='offer_options'),
]
