import { PacketType } from "../types";

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

const handleGameStart = (socket: any, packet: any) => {
 // do something
};

const handleQuestion = (socket: any, packet: any) => {
 // do something
}
const handleResult = (socket: any, packet: any) => {
 // do something
}
const handleGameEnd = (socket: any, packet: any) => {
 // do something
}

export { handleServerPacket };