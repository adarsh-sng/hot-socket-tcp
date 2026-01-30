import type { GameSession, PlayerSession } from "../types.ts";

export const switchActivePlayer = (game: GameSession): void => {
  game.player1.isActive = !game.player1.isActive;
  game.player2.isActive = !game.player2.isActive;
};

export const getActivePlayer = (game: GameSession): PlayerSession => {
  return game.player1.isActive ? game.player1 : game.player2;
};

export const getInactivePlayer = (game: GameSession): PlayerSession => {
  return game.player1.isActive ? game.player2 : game.player1;
};

export const getOpponentSocket = (game: GameSession, currentSocket: any): any => {
  return game.player1.socket === currentSocket ? game.player2.socket : game.player1.socket;
};
