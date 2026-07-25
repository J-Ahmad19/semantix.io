export interface BaseEvent {
  type: string;
}

export interface JoinEvent extends BaseEvent {
  type: 'JOIN';
  player: string;
}

export interface LeaveEvent extends BaseEvent {
  type: 'LEAVE';
  player: string;
}

export interface GuessResultEvent extends BaseEvent {
  type: 'GUESS_RESULT';
  player: string;
  word: string;
  score: number;
}

export interface RoundWinEvent extends BaseEvent {
  type: 'ROUND_WIN';
  player: string;
  word: string;
}

export interface TimerTickEvent extends BaseEvent {
  type: 'TIMER_TICK';
  seconds_left: number;
  hint?: string;
}

export interface SyncEvent extends BaseEvent {
  type: 'SYNC';
  players: string[];
  host: string;
  game_started: boolean;
}

export interface RoundEndEvent extends BaseEvent {
  type: 'ROUND_END';
  word: string;
  scores_awarded: Record<string, number>;
  total_scores: Record<string, number>;
}

export interface GameOverEvent extends BaseEvent {
  type: 'GAME_OVER';
  winners: string[];
  total_scores: Record<string, number>;
}

export type GameEvent = JoinEvent | LeaveEvent | GuessResultEvent | RoundWinEvent | TimerTickEvent | SyncEvent | RoundEndEvent | GameOverEvent;
export interface Player {
  name: string;
  score: number;
  active: boolean;
}

export interface GuessResult {
  player: string;
  word: string;
  score: number;
  timestamp: number;
}
