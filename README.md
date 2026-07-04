# Hot Socket TCP

A real-time multiplayer trivia server built from scratch using **Node.js**, **TypeScript**, and **raw TCP sockets**. The project implements a custom binary protocol, reliable packet parsing, matchmaking, and concurrent game sessions without relying on WebSockets or higher-level networking frameworks.

## Features

*  Multiplayer trivia gameplay over raw TCP
*  Concurrent game sessions
*  FIFO-based matchmaking
*  Custom binary protocol with 7 packet types
*  Reliable TCP stream reassembly for fragmented and coalesced packets
*  Low-latency game synchronization
*  Extensible packet handling architecture




Supported packet types include:

* Join Queue
* Match Found
* Start Game
* Question
* Submit Answer
* Score Update
* Game End

## Packet Parser

TCP is a byte stream and does not preserve message boundaries. The parser handles:

* Fragmented packets
* Multiple packets received together
* Partial packet buffering
* Incremental parsing

Incoming data is accumulated into an internal buffer and decoded only when a complete packet is available.

## Matchmaking

Players enter a FIFO matchmaking queue.



MIT
