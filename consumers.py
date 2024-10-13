import json
from channels.generic.websocket import AsyncWebsocketConsumer

class SignalingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        await self.channel_layer.group_add(self.room_code, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_code, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'chat')  # 'chat' by default

        if message_type == 'doubt':
            # Send only to teacher
            teacher_channel_name = "teacher_channel"
            await self.channel_layer.send(teacher_channel_name, {
                'type': 'doubt_message',
                'message': data['message']
            })
        else:
            # Send to all users in the room
            await self.channel_layer.group_send(self.room_code, {
                'type': 'chat_message',
                'message': data['message']
            })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))

    async def doubt_message(self, event):
        await self.send(text_data=json.dumps({
            'doubt': event['message']
        }))
