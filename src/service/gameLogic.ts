
import { GameMode, Match, Player } from "../types";
import { randomUUID } from 'crypto';
let waitingUser:string|null = null;

export function findMatch(user: string) {
  if (waitingUser) {
    const opponent = waitingUser;
    waitingUser = null;
    return opponent;
  } else {
    waitingUser = user;
    return null;
  }
}

export function removeWaitingUser(user: string) {
  if (waitingUser === user) {
    waitingUser = null;
  }
} 
let matchIDCounter = 1;
// export interface Match {
//   player1: Player;
//   player2: Player;
//   mode: GameMode;
// }
export const matches = new Map<string, Match>();

export function createMatch(user1: Player, user2: Player, mode: GameMode = GameMode.HOT_POTATO): string {
  const matchId = randomUUID(); 
  matches.set(matchId, {
    player1: user1,
    player2: user2,
    mode: mode
  });
  return matchId;
}

