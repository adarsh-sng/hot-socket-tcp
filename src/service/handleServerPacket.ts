import { GameEndPacket, GameStartPacket, PacketType, QuestionPacket, ResultPacket } from "../types";
import { gameState } from "../client";
import { renderGameUI } from "../ui/game";
import { ANSIColors } from "../utils/ansi";

const handleServerPacket = (socket: any, message: any) => {
    switch (message.type) {
      case PacketType.GAME_START:
        handleGameStart(socket, message);
        break;
      case PacketType.QUESTION:
        handleQuestion(socket, message);
        break;
      case PacketType.RESULT:
        handleResult(socket, message);
        break;
      case PacketType.GAME_END:
        handleGameEnd(socket, message);
        break;
    }
}

const handleGameStart = (_socket: any, packet: GameStartPacket) => {
  gameState.gameStarted = true;
  gameState.gameId = packet.payload.gameId;
  gameState.opponentName = packet.payload.opponentName;
  gameState.mode = packet.payload.mode;
  gameState.myScore = 0;
  gameState.opponentScore = 0;
  gameState.gameStartTime = Date.now();
  
  console.clear();
  console.log(`\n🎮 Game Started! Playing ${packet.payload.mode} against ${packet.payload.opponentName}`);
  console.log(`Game ID: ${packet.payload.gameId}\n`);
};

const handleQuestion = (_socket: any, packet: QuestionPacket) => {
  gameState.currentQuestion = {
    id: packet.payload.problemId,
    text: packet.payload.text,
    deadline: packet.payload.deadline,
    startTime: Date.now(),
  };
  gameState.lastResult = null; 
  renderGameUI();
}

const handleResult = (_socket: any, packet: ResultPacket) => {
  gameState.lastResult = {
    correct: packet.payload.correct,
    message: packet.payload.message,
  };
  gameState.myScore = packet.payload.myScore;
  gameState.opponentScore = packet.payload.opponentScore;
  
  // Clear current question when receiving any result
  // (either we answered or opponent answered)
  gameState.currentQuestion = null;
  renderGameUI();
}

const handleGameEnd = (_socket: any, packet: GameEndPacket) => {
  gameState.gameEnded = true;
  gameState.won = packet.payload.won;
  gameState.gameEndReason = packet.payload.reason;
  
  gameState.myScore = packet.payload.myScore;
  gameState.opponentScore = packet.payload.opponentScore;
  
  // Render final game state
  renderGameUI();
  
  console.log(`\n\n${packet.payload.won ? '🎉 YOU WON!' : '😢 YOU LOST!'}`);
  console.log(`Reason: ${packet.payload.reason}`);
  console.log(`Final Score: You ${gameState.myScore} - ${gameState.opponentScore} ${gameState.opponentName}`);
  console.log(`\n${ANSIColors.CYAN}Press Ctrl+C to exit${ANSIColors.RESET}\n`);
}

export { handleServerPacket };