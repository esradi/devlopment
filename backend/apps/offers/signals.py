from django.db.models.signals import post_save
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Message
from .serializers import MessageSerializer
from apps.notifications.services import NotificationService

@receiver(post_save, sender=Message)
def broadcast_new_message(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        serializer = MessageSerializer(instance)
        
        # 1. Create a persistent notification for the bell icon
        try:
            NotificationService.notify_new_message(instance)
        except Exception as e:
            print(f"Failed to create notification: {e}")

        # 2. Notify the receiver via real-time chat WebSocket
        # pyrefly: ignore [missing-attribute]
        async_to_sync(channel_layer.group_send)(
            f"chat_{instance.receiver.id}",
            {
                "type": "chat_message",
                "message": serializer.data
            }
        )
        
        # 3. Also notify the sender (for multi-device sync)
        # pyrefly: ignore [missing-attribute]
        async_to_sync(channel_layer.group_send)(
            f"chat_{instance.sender.id}",
            {
                "type": "chat_message",
                "message": serializer.data
            }
        )
