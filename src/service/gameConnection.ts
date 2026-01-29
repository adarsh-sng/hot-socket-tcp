import { GameMode, GameStartPacket, PacketType } from "../types.ts";
import { addToQueue, games, getGameBySocket, removeFromQueue, removeGame, socketToPlayer, tryMatch } from "./gameLogic.ts";
import { PacketParser } from "./protocol.ts";
import type { GameEndPacket, GamePacket, JoinPacket, LeavePacket, Player, SubmitPacket } from "../types.ts";
import { randomUUID } from "node:crypto";

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
      socket: socket
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
      const packet = endGamePacket(true, "Opponent left the game.");
      const opponentSocket = game.player1.player.id === playerId ? game.player2.socket : game.player1.socket;
      opponentSocket.write(encode(packet));
    }
  }
  handleSubmit(socket: any, message: SubmitPacket) {
    const game = getGameBySocket(socket);
    if (!game || !game.currentQuestion) return;
    const correct = (message.payload.answer === game.currentQuestion.correctAnswer);

    // 3. If correct → pass bomb
    if (correct) {

      // Switch active player
      // Generate new question
      // Send QUESTION packet to opponent
      // Send RESULT packet to this player (you passed the bomb!)
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

}