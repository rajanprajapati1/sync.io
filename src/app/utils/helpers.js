// Generate a random room ID
export const generateRoomId = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Format time for display (MM:SS)
export const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

// Get user's display name or fallback
export const getUserDisplayName = (user) => {
  if (!user) return "Anonymous";
  return user.displayName || user.email?.split("@")[0] || "User";
};

// Get user's avatar URL or fallback
export const getUserAvatarUrl = (user) => {
  if (!user) return null;
  return (
    user.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(user))}&background=1976d2&color=fff`
  );
};

// Debounce function for performance optimization
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Calculate sync timestamp with network compensation
export const getSyncTimestamp = (networkLatency = 0) => {
  return Date.now() + networkLatency;
};

// Calculate compensated playback time based on timestamp and latency
export const getCompensatedTime = (baseTime, timestamp, networkLatency = 0) => {
  const now = Date.now();
  const timeSinceUpdate = (now - timestamp) / 1000;
  const latencyCompensation = networkLatency / 1000;
  return Math.max(0, baseTime + timeSinceUpdate - latencyCompensation);
};

// Check if two times are significantly different (for sync threshold)
export const isSignificantTimeDifference = (time1, time2, threshold = 2) => {
  return Math.abs(time1 - time2) > threshold;
};

// Calculate average from array of numbers
export const calculateAverage = (numbers) => {
  if (!numbers || numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
};

// Check if user is room creator
export const isRoomCreator = (user, room) => {
  return user && room && user.uid === room.creatorId;
};

// Get friendly error message
export const getFriendlyErrorMessage = (error) => {
  const errorCode = error?.code || error?.message || "";

  switch (errorCode) {
    case "auth/invalid-email":
      return "Please enter a valid email address";
    case "auth/user-not-found":
      return "No account found with this email";
    case "auth/wrong-password":
      return "Incorrect password";
    case "auth/email-already-in-use":
      return "An account with this email already exists";
    case "auth/weak-password":
      return "Password should be at least 6 characters";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled";
    case "auth/network-request-failed":
      return "Network error. Please check your connection";
    default:
      return error?.message || "An unexpected error occurred";
  }
};
