import { ANSIColors } from "../../utils/ansi.ts";


interface BoxOptions {
  padding?: number;
  borderColor?: string;
  title?: string;
  titleColor?: string;
  minWidth?: number;
}

const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, "");

const wrapText = (text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (stripAnsi(currentLine + " " + word).length < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
};

export const boxen = (text: string, options: BoxOptions = {}): string => {
  const {
    padding = 1,
    borderColor = ANSIColors.WHITE,
    title,
    titleColor = ANSIColors.CYAN,
    minWidth = 0,
  } = options;

  const termWidth = process.stdout.columns || 80; 
  const maxContentWidth = termWidth - 2 - (padding * 2) - 4; 

  let lines: string[] = [];
  text.split('\n').forEach(originalLine => {
    if (stripAnsi(originalLine).length > maxContentWidth) {
      lines.push(...wrapText(originalLine, maxContentWidth));
    } else {
      lines.push(originalLine);
    }
  });

  const maxLineLength = Math.max(...lines.map(l => stripAnsi(l).length));
  const contentWidth = Math.max(minWidth, maxLineLength);
  const boxWidth = contentWidth + (padding * 2);

  const horizontalBorder = "─".repeat(boxWidth);
  const emptyLine = `${borderColor}│${" ".repeat(boxWidth)}│${ANSIColors.RESET}`;


  let topBar = `${borderColor}┌${horizontalBorder}┐${ANSIColors.RESET}`;
  if (title) {
    const safeTitle = ` ${title} `;
    if (safeTitle.length < boxWidth) {
      const rightDashCount = boxWidth - safeTitle.length - 1;
      topBar = `${borderColor}┌─${titleColor}${safeTitle}${borderColor}${"─".repeat(rightDashCount)}┐${ANSIColors.RESET}`;
    }
  }
  let box = `${topBar}\n`;
  for (let i = 0; i < padding; i++) box += `${emptyLine}\n`;
  for (const line of lines) {
    const visibleLength = stripAnsi(line).length;
    const rightFill = contentWidth - visibleLength;
    
    box += `${borderColor}│${ANSIColors.RESET}` +
           " ".repeat(padding) +
           line +
           " ".repeat(rightFill + padding) +
           `${borderColor}│${ANSIColors.RESET}\n`;
  }

  for (let i = 0; i < padding; i++) box += `${emptyLine}\n`;
  box += `${borderColor}└${horizontalBorder}┘${ANSIColors.RESET}\n`;

  return box;
};

