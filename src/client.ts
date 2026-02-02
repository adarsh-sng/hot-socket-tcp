import net from "net";
import { GameMode, JoinPacket, PacketType, SubmitPacket } from "./types.ts";
import { sendPacket } from "./utils/packetUtils.ts";
import { PacketParser } from "./service/protocol.ts";
import { handleServerPacket } from "./service/handleServerPacket.ts";

// Client game state
export interface ClientGameState {
  connected: boolean;
  gameStarted: boolean;
  gameId: string | null;
  opponentName: string | null;
  mode: GameMode | null;
  myScore: number;
  opponentScore: number;
  playerName: string;
  gameStartTime: number | null;
  currentQuestion: {
    id: string;
    text: string;
    deadline: number;
    startTime: number;
  } | null;
  lastResult: {
    correct: boolean;
    message: string;
  } | null;
  gameEnded: boolean;
  gameEndReason: string | null;
  won: boolean | null;
}

export const gameState: ClientGameState = {
  connected: false,
  gameStarted: false,
  gameId: null,
  opponentName: null,
  mode: null,
  myScore: 0,
  opponentScore: 0,
  playerName: "Player1",
  gameStartTime: null,
  currentQuestion: null,
  lastResult: null,
  gameEnded: false,
  gameEndReason: null,
  won: null,
};

const client = new net.Socket();
const packetParser = new PacketParser();

client.on('error', (err) => {
    console.log("❌ Failed to connect to the server:", err.message);
    process.exit(1);
});

export const connectClient = (ip: string, name: string) => {
  gameState.playerName = name;
  client.connect(3000, ip);
}

client.on("connect", () => {
  gameState.connected = true;
  let joinPacket: JoinPacket = {
    type: PacketType.JOIN,
    payload: {
      name: gameState.playerName,
      preferredMode: GameMode.HOT_POTATO
    }
  }
  sendPacket(client, joinPacket);
  console.log("✅ Connected to the server, waiting for opponent...");
})

client.on("data", (data: Buffer) => {
  const messages = packetParser.parse(data);
  for (const message of messages) {
    handleServerPacket(client, message);
  }
})

client.on("close", () => {
  console.log("❌ Connection closed");
  process.exit(0);
})

// Export client for sending packets
export const submitAnswer = (answer: string) => {
  const submitPacket: SubmitPacket = {
    type: PacketType.SUBMIT,
    payload: { answer }
  };
  sendPacket(client, submitPacket);
}

export { client };