import { PacketType, type GameSession } from "../types.ts";
import { addToQueue, games, getGameBySocket, removeFromQueue, removeGame, socketToPlayer } from "./gameState.ts";
import type { JoinPacket, LeavePacket, Player, SubmitPacket } from "../types.ts";
import { randomUUID } from "node:crypto";
import { createActiveQuestion, getRandomQuestion } from "./questionManager.ts";
import { GameConfig } from "../config.ts";
import { sendPacket, createStartGamePacket, createEndGamePacket, createQuestionPacket, createResultPacket } from "../utils/packetUtils.ts";
import { switchActivePlayer, getActivePlayer, getOpponentSocket } from "../utils/gameUtils.ts";
import { startQuestionTimer, startGameTimer, clearAllTimers, handleQuestionTimeout, handleGameTimeout } from "../utils/timerUtils.ts";

export class PacketHandler {
  handlePacket(socket: any, message: any): void {
    switch (message.type) {
      case PacketType.JOIN:
        this.handleJoin(socket, message);
        break;
      case PacketType.LEAVE:
        this.handleLeave(socket, message);
        break;
      case PacketType.SUBMIT:
        this.handleSubmit(socket, message);
        break;
    }
  }

  handleJoin(socket: any, message: JoinPacket): void {
    const player: Player = {
      id: randomUUID().toString(),
      name: message.payload.name,
      preferredMode: message.payload.preferredMode,
      socket: socket,
    };

    const gameId = addToQueue(player);

    if (gameId) {
      this.notifyGameStart(gameId);
    } else {
      console.log(`${player.name} added to queue, waiting for opponent...`);
    }
  }

  handleLeave(socket: any, _message?: LeavePacket): void {
    const playerId = socketToPlayer.get(socket);
    if (!playerId) return;

    removeFromQueue(playerId);

    const game = getGameBySocket(socket);
    if (game) {
      clearAllTimers(game);
      const opponentSocket = getOpponentSocket(game, socket);
      const packet = createEndGamePacket(true, "Opponent left the game.");
      sendPacket(opponentSocket, packet);
      removeGame(game.id);
    }
  }

  handleSubmit(socket: any, message: SubmitPacket): void {
    const game = getGameBySocket(socket);
    if (!game || !game.currentQuestion) return;

    const playerAnswer = message.payload.answer.trim().toLowerCase();
    const correctAnswer = game.currentQuestion.correctAnswer.trim().toLowerCase();
    const isCorrect = playerAnswer === correctAnswer;

    if (isCorrect) {
      this.handleCorrectAnswer(game, socket);
    } else {
      this.handleWrongAnswer(game, socket);
    }
  }

  private notifyGameStart(gameId: string): void {
    const game = games.get(gameId);
    if (!game) return;

    const packet1 = createStartGamePacket(gameId, game.player2.player.name, game.mode);
    sendPacket(game.player1.socket, packet1);

    const packet2 = createStartGamePacket(gameId, game.player1.player.name, game.mode);
    sendPacket(game.player2.socket, packet2);

    console.log(`Game started: ${game.player1.player.name} vs ${game.player2.player.name}`);

    this.startGameFlow(game);
  }

  private startGameFlow(game: GameSession): void {
    this.sendNextQuestion(game);
    startGameTimer(game, () => handleGameTimeout(game));
    const activePlayer = getActivePlayer(game);
    console.log(`Question sent to ${activePlayer.player.name}: ${game.currentQuestion?.text}`);
  }

  private handleCorrectAnswer(game: GameSession, socket: any): void {
    if (game.questionTimer) {
      clearTimeout(game.questionTimer);
      game.questionTimer = null;
    }
    const activePlayer = getActivePlayer(game);
    activePlayer.score += GameConfig.CORRECT_ANSWER_POINTS;
    const resultPacket = createResultPacket(true, "Correct! You passed the bomb!");
    sendPacket(socket, resultPacket);
    switchActivePlayer(game);
    this.sendNextQuestion(game);
  }

  private handleWrongAnswer(game: GameSession, socket: any): void {
    const losePacket = createEndGamePacket(false, "Wrong answer! You lost.");
    sendPacket(socket, losePacket);
    const opponentSocket = getOpponentSocket(game, socket);
    const winPacket = createEndGamePacket(true, "Opponent answered incorrectly! You won.");
    sendPacket(opponentSocket, winPacket);
    removeGame(game.id);
  }

  private sendNextQuestion(game: GameSession): void {
    const question = getRandomQuestion(game.usedQuestionIds);
    game.currentQuestion = createActiveQuestion(question, GameConfig.QUESTION_TIMEOUT);
    const activePlayer = getActivePlayer(game);
    const questionPacket = createQuestionPacket(
      game.currentQuestion.problemId,
      game.currentQuestion.text,
      game.currentQuestion.deadline
    );
    sendPacket(activePlayer.socket, questionPacket);
    startQuestionTimer(game, () => handleQuestionTimeout(game));
  }
}
