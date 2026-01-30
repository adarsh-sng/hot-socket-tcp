import net from "net";
import { PacketParser } from "./service/protocol.ts";
import { GameMode, JoinPacket, LeavePacket, PacketType } from "./types.ts";

let encode = PacketParser.encode;
const client = new net.Socket();
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
  client.write(encode(joinPacket))
  console.log("Connected to the server");
})


client.on("close",()=>{
  // const leavePacket:LeavePacket = { // wont run, since socket is closed 
  //   type: PacketType.LEAVE
  // };
  // client.write(encode(leavePacket));
  console.log("Connection closed");

})