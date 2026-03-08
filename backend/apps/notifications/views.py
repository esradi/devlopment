from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Notification
from .serializers import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for viewing and managing User Notifications.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        
        # Optional filters
        notif_type = self.request.query_params.get('type')
        if notif_type:
            qs = qs.filter(type=notif_type)
            
        is_read = self.request.query_params.get('is_read')
        if is_read is not None:
            is_read_bool = str(is_read).lower() in ['true', '1', 'yes']
            qs = qs.filter(is_read=is_read_bool)
            
        return qs

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        qs = self.get_queryset().filter(is_read=False)
        total_count = qs.count()
        
        # Group by type
        from django.db.models import Count
        type_counts = qs.values('type').annotate(count=Count('type'))
        
        by_type = {item['type']: item['count'] for item in type_counts}
        
        return Response({
            "count": total_count,
            "by_type": by_type
        })

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=['is_read', 'read_at'])
            
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """
        GET /api/notifications/unread/
        
        Liste des notifications non lues uniquement
        """
        notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """
        POST /api/notifications/mark-all-read/
        
        Marquer toutes les notifications comme lues
        """
        updated = self.get_queryset().filter(is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        
        return Response({
            'message': f'{updated} notifications marked as read',
            'count': updated
        })
    
    @action(detail=True, methods=['delete'])
    def delete_notification(self, request, pk=None):
        """
        DELETE /api/notifications/<id>/
        
        Supprimer une notification
        """
        notification = self.get_object()
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['delete'], url_path='clear-all')
    def clear_all(self, request):
        """
        DELETE /api/notifications/clear-all/
        
        Supprimer toutes les notifications lues
        """
        deleted = self.get_queryset().filter(is_read=True).delete()
        
        return Response({
            'message': f'{deleted[0]} notifications deleted',
            'count': deleted[0]
        })
