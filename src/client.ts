import net from "net";
import { encodeMessage } from "./protocol.ts";

const client = new net.Socket();

client.connect(3000, "127.0.0.1", () => {
  console.log("Connected!");

  // SENDING 5 MESSAGES INSTANTLY
  // These are valid JSON individually: {"name":"Player"}
  const msg = { name: "Adarsh" };
  
  // We write them one after another without waiting
  client.write(encodeMessage(msg));
  client.write(encodeMessage(msg));
  client.write(encodeMessage(msg));
  client.write(encodeMessage(msg));
 
});