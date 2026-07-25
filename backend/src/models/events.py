from pydantic import BaseModel
from typing import Optional

class BaseEvent(BaseModel):
    type: str

class JoinEvent(BaseEvent):
    type: str = "JOIN"
    player: str

class LeaveEvent(BaseEvent):
    type: str = "LEAVE"
    player: str

class GuessEvent(BaseEvent):
    type: str = "GUESS"
    word: str

class GuessResultEvent(BaseEvent):
    type: str = "GUESS_RESULT"
    player: str
    word: str
    score: int
    
class RoundWinEvent(BaseEvent):
    type: str = "ROUND_WIN"
    player: str
    word: str

class TimerTickEvent(BaseEvent):
    type: str = "TIMER_TICK"
    seconds_left: int
    hint: str

class SyncEvent(BaseEvent):
    type: str = "SYNC"
    players: list[str]
    host: str
    game_started: bool
    settings: dict[str, int]

class RoundEndEvent(BaseEvent):
    type: str = "ROUND_END"
    word: str
    scores_awarded: dict[str, int]
    total_scores: dict[str, int]

class GameOverEvent(BaseEvent):
    type: str = "GAME_OVER"
    winners: list[str]
    total_scores: dict[str, int]
