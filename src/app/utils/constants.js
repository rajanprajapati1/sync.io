// Authentication constants
export const AUTH_ERRORS = {
  INVALID_EMAIL: "auth/invalid-email",
  USER_NOT_FOUND: "auth/user-not-found",
  WRONG_PASSWORD: "auth/wrong-password",
  EMAIL_ALREADY_IN_USE: "auth/email-already-in-use",
  WEAK_PASSWORD: "auth/weak-password",
  POPUP_CLOSED: "auth/popup-closed-by-user",
  NETWORK_ERROR: "auth/network-request-failed",
};

// Room constants
export const ROOM_LIMITS = {
  MIN_MEMBERS: 2,
  MAX_MEMBERS: 10,
  DEFAULT_MEMBERS: 2,
};

// Sync constants
export const SYNC_CONFIG = {
  SYNC_THRESHOLD: 2, // seconds - threshold for sync correction
  UPDATE_INTERVAL: 1000, // milliseconds - how often to update room state
  RECONNECT_DELAY: 3000, // milliseconds - delay before reconnection attempts
  MAX_SYNC_DRIFT: 3, // seconds - maximum acceptable sync drift
  LATENCY_MEASUREMENT_INTERVAL: 30000, // milliseconds - how often to measure latency
  MAX_LATENCY_SAMPLES: 10, // number of latency samples to keep for averaging
  CONNECTION_TIMEOUT: 10000, // milliseconds - connection timeout threshold
};

// App routes
export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
  ROOM: "/room",
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME_MODE: "sync-music-theme-mode",
  USER_PREFERENCES: "sync-music-user-prefs",
};
