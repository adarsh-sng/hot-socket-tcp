// Game Configuration
export const GameConfig = {
  // Server settings
  SERVER_PORT: 3000,
  SERVER_HOST: "0.0.0.0",
  SERVER_IP: "127.0.0.1",
  
  // Timer settings (in milliseconds)
  QUESTION_TIMEOUT: 15000,  // 15 seconds per question
  GAME_TIMEOUT: 60000,      // 60 seconds total game time
  
  // Score settings
  CORRECT_ANSWER_POINTS: 1,
  BOMB_EXPLOSION_PENALTY: -2,
  
  // Game settings
  STALE_GAME_THRESHOLD: 5 * 60 * 1000,  // 5 minutes
  STALE_GAME_CLEANUP_INTERVAL: 60_000,   // Check every 60 seconds
  
  // Default game mode
  DEFAULT_MODE: 'HOT_POTATO' as const,
} as const;
