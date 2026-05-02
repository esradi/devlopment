import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db.models import Q
from apps.offers.models import Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        
        if not user or user.is_anonymous:
            await self.close()
            return

        self.user = user
        self.room_group_name = f"chat_{self.user.id}"

        # Join personal chat group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # We handle sending via REST API (AdminMessages.jsx does this)
        # But we could also handle it here if needed.
        pass

    async def chat_message(self, event):
        """
        Receive message from group and send to WebSocket
        """
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message": event["message"]
        }))
