import { useState, useEffect, useCallback } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/app/libs/firebase";
import {
  getRoom,
  joinRoom,
  leaveRoom,
  updateRoomState,
  deleteRoom,
  kickUserFromRoom,
  updateRoomSettings,
} from "@/app/libs/database";
import { useAuthContext } from "@/app/components/auth/AuthProvider";

export const useRoom = (roomId) => {
  const { user } = useAuthContext();
  const [roomState, setRoomState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [members, setMembers] = useState([]);

  // Set up real-time listener for room data
  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const roomRef = ref(database, `rooms/${roomId}`);

    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setRoomState(data);
          setError(null);
        } else {
          setRoomState(null);
          setError("Room not found");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Room listener error:", error);
        setError("Failed to connect to room");
        setLoading(false);
      },
    );

    return () => {
      off(roomRef, "value", unsubscribe);
    };
  }, [roomId]);

  // Set up real-time listener for member details
  useEffect(() => {
    if (!roomState?.members) {
      setMembers([]);
      return;
    }

    const memberIds = Object.keys(roomState.members);
    const memberListeners = [];
    const memberData = {};

    // Set up individual listeners for each member
    memberIds.forEach((memberId) => {
      const userRef = ref(database, `users/${memberId}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          memberData[memberId] = {
            uid: memberId,
            displayName: userData.displayName || "Unknown User",
            photoURL: userData.photoURL || null,
            email: userData.email || null,
            joinedAt: userData.joinedAt || Date.now(),
          };
        } else {
          memberData[memberId] = {
            uid: memberId,
            displayName: "Unknown User",
            photoURL: null,
            email: null,
            joinedAt: Date.now(),
          };
        }

        // Update members array with current data
        const updatedMembers = memberIds.map(id => memberData[id]).filter(Boolean);
        setMembers(updatedMembers);
      });

      memberListeners.push(() => off(userRef, "value", unsubscribe));
    });

    // Cleanup function
    return () => {
      memberListeners.forEach(cleanup => cleanup());
    };
  }, [roomState?.members]);

  // Join room function
  const handleJoinRoom = useCallback(
    async (targetRoomId = roomId) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      try {
        setError(null);
        await joinRoom(targetRoomId, user.uid);
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [roomId, user],
  );

  // Leave room function
  const handleLeaveRoom = useCallback(async () => {
    if (!user || !roomId) return;

    try {
      setError(null);
      await leaveRoom(roomId, user.uid);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [roomId, user]);

  // Update room state function
  const handleUpdateRoomState = useCallback(
    async (updates) => {
      if (!roomId) return;

      try {
        setError(null);
        await updateRoomState(roomId, updates);
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [roomId],
  );

  // Delete room function (creator only)
  const handleDeleteRoom = useCallback(async () => {
    if (!user || !roomId) return;

    try {
      setError(null);
      await deleteRoom(roomId, user.uid);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [roomId, user]);

  // Kick user function (creator only)
  const handleKickUser = useCallback(
    async (targetUserId) => {
      if (!user || !roomId) return;

      try {
        setError(null);
        await kickUserFromRoom(roomId, user.uid, targetUserId);
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [roomId, user],
  );

  // Update room settings function (creator only)
  const handleUpdateRoomSettings = useCallback(
    async (settings) => {
      if (!user || !roomId) return;

      try {
        setError(null);
        await updateRoomSettings(roomId, user.uid, settings);
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [roomId, user],
  );

  // Helper functions
  const isCreator = user && roomState && user.uid === roomState.creatorId;
  const isMember =
    user && roomState && roomState.members && roomState.members[user.uid];
  const canJoin =
    roomState &&
    (!roomState.members ||
      Object.keys(roomState.members).length < roomState.maxMembers);

  return {
    roomState,
    members,
    loading,
    error,
    isCreator,
    isMember,
    canJoin,
    joinRoom: handleJoinRoom,
    leaveRoom: handleLeaveRoom,
    updateRoomState: handleUpdateRoomState,
    deleteRoom: handleDeleteRoom,
    kickUser: handleKickUser,
    updateRoomSettings: handleUpdateRoomSettings,
  };
};
