import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import Notification

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        
        if not user or user.is_anonymous:
            await self.close()
            return

        self.user = user
        self.group_name = f"notifications_{self.user.id}"

        # Join the user's notification group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        await self.send(text_data=json.dumps({
            "type": "connection_established",
            "message": "Connected to notifications"
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        # Handle optional incoming messages like marking as read
        try:
            data = json.loads(text_data)
            action = data.get("action")
            
            if action == "mark_read":
                notification_id = data.get("notification_id")
                if notification_id:
                    success = await self.mark_notification_as_read(notification_id)
                    if success:
                        await self.send(text_data=json.dumps({
                            "type": "marked_read",
                            "notification_id": notification_id
                        }))
        except json.JSONDecodeError:
            pass

    async def notification_message(self, event):
        """
        Handler for messages forwarded to the group via channel_layer.group_send
        """
        await self.send(text_data=json.dumps({
            "type": "notification",
            "notification": event["notification"]
        }))

    async def notification_read(self, event):
        """Handler for 'notification_read' event."""
        await self.send(text_data=json.dumps({
            "type": "notification_read",
            "notification_id": event["notification_id"]
        }))

    async def all_notifications_read(self, event):
        """Handler for 'all_notifications_read' event."""
        await self.send(text_data=json.dumps({
            "type": "all_notifications_read"
        }))

    async def notifications_cleared(self, event):
        """Handler for 'notifications_cleared' event."""
        await self.send(text_data=json.dumps({
            "type": "notifications_cleared"
        }))

    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            if not notification.is_read:
                notification.is_read = True
                notification.read_at = timezone.now()
                notification.save(update_fields=['is_read', 'read_at'])
            return True
        except Notification.DoesNotExist:
            return False
