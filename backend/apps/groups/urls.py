from django.urls import path
from . import views

urlpatterns = [
    
    path('groups/', views.StudyGroupListCreateView.as_view(), name='group-list-create'),
    path('groups/<int:group_id>/', views.StudyGroupDetailView.as_view(), name='group-detail'),
    path('groups/<int:group_id>/delete/', views.GroupDeleteView.as_view(), name='group-delete'),
    path('groups/<int:group_id>/join/', views.StudyGroupJoinView.as_view(), name='group-join'),
    path('groups/<int:group_id>/leave/', views.StudyGroupLeaveView.as_view(), name='group-leave'),
    
    # Messages
    path('groups/<int:group_id>/messages/', views.GroupMessageListCreateView.as_view(), name='group-messages'),
    
    # Resources
    path('groups/<int:group_id>/resources/', views.GroupResourceListCreateView.as_view(), name='group-resources'),
]
