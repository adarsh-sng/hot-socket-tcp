
import { ANSIColors } from "../../utils/ansi.ts";
interface BarConfig {
  label: string;
  totalTimeMs: number;
  width: number;
  filledChar?: string;
  emptyChar?: string;
}

class ProgressBar {
  private config: BarConfig;

  constructor(config: BarConfig) {
    this.config = { 
      filledChar: '█', 
      emptyChar: '░', 
      ...config 
    };
  }

  // Helper to format ms into "12.5s"
  private formatTime(ms: number): string {
    const seconds = Math.max(0, ms / 1000); // Prevent negative numbers
    return `${seconds.toFixed(1)}s`;
  }

  private getColor(percentage: number): string {
    if (percentage < 50) return ANSIColors.GREEN;
    if (percentage < 80) return ANSIColors.YELLOW;
    return ANSIColors.RED;
  }

  public render(currentTimeMs: number): string {
    // 1. Calculate Percentage (for the Bar graphic and Color)
    const rawPercentage = (currentTimeMs / this.config.totalTimeMs) * 100;
    const percentage = Math.min(Math.max(rawPercentage, 0), 100);

    // 2. Calculate Time Remaining (for the Text)
    const remainingMs = this.config.totalTimeMs - currentTimeMs;
    const timeText = this.formatTime(remainingMs);

    // 3. Build the visual bar
    const filledLength = Math.floor((percentage / 100) * this.config.width);
    const emptyLength = this.config.width - filledLength;

    const block = this.config.filledChar!.repeat(filledLength);
    const empty = this.config.emptyChar!.repeat(emptyLength);
    const color = this.getColor(percentage);

    // 4. Return formatted string
    // Layout: Label [████░░░] 12.4s
    return `${ANSIColors.CYAN}${this.config.label.padEnd(15)} ` +
           `${ANSIColors.WHITE}[` +
           `${color}${block}${ANSIColors.WHITE}${empty}` +
           `${ANSIColors.WHITE}] ` +
           `${color}${timeText.padStart(6)}${ANSIColors.RESET}`; 
           // .padStart(6) ensures "9.0s" and "15.0s" align perfectly
  }
}

// --- Setup ---

const gameBar = new ProgressBar({
  label: "Game Timer",
  totalTimeMs: 60 * 1000, // 60s
  width: 40
});

const questionBar = new ProgressBar({
  label: "Question Timer",
  totalTimeMs: 15 * 1000, // 15s
  width: 20,
  filledChar: '▓'
});

export { ProgressBar, gameBar, questionBar };
