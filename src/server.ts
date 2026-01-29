import net from "node:net";
import { PacketParser } from "./service/protocol.ts";
import type { GameStartPacket,  Player }from "./types.ts";
import { addToQueue, removeFromQueue, tryMatch } from "./service/gameLogic.ts";
import { GameMode, PacketType } from "./types.ts";
import { GameManager, startGamePacket } from "./service/gameConnection.ts";





const server = net.createServer((socket) => {
  console.log("Client connected!");
  
  const paketParser= new PacketParser();
  const gameManager = new GameManager();
  let chunkCount =1;
  socket.on("data", (data: Buffer) => {
    const messages = paketParser.parse(data);
    for (const message of messages) {
    
    gameManager.handlePacket(socket, message);
  

      if(message.type === "LEAVE"){
        console.log(`Player left: ${player.name} (${player.id})`);
        socket.end();
      }
      if(message.type === "SUBMIT"){
        console.log(`Player ${player.name} submitted answer: ${message.payload.answer}`);
      }
    }
    chunkCount++;
  });
  socket.on("close", () => {
    console.log(`Player disconnected ${player.id}`);
    removeFromQueue(player.id);
  });
});

server.listen(3000, "0.0.0.0",()=>{
  console.log("Server listening on port 3000");
});