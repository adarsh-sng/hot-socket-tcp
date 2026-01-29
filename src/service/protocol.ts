import { Buffer } from "node:buffer";
import type { GamePacket } from "../types.ts";


export type DecodedMessage = {
  message: any;
  remaining: Buffer;
}
export class PacketParser {
    private buffer: Buffer;
    constructor() {
        this.buffer = Buffer.alloc(0);
    }
    public parse(chunk: Buffer):  GamePacket[] {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        const messages: any[] = [];

        while (true) {
            if(this.buffer.length === 0) break;
            if (this.buffer.length < 4) break;
            const length = this.buffer.readUInt32BE(0);
            if (this.buffer.length < 4 + length) break;
            const bodyBuffer = this.buffer.subarray(4, 4 + length);
            try {
                const json = JSON.parse(bodyBuffer.toString("utf-8"));
                messages.push(json);
            } catch (e) {
                console.error("Bad JSON:", e);
            }
            this.buffer = this.buffer.subarray(4 + length);
        }

        return messages;
    }
    public static encode(data:  GamePacket): Buffer {
        const jsonString = JSON.stringify(data);
        const jsonBuffer = Buffer.from(jsonString, 'utf-8');
        const lengthBuffer = Buffer.alloc(4);
        lengthBuffer.writeUInt32BE(jsonBuffer.length, 0);
        return Buffer.concat([lengthBuffer, jsonBuffer]);
    }
}

