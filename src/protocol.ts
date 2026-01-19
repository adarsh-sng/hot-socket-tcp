import { Buffer } from "node:buffer";

/*add a header of 4 bytes that will store the length of the message */
export const encodeMessage=(data:any):Buffer=>{
  const jsonString=JSON.stringify(data);
  const jsonBuffer=Buffer.from(jsonString,'utf-8');
  const lengthBuffer=Buffer.alloc(4);
  lengthBuffer.writeUInt32BE(jsonBuffer.length,0);
  return Buffer.concat([lengthBuffer,jsonBuffer]);
}

export type DecodedMessage={
  message:any;
  remaining:Buffer;
}
/* read the first 4 bytes to get the length of the message, then read the message 
stop if the buffer does not have enough data otherwise slice it and return the message */
export const decodeMessage=(buffer:Buffer):DecodedMessage|null=>{
  if(buffer.length<4){
    return null;
  }
  const length=buffer.readUInt32BE(0);

  if (buffer.length < 4 + length) {
    return null; 
  }
  const bodyBuffer = buffer.subarray(4, 4 + length);
  const json = JSON.parse(bodyBuffer.toString("utf-8"));

  const remaining = buffer.subarray(4 + length);

  return { message: json, remaining };
}