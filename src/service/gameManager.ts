import { GameMode, GameStartPacket, PacketType, type GameSession } from "../types.ts";
import { addToQueue, games, getGameBySocket, removeFromQueue, removeGame, socketToPlayer, tryMatch } from "./gameLogic.ts";
import { PacketParser } from "./protocol.ts";
import type { GameEndPacket, GamePacket, JoinPacket, LeavePacket, Player, ResultPacket, SubmitPacket } from "../types.ts";
import { randomUUID } from "node:crypto";
import { createActiveQuestion, getRandomQuestion } from "./questionManager.ts";

let encode = PacketParser.encode;

export const startGamePacket = (gameId: string, opponentName: string, mode: GameMode): GameStartPacket => {
  return {
    type: PacketType.GAME_START,
    payload: {
      gameId,
      opponentName,
      mode
    }
  }
}
export const endGamePacket = (won: boolean, reason: string): GameEndPacket => {
  return {
    type: PacketType.GAME_END,
    payload: {
      won,
      reason
    }
  }
}

export const switchActivePlayer = (game: GameSession) => {
  if (game.player1.isActive) {
    game.player1.isActive = false;
    game.player2.isActive = true;
  } else {
    game.player1.isActive = true;
    game.player2.isActive = false;
  }
}

export const questionPacket = (problemId: string, text: string, deadline: number): GamePacket => {
  return {
    type: PacketType.QUESTION,
    payload: {
      problemId,
      text,
      deadline
    }
  }
}

export class GameManager {
  handlePacket(socket: any, message: any) {
    switch (message.type) {
      case PacketType.JOIN: this.handleJoin(socket, message); break;
      case PacketType.LEAVE: this.handleLeave(socket, message); break;
      case PacketType.SUBMIT: this.handleSubmit(socket, message); break;
    }
  }
  handleJoin(socket: any, message: JoinPacket) {
    const player: Player = {
      id: randomUUID().toString(),
      name: message.payload.name,
      preferredMode: message.payload.preferredMode,
      socket: socket,
    };
    const gameId = addToQueue(player);
    if (gameId) {
      const game = games.get(gameId);
      if (!game) return;
      const player1 = game.player1;
      const player2 = game.player2;
      const packet1 = startGamePacket(
        gameId,
        player2.player.name,  // opponent name
        game.mode
      );
      player1.socket.write(encode(packet1));
      const packet2 = startGamePacket(
        gameId,
        player1.player.name,  // opponent name
        game.mode
      );
      player2.socket.write(encode(packet2));
      console.log(`Game started: ${player1.player.name} vs ${player2.player.name}`);
      this.handleStartGame(game);
    } else {
      console.log(`${player.name} added to queue, waiting for opponent...`);
    }
  }
  handleLeave(socket: any, message?: LeavePacket) {
    const playerId = socketToPlayer.get(socket);
    if (!playerId) return;
    removeFromQueue(playerId);
    const game = getGameBySocket(socket);
    if (game) {
      if (game.gameTimer) clearTimeout(game.gameTimer);
      if (game.questionTimer) clearTimeout(game.questionTimer);
      const packet = endGamePacket(true, "Opponent left the game.");
      const opponentSocket = game.player1.player.id === playerId ? game.player2.socket : game.player1.socket;
      opponentSocket.write(encode(packet));
      removeGame(game.id);
    }
  }
  handleSubmit(socket: any, message: SubmitPacket) {
    const game = getGameBySocket(socket);
    if (!game || !game.currentQuestion) return;
    const correct = (message.payload.answer.toLowerCase().trim() === game.currentQuestion.correctAnswer.toLowerCase().trim());
    if (correct) {
      if (game.questionTimer) {
        clearTimeout(game.questionTimer);
        game.questionTimer = null;
      }
      let packet: ResultPacket = {
        type: PacketType.RESULT,
        payload: {
          correct: true,
          message: "Correct! You passed the bomb!"
        }
      }
      socket.write(encode(packet));
      let activePlayer = game.player1.isActive ? game.player1 : game.player2;
      activePlayer.score++;
      switchActivePlayer(game);
      const question = getRandomQuestion(game.usedQuestionIds);
      game.currentQuestion = createActiveQuestion(question, 15000);
      activePlayer = game.player1.isActive ? game.player1 : game.player2;
      activePlayer.socket.write(encode(questionPacket(
        game.currentQuestion.problemId,
        game.currentQuestion.text,
        game.currentQuestion.deadline
      )));
      game.questionTimer = setTimeout(() => {
      let activePlayer = game.player1.isActive ? game.player1 : game.player2;
      let packet = endGamePacket(false, "Time's up! You couldn't answer in time");
      activePlayer.socket.write(encode(packet))
      packet = endGamePacket(true, "You won! your opponent couldnt answer in time");
      let opponentPlayer = game.player1.isActive ? game.player2 : game.player1;
      opponentPlayer.socket.write(encode(packet))
      removeGame(game.id);
      }, 15000);
    }
    else {
      let packet = endGamePacket(false, "Wrong answer! You lost.");
      socket.write(encode(packet));
      const opponentSocket = (game.player1.socket === socket) ? game.player2.socket : game.player1.socket;
      packet = endGamePacket(true, "Opponent answered incorrectly! You won.");
      opponentSocket.write(encode(packet));
      removeGame(game.id);
    }
  }
  handleStartGame(game: GameSession) {
    const question = getRandomQuestion(game.usedQuestionIds);
    game.currentQuestion = createActiveQuestion(question, 15000);
    const activePlayer = game.player1.isActive ? game.player1 : game.player2;
    activePlayer.socket.write(encode(questionPacket(
      game.currentQuestion.problemId,
      game.currentQuestion.text,
      game.currentQuestion.deadline
    )));
    game.questionTimer = setTimeout(() => {
      let activePlayer = game.player1.isActive ? game.player1 : game.player2;
      let packet = endGamePacket(false, "Time's up! You couldn't answer in time");
      activePlayer.socket.write(encode(packet))
      packet = endGamePacket(true, "You won! your opponent couldnt answer in time");
      let opponentPlayer = game.player1.isActive ? game.player2 : game.player1;
      opponentPlayer.socket.write(encode(packet))
      removeGame(game.id);
    }, 15000); // 15 seconds to answer
    game.gameTimer = setTimeout(() => {
      let activePlayer = game.player1.isActive ? game.player1 : game.player2;
      activePlayer.score -= 2;
      let packet: GameEndPacket;
      if (game.player1.score > game.player2.score) {
        packet = endGamePacket(true, "Time's up! You won by having a higher score.");
        game.player1.socket.write(encode(packet));
        packet = endGamePacket(false, "Time's up! You lost by having a lower score.");
        game.player2.socket.write(encode(packet));
      } else if (game.player2.score > game.player1.score) {
        packet = endGamePacket(true, "Time's up! You won by having a higher score.");
        game.player2.socket.write(encode(packet));
        packet = endGamePacket(false, "Time's up! You lost by having a lower score.");
        game.player1.socket.write(encode(packet));
      } else {
        packet = endGamePacket(false, "Time's up! It's a tie, so you both lose.");
        game.player1.socket.write(encode(packet));
        game.player2.socket.write(encode(packet));
      }
      removeGame(game.id);
    }, 60000); // 60 seconds for the entire game
    console.log(`Question sent to ${activePlayer.player.name}: ${game.currentQuestion.text}`);
  }

}