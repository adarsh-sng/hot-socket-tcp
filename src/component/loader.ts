const animateLoader = (text: string) => {
  // const loaderFrames = ["·", "✻", "✽", "✶", "✳", "✢",""];
  // const loaderFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  const loaderFrames = ["❀", "❁", "❂", "❃", "❈", "✦", "✧", "✳", "✶", "✽"];
  // const colorCodes = ["\x1b[38;2;203;166;247m", "\x1b[38;2;186;194;254m", "\x1b[38;2;137;180;250m", "\x1b[38;2;116;199;236m", "\x1b[38;2;148;226;213m", "\x1b[38;2;166;227;161m"];
  const colorCodes= 
  ["\x1b[38;2;204;153;204m"]
  const reset = "\x1b[0m";
  const hideCursor = "\x1b[?25l";
  const showCursor = "\x1b[?25h";
  let frameIndex = 0;
  let colorIndex = 0;

  return setInterval(() => {
    process.stdout.write(`\r ${colorCodes}${loaderFrames[frameIndex]} ${text}${reset}`);
    process.stdout.write(hideCursor);
    frameIndex = (frameIndex + 1) % loaderFrames.length;
    // colorIndex = (colorIndex + 1) % colorCodes.length;
  }, 100);
};

export default animateLoader;
