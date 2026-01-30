// Enums
export enum PacketType {
  JOIN = 'JOIN',         
  LEAVE = 'LEAVE',
  SUBMIT = 'SUBMIT',
  GAME_START = 'GAME_START', 
  QUESTION = 'QUESTION',  
  RESULT = 'RESULT',       
  GAME_END = 'GAME_END',   
}

export enum GameState {
  STARTING,
  IN_PROGRESS,
  PAUSED,
  ENDED
}

export enum GameMode {
  HOT_POTATO = 'HOT_POTATO',
  VOLLEYBALL = 'VOLLEYBALL'
}

export interface Player {
  id: string;
  name: string;
  preferredMode?: GameMode;
  socket: any;
}

export interface PlayerSession {
  player: Player;
  socket: any;
  score: number;
  isActive: boolean;
}

export interface ActiveQuestion {
  problemId: string;
  text: string;
  correctAnswer: string;
  startTime: number;
  deadline: number;
}

export interface QuestionResult {
  problemId: string;
  playerId: string;
  answer: string;
  correct: boolean;
  timestamp: number;
}

export interface GameSession {
  id: string;
  player1: PlayerSession;
  player2: PlayerSession;
  mode: GameMode;
  state: GameState;
  currentQuestion: ActiveQuestion | null;
  startTime: number;
  usedQuestionIds: string[]; 
  gameTimer: NodeJS.Timeout | null;
  questionTimer: NodeJS.Timeout | null;
}

export interface BasePacket {
  type: PacketType;
}

export interface JoinPacket extends BasePacket {
  type: PacketType.JOIN;
  payload: {
    name: string;
    preferredMode?: GameMode;
  };
}

export interface SubmitPacket extends BasePacket {
  type: PacketType.SUBMIT;
  payload: {
    answer: string; 
  };
}

export interface LeavePacket extends BasePacket {
  type: PacketType.LEAVE;
}

export type ClientPacket = JoinPacket | SubmitPacket | LeavePacket;

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
    text: string;
    deadline: number;
  };
}

export interface ResultPacket extends BasePacket {
  type: PacketType.RESULT;
  payload: {
    correct: boolean;
    message: string;
  };
}

export interface GameEndPacket extends BasePacket {
  type: PacketType.GAME_END;
  payload: {
    won: boolean;
    reason: string;
  };
}

export type ServerPacket = GameStartPacket | QuestionPacket | ResultPacket | GameEndPacket;

export type GamePacket = ClientPacket | ServerPacket;