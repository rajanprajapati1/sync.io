// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Display name validation
export const isValidDisplayName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

// Room ID validation
export const isValidRoomId = (roomId) => {
  const roomIdRegex = /^[a-zA-Z0-9-_]{6,20}$/;
  return roomIdRegex.test(roomId);
};

// Member count validation
export const isValidMemberCount = (count) => {
  return Number.isInteger(count) && count >= 2 && count <= 10;
};

// Sanitize user input
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, "");
};

// Room joining validation
export const validateRoomJoining = (roomData, userId, userCurrentRoom) => {
  const errors = [];

  if (!roomData) {
    errors.push("Room not found");
    return errors;
  }

  // Check if user is already in another room
  if (userCurrentRoom && userCurrentRoom !== roomData.roomId) {
    errors.push("You are already in another room. Please leave your current room first.");
  }

  // Check if room is at capacity
  const currentMemberCount = Object.keys(roomData.members || {}).length;
  if (currentMemberCount >= roomData.maxMembers) {
    errors.push("Room is at maximum capacity");
  }

  // Check if user is already in this room
  if (roomData.members?.[userId]) {
    errors.push("You are already in this room");
  }

  return errors;
};

// Validation error messages
export const VALIDATION_MESSAGES = {
  INVALID_EMAIL: "Please enter a valid email address",
  INVALID_PASSWORD: "Password must be at least 6 characters long",
  INVALID_DISPLAY_NAME: "Display name must be between 2 and 50 characters",
  INVALID_ROOM_ID:
    "Room ID must be 6-20 characters (letters, numbers, hyphens, underscores only)",
  INVALID_MEMBER_COUNT: "Member count must be between 2 and 10",
  REQUIRED_FIELD: "This field is required",
  ROOM_NOT_FOUND: "Room not found. Please check the room code and try again.",
  ROOM_FULL: "This room is full. Please try again later.",
  ALREADY_IN_ROOM: "You are already a member of this room.",
  ALREADY_IN_OTHER_ROOM: "You are already in another room. Please leave your current room first.",
};
