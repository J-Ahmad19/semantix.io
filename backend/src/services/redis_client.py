import redis.asyncio as redis
import json
from ..core.config import settings

class RedisClient:
    def __init__(self):
        self.redis_url = settings.REDIS_URL
        self._redis = None

    async def connect(self):
        if not self._redis:
            self._redis = await redis.from_url(self.redis_url, decode_responses=True)

    async def disconnect(self):
        if self._redis:
            await self._redis.close()

    async def set_lobby_state(self, lobby_id: str, state: dict):
        await self._redis.set(f"lobby:{lobby_id}", json.dumps(state))

    async def get_lobby_state(self, lobby_id: str) -> dict:
        state = await self._redis.get(f"lobby:{lobby_id}")
        return json.loads(state) if state else {}

    async def delete_lobby_state(self, lobby_id: str):
        await self._redis.delete(f"lobby:{lobby_id}")

redis_client = RedisClient()
