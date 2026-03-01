from django.urls import path
from . import views

urlpatterns = [
    path('offers/', views.OfferListCreateView.as_view(), name='offer_list'),
    path('offers/<int:pk>/', views.OfferDetailView.as_view(), name='offer_detail'),
    path('favorites/', views.FavoriteOffersListView.as_view(), name='favorite_list'),
    path('offers/<int:offer_id>/favorite/', views.ToggleFavoriteView.as_view(), name='toggle_favorite'),
    path('offers/<int:pk>/status/', views.OfferStatusUpdateView.as_view(), name='offer_status_update'),
    path('offers/mine/', views.OfferMineListView.as_view(), name='offers_mine'),
    path('offers/options/', views.OfferMetadataView.as_view(), name='offer_options'),
]
