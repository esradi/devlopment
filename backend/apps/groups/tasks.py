from celery import shared_task
from channels.layers import get_channel_layer
import asyncio


@shared_task
def broadcast_group_message(group_id, message_data):
    """Broadcast a message to all WebSocket connections in a group"""
    try:
        channel_layer = get_channel_layer()
        group_name = f"group_chat_{group_id}"
        
        asyncio.run(channel_layer.group_send(
            group_name,
            {
                "type": "chat_message",
                "message_id": message_data.get("id"),
                "sender": message_data.get("sender_name"),
                "sender_id": message_data.get("sender"),
                "content": message_data.get("content"),
                "timestamp": message_data.get("timestamp")
            }
        ))
    except Exception as e:
        print(f"Error broadcasting message: {e}")
