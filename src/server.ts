import net from "node:net";
import { PacketParser } from "./service/protocol.ts";
import type { Player } from "./types.ts";



const server = net.createServer((socket) => {
  console.log("Client connected!");
  const player:Player  = {
    id: socket.remoteAddress + ":" + socket.remotePort,
    name: "Unknown"
  };
  const paketParser= new PacketParser();
 let chunkCount =1;
  socket.on("data", (data: Buffer) => {
    const messages = paketParser.parse(data);
    for (const message of messages) {
      if(message.type === "JOIN"){
        player.name = message.payload.name;
        console.log(`Player joined: ${player.name} (${player.id})`);
      } else {
        console.log(`Received message of type: ${message.type}`);
      }
    }
    chunkCount++;
  });
  socket.on("close", () => {
    console.log(`Player disconnected ${player.id}`);
  });
});

server.listen(3000, "0.0.0.0",()=>{
  console.log("Server listening on port 3000");
});