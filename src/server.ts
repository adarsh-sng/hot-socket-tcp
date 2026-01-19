// import net from "node:net";

// const server = net.createServer((socket) => {
//   console.log("Client connected!");
//   // When the client sends data, print it
//   // socket.write('hello,Welcome to the TCP server!\r\n', "utf-8");
//   socket.write("Welcome to the TCP server!\r\n", "utf-8");
//   socket.on("data", (data) => {
//     console.log("Received:", data.toString());
//   });
//   //   socket.setTimeout(2000)
//   //   socket.on('timeout', () => {
//   //   console.log('socket timeout');
//   //   socket.write("bye client")
//   // }); 
//   socket.on("close",()=>{
//     console.log("what is this end");
//     server.close();
//   })
// });

// server.listen(3000, "0.0.0.0", () => {
//   // console.log("Server listening on port 3000");
// });

import net from "node:net";

const server = net.createServer((socket) => {
  console.log("Client connected!");

  socket.on("data", (data) => {
    // 1. Convert the raw buffer to text
    const text = data.toString();
    console.log("--- Received Payload ---");
    console.log(`Raw String: '${text}'`);

    // 2. Try to parse it. 
    // IF TCP works like a "message", this works.
    // IF TCP works like a "stream" (gluing), THIS WILL CRASH.
    try {
      const json = JSON.parse(text); 
      console.log("SUCCESS: Parsed JSON:", json);
    } catch (err) {
      console.error("CRASH!! Failed to parse JSON.");
      console.error("Reason: The messages got glued together!");
    }
  });
});

server.listen(3000, "0.0.0.0");