import { GameMode, GameStartPacket, PacketType } from "../types.ts";
import { addToQueue, games, removeFromQueue, tryMatch } from "./gameLogic.ts";
import { PacketParser } from "./protocol.ts";
import type { GamePacket, JoinPacket, LeavePacket, Player, SubmitPacket } from "../types.ts";

let encode = PacketParser.encode;

export const startGamePacket = (gameId: string, opponentName: string, mode: GameMode): GameStartPacket => {
  return {
    type: PacketType.GAME_START,
    payload: {
      gameId,
      opponentName,
      mode
    }
  }
}

export class GameManager{
  // constructor(socket:any,message:GamePacket){
  
  // }
  
  handlePacket(socket:any, message:any){
    switch(message.type){
      case PacketType.JOIN: handleJoin(socket, message); break;
      case PacketType.LEAVE: handleLeave(socket, message); break;
      case PacketType.SUBMIT: handleSubmit(socket, message); break;
    }
    
    function handleJoin(socket:any, message:JoinPacket){
      const player:Player  = {
        id: socket.remoteAddress + ":" + socket.remotePort,
        name: message.payload.name,
        preferredMode: message.payload.preferredMode,
        socket: socket
      };
      const gameId = addToQueue(player);
      if(gameId){
        const opponentName = getOpponentName(gameId, player.id);
        const packet = startGamePacket(gameId, opponentName, player.preferredMode || GameMode.HOT_POTATO);
        socket.write(encode(packet));
      }
    }   
    function handleLeave(socket:any, message:LeavePacket){
        removeFromQueue(playerID)
    }   
    function handleSubmit(socket:any, message:SubmitPacket){
      
    }   
    function getOpponentName(gameId:string, playerId:string):string{
      const game = games.get(gameId);
      if(!game) return "Unknown";
      if(game.player1.player.id === playerId){
        return game.player2.player.name;
      } else {
        return game.player1.player.name;
      }
    }
  }
}