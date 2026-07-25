from fastapi import WebSocket
from typing import Dict, Optional
import asyncio
import random

WORDS = [
    "ocean", "mountain", "river", "forest", "desert", "castle", "knight", 
    "dragon", "wizard", "galaxy", "planet", "star", "ship", "captain", 
    "pirate", "treasure", "island", "monster", "vampire", "werewolf", 
    "zombie", "ghost", "skeleton", "pizza", "burger", "coffee", "tea", 
    "chocolate", "guitar", "piano", "violin", "drum", "trumpet"
]

class Lobby:
    def __init__(self, lobby_id: str):
        self.lobby_id = lobby_id
        # websocket -> player_name
        self.connections: Dict[WebSocket, str] = {}
        self.target_word: str = ""
        self.target_vector = None
        self.base_time: int = 60
        self.time_left: int = 60
        self.timer_task: Optional[asyncio.Task] = None
        self.round_number: int = 1
        self.max_rounds: int = 3
        self.best_guesses: Dict[str, float] = {}
        self.scores: Dict[str, int] = {}
        self.revealed_indices: list = []
        self.host: Optional[str] = None
        self.game_started: bool = False

class LobbyManager:
    def __init__(self):
        self.lobbies: Dict[str, Lobby] = {}

    async def _timer_loop(self, lobby_id: str):
        lobby = self.lobbies.get(lobby_id)
        if not lobby: return
        
        while lobby.time_left > 0:
            await asyncio.sleep(1)
            # Check if lobby still exists
            if lobby_id not in self.lobbies: return
            lobby.time_left -= 1
            
            if lobby.time_left == 40 or lobby.time_left == 20:
                hidden_indices = [i for i in range(len(lobby.target_word)) if i not in lobby.revealed_indices]
                if hidden_indices:
                    lobby.revealed_indices.append(random.choice(hidden_indices))
                    
            hint_chars = []
            for i, char in enumerate(lobby.target_word):
                if i in lobby.revealed_indices:
                    hint_chars.append(char)
                else:
                    hint_chars.append("_")
            hint = " ".join(hint_chars)
            
            await self.broadcast(lobby_id, {"type": "TIMER_TICK", "seconds_left": lobby.time_left, "hint": hint})
            
        # Time is up! Calculate scores based on best_guesses
        scores_awarded = {}
        for player, best_score in lobby.best_guesses.items():
            points = int(best_score)
            scores_awarded[player] = points
            lobby.scores[player] = lobby.scores.get(player, 0) + points
            
        # For players who didn't guess anything
        for player in lobby.connections.values():
            if player not in scores_awarded:
                scores_awarded[player] = 0
                lobby.scores[player] = lobby.scores.get(player, 0)
                
        # Broadcast round end
        is_last_round = lobby.round_number >= lobby.max_rounds
        await self.broadcast(lobby_id, {
            "type": "ROUND_END", 
            "word": lobby.target_word,
            "scores_awarded": scores_awarded,
            "total_scores": lobby.scores,
            "is_last_round": is_last_round
        })
        
        if lobby.round_number >= lobby.max_rounds:
            # Game over
            sorted_players = sorted(lobby.scores.items(), key=lambda x: x[1], reverse=True)
            winners = [p[0] for p in sorted_players]
            await self.broadcast(lobby_id, {
                "type": "GAME_OVER",
                "winners": winners,
                "total_scores": lobby.scores
            })
            return
            
        # Wait 10 seconds before next round
        lobby.round_number += 1
        await asyncio.sleep(10)
        
        if lobby_id in self.lobbies:
            await self.start_game(lobby_id)

    async def start_game(self, lobby_id: str, reset_all: bool = False):
        from ..core.nlp_engine import nlp_engine
        if lobby_id not in self.lobbies: return
        lobby = self.lobbies[lobby_id]
        
        # Wait for model to load if it's still downloading in the background
        while nlp_engine.model is None:
            await asyncio.sleep(1)
            
        lobby.game_started = True
        
        await self.sync_players(lobby_id)
        
        if reset_all:
            lobby.round_number = 1
            lobby.scores = {}
        
        # Reset state
        lobby.target_word = random.choice(WORDS)
        lobby.target_vector = nlp_engine.get_embedding(lobby.target_word)
        lobby.time_left = lobby.base_time
        lobby.best_guesses = {}
        lobby.revealed_indices = []
        
        if lobby.timer_task:
            lobby.timer_task.cancel()
            
        lobby.timer_task = asyncio.create_task(self._timer_loop(lobby_id))
        
        hint = " ".join(["_"] * len(lobby.target_word))
        # Broadcast round start / reset timer
        await self.broadcast(lobby_id, {"type": "TIMER_TICK", "seconds_left": 60, "hint": hint})

    def get_lobby(self, lobby_id: str) -> Lobby:
        if lobby_id not in self.lobbies:
            self.lobbies[lobby_id] = Lobby(lobby_id)
        return self.lobbies[lobby_id]

    async def connect(self, websocket: WebSocket, lobby_id: str, player_name: str) -> bool:
        if lobby_id not in self.lobbies:
            self.lobbies[lobby_id] = Lobby(lobby_id)
        lobby = self.lobbies[lobby_id]
        
        # Enforce max 7 players
        if len(lobby.connections) >= 7 and player_name not in lobby.connections.values():
            return False
            
        await websocket.accept()
        lobby.connections[websocket] = player_name
        
        if lobby.host is None:
            lobby.host = player_name
            
        return True

    def disconnect(self, websocket: WebSocket, lobby_id: str):
        if lobby_id in self.lobbies:
            lobby = self.lobbies[lobby_id]
            if websocket in lobby.connections:
                player_name = lobby.connections[websocket]
                del lobby.connections[websocket]
                
                if not lobby.connections:
                    if lobby.timer_task:
                        lobby.timer_task.cancel()
                    del self.lobbies[lobby_id]
                else:
                    if lobby.host == player_name:
                        lobby.host = list(lobby.connections.values())[0]
                        asyncio.create_task(self.sync_players(lobby_id))

    async def sync_players(self, lobby_id: str):
        if lobby_id in self.lobbies:
            lobby = self.lobbies[lobby_id]
            players = list(lobby.connections.values())
            from ..models.events import SyncEvent
            sync_event = SyncEvent(
                players=players,
                host=lobby.host or "",
                game_started=lobby.game_started,
                settings={"rounds": lobby.max_rounds, "time": lobby.base_time}
            ).model_dump()
            await self.broadcast(lobby_id, sync_event)

    async def broadcast(self, lobby_id: str, payload: dict):
        if lobby_id in self.lobbies:
            lobby = self.lobbies[lobby_id]
            dead_connections = []
            for connection in lobby.connections:
                try:
                    await connection.send_json(payload)
                except Exception as e:
                    print(f"Error broadcasting to connection: {e}")
                    dead_connections.append(connection)
                    
            for dead in dead_connections:
                self.disconnect(dead, lobby_id)

lobby_manager = LobbyManager()
