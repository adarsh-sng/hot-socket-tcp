export const boxen = (text: string, padding = 2): string => {
  const lines = text.split("\n");
  const longestLineLength = Math.max(...lines.map((line) => line.length));
  const totalWidth = longestLineLength + padding * 2;

  const horizontalBorder = "─".repeat(totalWidth);
  const emptyLine = `│${" ".repeat(totalWidth)}│`;

  let box = `┌${horizontalBorder}┐\n`;
  for (let i = 0; i < padding; i++) {
    box += `${emptyLine}\n`;
  }
  for (const line of lines) {
    const paddedLine =
      " ".repeat(padding) +
      line +
      " ".repeat(longestLineLength - line.length + padding);
    box += `│${paddedLine}│\n`;
  }
  for (let i = 0; i < padding; i++) {
    box += `${emptyLine}\n`;
  }
  box += `└${horizontalBorder}┘\n`;

  return box;
};
