import * as readline from 'node:readline';
import { connectClient } from './client';
import { boxen } from './component/boxen';
import animateLoader from './component/loader';
import { clear } from 'node:console';

readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}
let loaderId: NodeJS.Timeout;
let gameStarted = false;
process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
        console.log('\nExiting...');
        process.exit(0);
    }
    if (key.name === 'return') {
        if (!gameStarted) {
            gameStarted = true;
            startGame();
        }
    }
});

console.clear();

export const renderStartScreen = () => {
    console.log("===================================");
    console.log("      Welcome to Hot Socket!      ");
    console.log("===================================");
    
    console.log("");
    console.log("Instructions:");
    console.log(boxen("1. Press [ENTER] to start the game.\n2. Press [Ctrl+C] to exit.", 1));
    loaderId = animateLoader("waiting for you to start the game... Press [ENTER]");
    console.log("");
}


function startGame() {
    clearInterval(loaderId);
    console.log("\n🚀 Game Started! (Initializing connection...)");
    connectClient("127.0.0.1");
}

renderStartScreen();