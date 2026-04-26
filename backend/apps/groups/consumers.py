import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from .models import StudyGroup, GroupMessage


class GroupChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        
        if not user or user.is_anonymous:
            await self.close()
            return

        self.user = user
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.group_name = f"group_chat_{self.group_id}"

        # Verify user is a member of the group
        is_member = await self.verify_group_membership()
        if not is_member:
            await self.close()
            return

        # Join the group's chat room
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        await self.send(text_data=json.dumps({
            "type": "connection_established",
            "message": f"Connected to group {self.group_id}",
            "group_id": self.group_id
        }))

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        """Handle incoming messages"""
        try:
            data = json.loads(text_data)
            action = data.get("action")
            
            if action == "send_message":
                content = data.get("content")
                if content and len(content.strip()) > 0:
                    message = await self.save_message(content)
                    if message:
                        # Broadcast to all users in the group
                        await self.channel_layer.group_send(
                            self.group_name,
                            {
                                "type": "chat_message",
                                "message_id": message.id,
                                "sender": self.user.get_full_name(),
                                "sender_id": self.user.id,
                                "content": message.content,
                                "timestamp": message.timestamp.isoformat()
                            }
                        )
        except json.JSONDecodeError:
            pass

    async def chat_message(self, event):
        """Broadcast message to WebSocket"""
        await self.send(text_data=json.dumps({
            "type": "chat_message",
            "message_id": event.get("message_id"),
            "sender": event.get("sender"),
            "sender_id": event.get("sender_id"),
            "content": event.get("content"),
            "timestamp": event.get("timestamp")
        }))

    @database_sync_to_async
    def verify_group_membership(self):
        """Check if user is a member of the group"""
        try:
            if not hasattr(self.user, 'student_profile'):
                return False
            
            group = StudyGroup.objects.get(id=self.group_id)
            return group.members.filter(
                student=self.user.student_profile
            ).exists()
        except StudyGroup.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content):
        """Save message to database"""
        try:
            group = StudyGroup.objects.get(id=self.group_id)
            message = GroupMessage.objects.create(
                group=group,
                sender=self.user,
                content=content
            )
            return message
        except StudyGroup.DoesNotExist:
            return None
