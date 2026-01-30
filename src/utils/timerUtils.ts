import type { GameSession } from "../types.ts";
import { GameConfig } from "../config.ts";
import { sendPacket, createEndGamePacket } from "./packetUtils.ts";
import { getActivePlayer, getInactivePlayer } from "./gameUtils.ts";
import { removeGame } from "../service/gameState.ts";

export const startQuestionTimer = (game: GameSession, onTimeout: () => void): void => {
  if (game.questionTimer) {
    clearTimeout(game.questionTimer);
  }

  game.questionTimer = setTimeout(() => {
    onTimeout();
  }, GameConfig.QUESTION_TIMEOUT);
};

export const startGameTimer = (game: GameSession, onTimeout: () => void): void => {
  game.gameTimer = setTimeout(() => {
    onTimeout();
  }, GameConfig.GAME_TIMEOUT);
};

export const clearAllTimers = (game: GameSession): void => {
  if (game.gameTimer) clearTimeout(game.gameTimer);
  if (game.questionTimer) clearTimeout(game.questionTimer);
};

export const handleQuestionTimeout = (game: GameSession): void => {
  const activePlayer = getActivePlayer(game);
  const inactivePlayer = getInactivePlayer(game);

  const losePacket = createEndGamePacket(false, "Time's up! You couldn't answer in time.");
  sendPacket(activePlayer.socket, losePacket);

  const winPacket = createEndGamePacket(true, "You won! Your opponent couldn't answer in time.");
  sendPacket(inactivePlayer.socket, winPacket);

  removeGame(game.id);
};

export const handleGameTimeout = (game: GameSession): void => {
  const activePlayer = getActivePlayer(game);
  
  activePlayer.score += GameConfig.BOMB_EXPLOSION_PENALTY;

  if (game.player1.score > game.player2.score) {
    const winPacket = createEndGamePacket(true, "Time's up! You won by having a higher score.");
    sendPacket(game.player1.socket, winPacket);

    const losePacket = createEndGamePacket(false, "Time's up! You lost by having a lower score.");
    sendPacket(game.player2.socket, losePacket);
  } 
  else if (game.player2.score > game.player1.score) {
    const winPacket = createEndGamePacket(true, "Time's up! You won by having a higher score.");
    sendPacket(game.player2.socket, winPacket);

    const losePacket = createEndGamePacket(false, "Time's up! You lost by having a lower score.");
    sendPacket(game.player1.socket, losePacket);
  } 
  else {
    const tiePacket = createEndGamePacket(false, "Time's up! It's a tie, so you both lose.");
    sendPacket(game.player1.socket, tiePacket);
    sendPacket(game.player2.socket, tiePacket);
  }

  removeGame(game.id);
};
