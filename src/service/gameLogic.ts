import { GameMode, GameSession, GameState, Player } from "../types";
import { randomUUID } from 'crypto';
export const games = new Map<string, GameSession>(); // gameId -> GameSession
export const playerToGame = new Map<string, string>(); // 1. playerId -> gameId
export const socketToPlayer = new Map<any, string>(); // 2. socket -> playerId
const waitingQueue: Player[] = [];

export function addToQueue(player: Player): string | null {
  // Check if already in queue
  if (waitingQueue.find(p => p.id === player.id)) {
    return null;
  }
  waitingQueue.push(player);
  socketToPlayer.set(player.socket, player.id);
  console.log(`${player.name} joined queue. Queue size: ${waitingQueue.length}`);
  return tryMatch();
}

export function tryMatch(): string | null {
  if (waitingQueue.length < 2) {
    return null;
  }
  const player1 = waitingQueue.shift()!;
  const player2 = waitingQueue.shift()!;
  return createGame(player1, player2);
}

export function removeFromQueue(playerId: string): void {
  const index = waitingQueue.findIndex(p => p.id === playerId);
  if (index !== -1) {
    waitingQueue.splice(index, 1);
  }
}
export function createGame(player1: Player, player2: Player): string {
  const gameId = randomUUID();
  const gameSession: GameSession = {
    id: gameId,
    mode: player1.preferredMode || GameMode.HOT_POTATO,
    state: GameState.STARTING,
    startTime: Date.now(),
    player1: {
      player: player1,
      socket: player1.socket,
      score: 0,
      isActive: true  
    },
    player2: {
      player: player2,
      socket: player2.socket,
      score: 0,
      isActive: false
    },
    currentQuestion: null,
    questionHistory: [],
    gameTimer: null,
    questionTimer: null
  };
  
  games.set(gameId, gameSession);
  playerToGame.set(player1.id, gameId);
  playerToGame.set(player2.id, gameId);
  console.log(`Game created: ${player1.name} vs ${player2.name} (${gameId})`);
  return gameId;
}

export function getGame(gameId: string): GameSession | undefined { // Get game by game ID
  return games.get(gameId);
}

export function getGameByPlayerId(playerId: string): GameSession | undefined { // playerId -> gameId -> GameSession
  const gameId = playerToGame.get(playerId);
  return gameId ? games.get(gameId) : undefined;
}
export function getGameBySocket(socket: any): GameSession | undefined { // socket -> playerId -> gameId -> GameSession
  const playerId = socketToPlayer.get(socket);
  return playerId ? getGameByPlayerId(playerId) : undefined;
}

export function getPlayerIdBySocket(socket: any): string | undefined {
  return socketToPlayer.get(socket);
}

export function removeGame(gameId: string): void {
  const game = games.get(gameId);
  if (!game) return;
  
  // Clear timers
  if (game.gameTimer) clearTimeout(game.gameTimer);
  if (game.questionTimer) clearTimeout(game.questionTimer);
  
  // Remove from maps
  playerToGame.delete(game.player1.player.id);
  playerToGame.delete(game.player2.player.id);
  games.delete(gameId);
  
  console.log(`Game removed: ${gameId}`);
}

export function getActiveGames(): GameSession[] { // get all active games
  return Array.from(games.values()).filter(g => g.state === GameState.IN_PROGRESS);
}


export function cleanupStaleGames(): void {
  const now = Date.now();
  const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  
  for (const [gameId, game] of games.entries()) {
    if (now - game.startTime > STALE_THRESHOLD) {
      console.log(`Cleaning up stale game: ${gameId}`);
      removeGame(gameId);
    }
  }
}
setInterval(cleanupStaleGames, 60_000); // Auto-cleanup every 60 seconds
