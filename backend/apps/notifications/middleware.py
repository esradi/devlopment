from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from urllib.parse import parse_qs

@database_sync_to_async
def get_user_from_token(token_key):
    """Récupère l'utilisateur depuis le JWT token"""
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        # Décoder le token
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        
        # Récupérer l'utilisateur
        user = User.objects.get(id=user_id)
        return user
    except Exception as e:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    """
    Middleware pour authentifier WebSocket avec JWT
    """
    async def __call__(self, scope, receive, send):
        # Récupérer le token depuis query params
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]
        
        if token:
            # Authentifier avec le token
            scope['user'] = await get_user_from_token(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await super().__call__(scope, receive, send)
