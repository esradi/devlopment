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
    CompanyDashboardView,
    CompanyOfferStatsView,
    CompanyOfferDuplicateView,
    CompanyOfferExtendDeadlineView,
    CompanyOfferApplicantsSummaryView,
    ApplicationViewSet,
    InterviewViewSet,
    MessageViewSet,
    OfferSearchView,
    OfferTrendingView,
    OfferRecommendedView,
    OfferSimilarView,
    OfferTimelineView,
    OfferAnalyticsView,
    OfferBoostView,
    OfferMatchPreviewView,
    OfferReportView,
    AdminFlaggedOfferView,
    OfferCloseView,
    OfferReopenView,
    OfferArchiveView,
    ApplicationMineView,
    ApplicationPendingView,
    ApplicationAcceptedView,
    ApplicationWithdrawView,
    ApplicationTimelineView,
)

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'interviews', InterviewViewSet, basename='interview')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('company/dashboard/', CompanyDashboardView.as_view(), name='company_dashboard'),
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

    # Offer Lifecycle
    path('offers/<int:pk>/close/', OfferCloseView.as_view(), name='offer_close'),
    path('offers/<int:pk>/reopen/', OfferReopenView.as_view(), name='offer_reopen'),
    path('offers/<int:pk>/archive/', OfferArchiveView.as_view(), name='offer_archive'),

    # Student Application Dashboard
    path('applications/mine/', ApplicationMineView.as_view(), name='applications_mine'),
    path('applications/pending/', ApplicationPendingView.as_view(), name='applications_pending'),
    path('applications/accepted/', ApplicationAcceptedView.as_view(), name='applications_accepted'),
    path('applications/<int:pk>/withdraw/', ApplicationWithdrawView.as_view(), name='application_withdraw'),
    path('applications/<int:pk>/timeline/', ApplicationTimelineView.as_view(), name='application_timeline'),
]
