import net from "node:net";
import { decodeMessage } from "./protocol.ts";
import type { DecodedMessage } from "./protocol.ts";

const server = net.createServer((socket) => {
  console.log("Client connected!");

  
  socket.on("data", (data: Buffer) => {
    let accumulatedBuffer: Buffer = Buffer.alloc(0);
    accumulatedBuffer = Buffer.concat([accumulatedBuffer, data]);

    while (true) {
      const result = decodeMessage(accumulatedBuffer);

      if (!result) {
        console.log("Incomplete message, waiting for more data...");
        break;
      }

      //  We got a full message! Handle it.
      const message = result.message;
      console.log("Packet Processed:", message.name);
      accumulatedBuffer = result.remaining ;
    }
  });
  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

server.listen(3000, "0.0.0.0",()=>{
  console.log("Server listening on port 3000");
});