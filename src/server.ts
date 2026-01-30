import net from "node:net";
import { PacketParser } from "./service/protocol.ts";
import { PacketType } from "./types.ts";
import { PacketHandler } from "./service/packetHandler.ts";
import { GameConfig } from "./config.ts";

const packetHandler = new PacketHandler();

const server = net.createServer((socket) => {
  console.log("Client connected!");
  const packetParser = new PacketParser();
  const clientId = `${socket.remoteAddress}:${socket.remotePort}`;

  socket.on("data", (data: Buffer) => {
    const messages = packetParser.parse(data);
    for (const message of messages) {
      packetHandler.handlePacket(socket, message);
    }
  });

  socket.on("close", () => {
    packetHandler.handleLeave(socket, { type: PacketType.LEAVE });
    console.log(`Client disconnected! ${clientId}`);
  });

  socket.on("error", (err) => {
    console.error(`Socket error for ${clientId}:`, err.message);
  });
});

server.listen(GameConfig.SERVER_PORT, GameConfig.SERVER_HOST, () => {
  console.log(`Server listening on ${GameConfig.SERVER_HOST}:${GameConfig.SERVER_PORT}`);
});