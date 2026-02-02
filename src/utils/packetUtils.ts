import { GameMode, type GameStartPacket, type GameEndPacket, type QuestionPacket, type ResultPacket, PacketType, type GamePacket } from "../types.ts";
import { PacketParser } from "../service/protocol.ts";

const encode = PacketParser.encode;

export const sendPacket = (socket: any, packet: GamePacket): void => {
  socket.write(encode(packet));
};

export const createStartGamePacket = (gameId: string, opponentName: string, mode: GameMode): GameStartPacket => {
  return {
    type: PacketType.GAME_START,
    payload: { gameId, opponentName, mode }
  };
};

export const createEndGamePacket = (won: boolean, reason: string, myScore: number, opponentScore: number): GameEndPacket => {
  return {
    type: PacketType.GAME_END,
    payload: { won, reason, myScore, opponentScore }
  };
};

export const createQuestionPacket = (problemId: string, text: string, deadline: number): QuestionPacket => {
  return {
    type: PacketType.QUESTION,
    payload: { problemId, text, deadline }
  };
};

export const createResultPacket = (correct: boolean, message: string, myScore: number, opponentScore: number): ResultPacket => {
  return {
    type: PacketType.RESULT,
    payload: { correct, message, myScore, opponentScore }
  };
};
