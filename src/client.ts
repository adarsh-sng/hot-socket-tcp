// import net from "net";

// // 1. Create a socket (the phone line)
// const client = new net.Socket();

// // 2. Connect to the server on Port 3000
// // "127.0.0.1" means "my own computer"
// client.connect(3000, "127.0.0.1", () => {
//   console.log("Connected to server!");

//   // Send a message immediately
//   client.write("Hello from the Client!");

// });

// client.on("data", (data) => {
//   console.log("Received from server:", data.toString());
//   Array.from(data.toString()).forEach((byte) => {
//     client.write("{hello this should be a line a very big line lol very big line}\n")
//   });
// });


import net from "net";

const client = new net.Socket();

client.connect(3000, "127.0.0.1", () => {
  console.log("Connected!");

  // SENDING 5 MESSAGES INSTANTLY
  // These are valid JSON individually: {"name":"Player"}
  const msg = JSON.stringify({ name: "Player" });
  
  // We write them one after another without waiting
  client.write(`${msg}\n`);
  // client.write(`${msg}\n`);
  // client.write(`${msg}\n`);
  // client.write(`${msg}\n`);
  // client.write(`${msg}\n`);
});