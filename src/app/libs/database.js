import { ref, set, get, update, remove, push } from "firebase/database";
import { database } from "./firebase";
import { generateRoomId } from "@/app/utils/helpers";

// Room creation function
export const createRoom = async ({ creatorId, maxMembers, roomName }) => {
  try {
    // Generate unique room ID
    const roomId = generateRoomId();

    // Check if room ID already exists (very unlikely but good practice)
    const roomRef = ref(database, `rooms/${roomId}`);
    const existingRoom = await get(roomRef);

    if (existingRoom.exists()) {
      // If by chance the ID exists, generate a new one
      return createRoom({ creatorId, maxMembers, roomName });
    }

    // Create room data
    const roomData = {
      roomId,
      creatorId,
      maxMembers,
      roomName,
      members: {
        [creatorId]: true,
      },
      memberCount: 1,
      currentSong: null,
      isPlaying: false,
      currentTime: 0,
      playlist: [], // Initialize empty playlist
      timestamp: Date.now(),
      createdAt: Date.now(),
    };

    // Save room to database
    await set(roomRef, roomData);

    // Update user's current room
    const userRef = ref(database, `users/${creatorId}/currentRoom`);
    await set(userRef, roomId);

    return roomData;
  } catch (error) {
    console.error("Error creating room:", error);
    throw new Error("Failed to create room. Please try again.");
  }
};

// Get room data
export const getRoom = async (roomId) => {
  if (!roomId) {
    throw new Error("Room ID is required");
  }
  
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error("Room not found");
    }
  } catch (error) {
    console.error("Error getting room:", error);
    throw error;
  }
};

// Join room function
export const joinRoom = async (roomId, userId) => {
  try {
    // First check if user is already in another room
    const userRef = ref(database, `users/${userId}`);
    const userSnapshot = await get(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.val();
      if (userData.currentRoom && userData.currentRoom !== roomId) {
        throw new Error("You are already in another room. Please leave your current room first.");
      }
    }

    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      throw new Error("Room not found");
    }

    const roomData = roomSnapshot.val();

    // Check if room is at capacity
    const currentMemberCount = Object.keys(roomData.members || {}).length;
    if (currentMemberCount >= roomData.maxMembers) {
      throw new Error("Room is at maximum capacity");
    }

    // Check if user is already in the room
    if (roomData.members && roomData.members[userId]) {
      throw new Error("You are already in this room");
    }

    // Add user to room with timestamp
    const joinTimestamp = Date.now();
    const updates = {};
    updates[`rooms/${roomId}/members/${userId}`] = true;
    updates[`rooms/${roomId}/memberCount`] = currentMemberCount + 1;
    updates[`users/${userId}/currentRoom`] = roomId;
    updates[`users/${userId}/joinedAt`] = joinTimestamp;

    await update(ref(database), updates);

    return roomData;
  } catch (error) {
    console.error("Error joining room:", error);
    throw error;
  }
};

// Leave room function
export const leaveRoom = async (roomId, userId) => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      // Clear user's current room even if room doesn't exist
      const userRef = ref(database, `users/${userId}/currentRoom`);
      await set(userRef, null);
      return;
    }

    const roomData = roomSnapshot.val();
    const currentMemberCount = Object.keys(roomData.members || {}).length;

    // Prepare updates
    const updates = {};
    
    // If this is the last member, delete the room
    if (currentMemberCount <= 1) {
      updates[`rooms/${roomId}`] = null;
    } else {
      // Remove user from room
      updates[`rooms/${roomId}/members/${userId}`] = null;
      updates[`rooms/${roomId}/memberCount`] = Math.max(0, currentMemberCount - 1);
    }

    // Clear user's current room and join timestamp
    updates[`users/${userId}/currentRoom`] = null;
    updates[`users/${userId}/joinedAt`] = null;

    await update(ref(database), updates);
  } catch (error) {
    console.error("Error leaving room:", error);
    throw error;
  }
};

// Update room state (for music synchronization)
export const updateRoomState = async (roomId, updates) => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const updateData = {
      ...updates,
      timestamp: Date.now(),
    };

    await update(roomRef, updateData);
  } catch (error) {
    console.error("Error updating room state:", error);
    throw error;
  }
};

// Delete room (creator only)
export const deleteRoom = async (roomId, creatorId) => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      throw new Error("Room not found");
    }

    const roomData = roomSnapshot.val();

    // Verify user is the creator
    if (roomData.creatorId !== creatorId) {
      throw new Error("Only the room creator can delete the room");
    }

    // Clear current room for all members
    const updates = {};
    if (roomData.members) {
      Object.keys(roomData.members).forEach((memberId) => {
        updates[`users/${memberId}/currentRoom`] = null;
      });
    }

    // Delete the room
    updates[`rooms/${roomId}`] = null;

    await update(ref(database), updates);
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};

// Kick user from room (creator only)
export const kickUserFromRoom = async (roomId, creatorId, targetUserId) => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      throw new Error("Room not found");
    }

    const roomData = roomSnapshot.val();

    // Verify user is the creator
    if (roomData.creatorId !== creatorId) {
      throw new Error("Only the room creator can kick users");
    }

    // Don't allow creator to kick themselves
    if (targetUserId === creatorId) {
      throw new Error("Cannot kick yourself from the room");
    }

    // Remove user from room
    await leaveRoom(roomId, targetUserId);
  } catch (error) {
    console.error("Error kicking user:", error);
    throw error;
  }
};

// Update room settings (creator only)
export const updateRoomSettings = async (roomId, creatorId, settings) => {
  try {
    const roomRef = ref(database, `rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (!roomSnapshot.exists()) {
      throw new Error("Room not found");
    }

    const roomData = roomSnapshot.val();

    // Verify user is the creator
    if (roomData.creatorId !== creatorId) {
      throw new Error("Only the room creator can update room settings");
    }

    // Validate settings
    const currentMemberCount = Object.keys(roomData.members || {}).length;
    if (settings.maxMembers && settings.maxMembers < currentMemberCount) {
      throw new Error(`Cannot reduce max members below current member count (${currentMemberCount})`);
    }

    // Prepare updates
    const updates = {};
    if (settings.roomName !== undefined) {
      updates.roomName = settings.roomName.trim();
    }
    if (settings.maxMembers !== undefined) {
      updates.maxMembers = settings.maxMembers;
    }

    // Add timestamp
    updates.lastUpdated = Date.now();

    await update(roomRef, updates);
  } catch (error) {
    console.error("Error updating room settings:", error);
    throw error;
  }
};
