import * as readline from 'node:readline';
import { connectClient, gameState, submitAnswer } from '../client';
import { boxen } from './component/boxen';
import { GameConfig } from '../config';
import { ProgressBar } from './component/timeBar';
import { ANSIColors } from '../utils/ansi';

readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}


let gameStarted = false;
let currentInput = "";
let renderInterval: NodeJS.Timeout | null = null;
let playerName = "";
let nameEntered = false;


process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
        console.log('\nExiting...');
        process.exit(0);
    }
    
    if (key.name === 'return') {
        if (!nameEntered) {
            const trimmedName = currentInput.trim();
            if (trimmedName.length > 0 && trimmedName.length <= 20) {
                playerName = trimmedName;
                currentInput = "";
                nameEntered = true;
                renderWelcomeScreen();
            } else if (trimmedName.length === 0) {
                currentInput = "";
                renderNameScreen();
            } else {
                currentInput = currentInput.slice(0, 20);
                renderNameScreen();
            }
        } else if (!gameStarted) {
            gameStarted = true;
            startGame();
        } else if (gameState.currentQuestion && !gameState.gameEnded) {
            if (currentInput.trim()) {
                submitAnswer(currentInput.trim());
                currentInput = "";
            }
        }
    } else if (key.name === 'backspace') {
        currentInput = currentInput.slice(0, -1);
        if (!nameEntered) {
            renderNameScreen();
        } else if (gameState.currentQuestion && !gameState.gameEnded) {
            renderGameUI();
        }
    } else if (str && !gameStarted) {
        if (!nameEntered && currentInput.length < 20) {
            currentInput += str;
            renderNameScreen();
        }
    } else if (str && gameState.currentQuestion && !gameState.gameEnded) {
        // During game - add character to answer input
        currentInput += str;
        renderGameUI();
    }
});

console.clear();

const renderNameScreen = () => {
    console.clear();
    console.log("\n");
    const title = `${ANSIColors.BRIGHT}${ANSIColors.CYAN}Welcome to Hot Socket!${ANSIColors.RESET}`;
    console.log(boxen(title, {
        borderColor: ANSIColors.CYAN,
        minWidth: 50
    }));
    
    const nameLength = currentInput.length;
    const lengthColor = nameLength > 20 ? ANSIColors.RED : nameLength > 0 ? ANSIColors.GREEN : ANSIColors.YELLOW;
    
    const namePrompt = 
        `${ANSIColors.YELLOW}Enter your name (1-20 characters):${ANSIColors.RESET}\n\n` +
        `${ANSIColors.GREEN}> ${currentInput}${ANSIColors.RESET}_\n\n` +
        `${lengthColor}Length: ${nameLength}/20${ANSIColors.RESET}`;
    
    console.log(boxen(namePrompt, {
        title: "Player Name",
        titleColor: ANSIColors.CYAN,
        borderColor: ANSIColors.GREEN,
        minWidth: 50
    }));
    
    console.log(`\n${ANSIColors.CYAN}Press ENTER to continue | Ctrl+C to exit${ANSIColors.RESET}`);
}

const renderWelcomeScreen = () => {
    console.clear();
    console.log("\n");
    
    const welcomeMsg = 
        `${ANSIColors.BRIGHT}Hello, ${ANSIColors.GREEN}${playerName}${ANSIColors.RESET}${ANSIColors.BRIGHT}!${ANSIColors.RESET}\n\n` +
        `Get ready to play Hot Socket TCP!\n\n` +
        `${ANSIColors.YELLOW}Game Modes:${ANSIColors.RESET}\n` +
        `• HOT POTATO: Answer quickly or lose points!\n` +
        `• VOLLEYBALL: Battle your opponent!\n\n` +
        `${ANSIColors.YELLOW}How to Play:${ANSIColors.RESET}\n` +
        `• Answer questions as fast as you can\n` +
        `• First to get the most points wins!\n` +
        `• You have 15 seconds per question`;
    
    console.log(boxen(welcomeMsg, {
        title: "Ready?",
        titleColor: ANSIColors.CYAN,
        borderColor: ANSIColors.CYAN,
        minWidth: 50
    }));
    
    console.log(`\n${ANSIColors.GREEN}Press ENTER to start the game!${ANSIColors.RESET}`);
}

export const renderStartScreen = () => {
    renderNameScreen();
}

function startGame() {
    console.clear();
    console.log("\n🚀 Connecting to server...");
    connectClient(GameConfig.SERVER_IP, playerName);

    renderInterval = setInterval(() => {
        if (gameState.currentQuestion && !gameState.gameEnded) {
            renderGameUI();
        }
    }, 100); 
}

renderStartScreen();

export const renderGameUI = () => {
    if (!gameState.gameStarted) return;
    
    console.clear();
    const header = `${ANSIColors.BRIGHT}${ANSIColors.CYAN}HOT SOCKET - ${gameState.mode}${ANSIColors.RESET}`;
    console.log(boxen(header, { 
        borderColor: ANSIColors.CYAN,
        minWidth: 60 
    }));
    

    const gameInfo = 
        `Game ID: ${ANSIColors.YELLOW}${gameState.gameId}${ANSIColors.RESET}\n` +
        `Opponent: ${ANSIColors.CYAN}${gameState.opponentName}${ANSIColors.RESET}`;
    console.log(boxen(gameInfo, { 
        title: "Game Info",
        titleColor: ANSIColors.CYAN,
        minWidth: 60 
    }));
    
    const scoreBoard = 
        `${ANSIColors.GREEN}${gameState.playerName}: ${gameState.myScore}${ANSIColors.RESET}  |  ` +
        `${ANSIColors.RED}${gameState.opponentName}: ${gameState.opponentScore}${ANSIColors.RESET}`;
    console.log(boxen(scoreBoard, { 
        title: "Score",
        titleColor: ANSIColors.YELLOW,
        borderColor: ANSIColors.YELLOW,
        minWidth: 60 
    }));
    
    if (gameState.currentQuestion) {
        const elapsed = Date.now() - gameState.currentQuestion.startTime;
        const questionBar = new ProgressBar({
            label: "Question Time",
            totalTimeMs: GameConfig.QUESTION_TIMEOUT,
            width: 40
        });
        
        console.log(boxen(questionBar.render(elapsed), {
            borderColor: ANSIColors.WHITE,
            minWidth: 60
        }));
    }

    if (gameState.gameStartTime && !gameState.gameEnded) {
        const gameElapsed = Date.now() - gameState.gameStartTime;
        const gameBar = new ProgressBar({
            label: "Game Time",
            totalTimeMs: GameConfig.GAME_TIMEOUT,
            width: 40
        });
        
        console.log(boxen(gameBar.render(gameElapsed), {
            borderColor: ANSIColors.RED,
            minWidth: 60
        }));
    }
    
    if (gameState.currentQuestion && !gameState.gameEnded) {
        const questionText = 
            `${ANSIColors.BRIGHT}${gameState.currentQuestion.text}${ANSIColors.RESET}\n\n` +
            `Your Answer: ${ANSIColors.GREEN}${currentInput}${ANSIColors.RESET}_`;
        
        console.log(boxen(questionText, { 
            title: "Question",
            titleColor: ANSIColors.CYAN,
            borderColor: ANSIColors.GREEN,
            minWidth: 60 
        }));
    }
    
    if (gameState.lastResult) {
        const resultColor = gameState.lastResult.correct ? ANSIColors.GREEN : ANSIColors.RED;
        const resultIcon = gameState.lastResult.correct ? "✅" : "❌";
        const resultText = 
            `${resultIcon} ${resultColor}${gameState.lastResult.message}${ANSIColors.RESET}`;
        
        console.log(boxen(resultText, { 
            title: "Last Answer",
            borderColor: resultColor,
            minWidth: 60 
        }));
    }
    
    if (gameState.gameEnded) {
        const endColor = gameState.won ? ANSIColors.GREEN : ANSIColors.RED;
        const endIcon = gameState.won ? "🎉" : "😢";
        const endText = 
            `${endIcon} ${ANSIColors.BRIGHT}${gameState.won ? "YOU WON!" : "YOU LOST"}${ANSIColors.RESET}\n\n` +
            `${gameState.gameEndReason}\n\n` +
            `Final Score: ${ANSIColors.GREEN}${gameState.myScore}${ANSIColors.RESET} - ` +
            `${ANSIColors.RED}${gameState.opponentScore}${ANSIColors.RESET}`;
        
        console.log(boxen(endText, { 
            title: "Game Over",
            titleColor: endColor,
            borderColor: endColor,
            minWidth: 60 
        }));
        
        if (renderInterval) {
            clearInterval(renderInterval);
            renderInterval = null;
        }
    }
    
    if (!gameState.gameEnded && gameState.currentQuestion) {
        console.log(`\n${ANSIColors.CYAN}Type your answer and press ENTER to submit${ANSIColors.RESET}`);
    }
};