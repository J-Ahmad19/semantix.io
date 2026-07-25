from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .connection_manager import lobby_manager
from ..models.events import JoinEvent, LeaveEvent, GuessResultEvent, RoundWinEvent, SyncEvent
from ..core.nlp_engine import nlp_engine
import json
import asyncio

router = APIRouter()

@router.websocket("/{lobby_id}/{player_name}")
async def websocket_endpoint(websocket: WebSocket, lobby_id: str, player_name: str):
    success = await lobby_manager.connect(websocket, lobby_id, player_name)
    if not success:
        await websocket.close(code=1008, reason="Lobby is full")
        return
    
    lobby = lobby_manager.get_lobby(lobby_id)
    
    # Sync current players to the new player
    await lobby_manager.sync_players(lobby_id)

    try:
        while True:
            try:
                data = await websocket.receive_text()
            except RuntimeError:
                # Client abruptly disconnected before/during receive
                break
                
            try:
                payload = json.loads(data)
                
                if payload.get("type") == "START_GAME":
                    if player_name == lobby.host:
                        await lobby_manager.start_game(lobby_id)
                    continue

                if payload.get("type") == "PLAY_AGAIN":
                    lobby.game_started = False
                    # Broadcast sync so everyone goes back to waiting room
                    await lobby_manager.sync_players(lobby_id)
                    continue
                
                if payload.get("type") == "GUESS":
                    guess = payload.get("word", "").strip()
                    if not guess:
                        continue
                        
                    # Calculate Similarity
                    if guess.lower() == lobby.target_word.lower():
                        score = 100
                    else:
                        score = nlp_engine.calculate_similarity(guess, lobby.target_vector)
                        
                    # Update best guess for this player in current round
                    current_best = lobby.best_guesses.get(player_name, 0)
                    if score > current_best:
                        lobby.best_guesses[player_name] = score
                        
                    result_event = GuessResultEvent(
                        player=player_name, 
                        word=guess, 
                        score=score
                    ).model_dump()
                    await lobby_manager.broadcast(lobby_id, result_event)

            except json.JSONDecodeError:
                pass
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        lobby_manager.disconnect(websocket, lobby_id)
        leave_event = LeaveEvent(player=player_name).model_dump()
        asyncio.create_task(lobby_manager.broadcast(lobby_id, leave_event))
