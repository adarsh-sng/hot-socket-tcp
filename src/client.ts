import net from "net";
import { GameMode, JoinPacket, LeavePacket, PacketType } from "./types.ts";
import { sendPacket } from "./utils/packetUtils.ts";
import { PacketParser } from "./service/protocol.ts";

const client = new net.Socket();
const packetParser = new PacketParser();
client.on('error', (err) => {
    console.log("❌ Failed to connect to the server:", err.message);
});
export const connectClient =  (ip: string) => {
  client.connect(3000, ip);
}

client.on("connect",()=>{
  let joinPacket:JoinPacket = {
    type: PacketType.JOIN,
    payload: {
      name: "Player1",
      preferredMode: GameMode.HOT_POTATO
    }
  }
  sendPacket(client, joinPacket);
  console.log("Connected to the server");
})

client.on("data",(data)=>{
  const messages = packetParser.parse(data);
    for (const message of messages) {
      handleServerPacket(client, message);
    }
})


client.on("close",()=>{
  console.log("Connection closed");
})