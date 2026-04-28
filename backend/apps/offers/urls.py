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
    CompanyOfferStatsView,
    CompanyOfferDuplicateView,
    CompanyOfferExtendDeadlineView,
    CompanyOfferApplicantsSummaryView,
    ApplicationViewSet,
    OfferSearchView,
    OfferTrendingView,
    OfferRecommendedView,
    OfferSimilarView,
    OfferTimelineView,
    OfferAnalyticsView,
    OfferBoostView,
    OfferMatchPreviewView,
    OfferReportView,
    AdminFlaggedOfferView
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
    path('offers/<int:pk>/', OfferDetailView.as_view(), name='offer-detail'),
    path('offers/<int:pk>/stats/', CompanyOfferStatsView.as_view(), name='offer_stats'),
    path('offers/<int:pk>/duplicate/', CompanyOfferDuplicateView.as_view(), name='offer_duplicate'),
    path('offers/<int:pk>/extend-deadline/', CompanyOfferExtendDeadlineView.as_view(), name='offer_extend_deadline'),
    path('offers/<int:pk>/applicants-summary/', CompanyOfferApplicantsSummaryView.as_view(), name='offer_applicants_summary'),
    
    # Advanced Discovery & Lifecycle
    path('offers/search/', OfferSearchView.as_view(), name='offer_search'),
    path('offers/trending/', OfferTrendingView.as_view(), name='offer_trending'),
    path('offers/recommended/', OfferRecommendedView.as_view(), name='offer_recommended'),
    path('offers/similar/<int:pk>/', OfferSimilarView.as_view(), name='offer_similar'),
    path('offers/<int:pk>/timeline/', OfferTimelineView.as_view(), name='offer_timeline'),
    path('offers/<int:pk>/analytics/', OfferAnalyticsView.as_view(), name='offer_analytics'),
    path('offers/<int:pk>/boost/', OfferBoostView.as_view(), name='offer_boost'),
    path('offers/<int:pk>/match-preview/', OfferMatchPreviewView.as_view(), name='offer_match_preview'),
    path('offers/<int:pk>/report/', OfferReportView.as_view(), name='offer_report'),
    path('admin/offers/flagged/', AdminFlaggedOfferView.as_view(), name='admin_flagged_offers'),
    path('admin/offers/flagged/<int:pk>/', AdminFlaggedOfferView.as_view(), name='admin_flagged_offer_action'),
]
