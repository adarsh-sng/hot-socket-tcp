// 1. The Definitions (Enum)
export enum PacketType {
  JOIN = 'JOIN',           // Client -> Server: "I want to play"
  GAME_START = 'GAME_START', // Server -> Client: "Match found! Here is your opponent"
  QUESTION = 'QUESTION',   // Server -> Client: "Solve this before the deadline"
  SUBMIT = 'SUBMIT',       // Client -> Server: "Here is my answer"
  RESULT = 'RESULT',       // Server -> Client: "Your answer was Correct/Wrong"
  GAME_END = 'GAME_END',   // Server -> Client: "Game Over. You Win/Lose"
  LEAVE = 'LEAVE'          // Client -> Server: "I quit"
}

export enum GameState {
  STARTING,
  IN_PROGRESS,
  PAUSED,
  ENDED
}

export enum GameMode {
  HOT_POTATO = 'HOT_POTATO', // Fixed global timer, short turns
  VOLLEYBALL = 'VOLLEYBALL'  // Timer shrinks every turn
}

export interface Player {
  id: string;
  name: string;
  preferredMode?: GameMode;
}
interface PlayerSession {
  player: Player;
  socket: net.Socket;
  score: number;
  hasAnswered: boolean;
  isActive: boolean; // whose turn it is
}
export interface GameSession {
  id: string;
  player1: PlayerSession;
  player2: PlayerSession;
  mode: GameMode;
  state: GameState;
  currentQuestion: ActiveQuestion | null;
  startTime: number;
  questionHistory: QuestionResult[];
  
  // Timers
  gameTimer: NodeJS.Timeout | null;
  questionTimer: NodeJS.Timeout | null;
}
export interface BasePacket {
  type: PacketType;
}

// --- CLIENT TO SERVER ---

export interface JoinPacket extends BasePacket {
  type: PacketType.JOIN;
  payload: {
    name: string;
    preferredMode?: GameMode; // Optional: If you want to let them choose
  };
}

export interface SubmitPacket extends BasePacket {
  type: PacketType.SUBMIT;
  payload: {
    answer: string; // The user's input (e.g. "4", "Paris", or code)
  };
}

export interface LeavePacket extends BasePacket {
  type: PacketType.LEAVE;
}

// --- SERVER TO CLIENT ---

export interface GameStartPacket extends BasePacket {
  type: PacketType.GAME_START;
  payload: {
    gameId: string;
    opponentName: string;
    mode: GameMode;
  };
}

export interface QuestionPacket extends BasePacket {
  type: PacketType.QUESTION;
  payload: {
    problemId: string;
    text: string;      // "What is 2 + 2?"
    deadline: number; 
  };
}

export interface ResultPacket extends BasePacket {
  type: PacketType.RESULT;
  payload: {
    correct: boolean;
    message: string;   // "Correct! Sending bomb to opponent..." or "Wrong answer!"
  };
}

export interface GameEndPacket extends BasePacket {
  type: PacketType.GAME_END;
  payload: {
    won: boolean;
    reason: string; // "Opponent exploded" or "You ran out of time"
  };
}
export type GamePacket = 
  | JoinPacket
  | GameStartPacket
  | QuestionPacket
  | SubmitPacket
  | ResultPacket
  | GameEndPacket
  | LeavePacket;