import net from "node:net";
import { PacketParser } from "./service/protocol.ts";
import {  PacketType } from "./types.ts";
import { GameManager} from "./service/gameConnection.ts";

const server = net.createServer((socket) => {
  console.log("Client connected!");
  const paketParser= new PacketParser();
  const gameManager = new GameManager();
  let ip = socket.remoteAddress+":"+socket.remotePort;
  socket.on("data", (data: Buffer) => {
    const messages = paketParser.parse(data);
    for (const message of messages) {
    gameManager.handlePacket(socket, message);
    }
  
  });
  socket.on("close", () => {
   gameManager.handleLeave(socket, {type: PacketType.LEAVE});
    console.log(`Client disconnected! ${ip}`);
  });
});

server.listen(3000, "0.0.0.0",()=>{
  console.log("Server listening on port 3000");
});