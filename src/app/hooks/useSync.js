import { useState, useEffect, useRef, useCallback } from "react";
import { createSyncController } from "@/app/libs/sync";

/**
 * Custom hook for managing music synchronization
 * Simplified version to prevent infinite loops
 */
export const useSync = (roomId) => {
  const [syncState, setSyncState] = useState({
    isConnected: false,
    lastSync: null,
    networkLatency: 50,
    syncDrift: 0,
    connectionInterrupted: false,
  });
  
  const [roomState, setRoomState] = useState(null);
  const [error, setError] = useState(null);
  const syncControllerRef = useRef(null);
  const audioElementRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Initialize sync controller
  useEffect(() => {
    if (!roomId || isInitializedRef.current) return;

    console.log("Initializing sync controller for room:", roomId);
    
    const controller = createSyncController(roomId);
    syncControllerRef.current = controller;
    isInitializedRef.current = true;

    // Set up event listeners
    controller.addEventListener('connectionError', (err) => {
      console.warn("Sync connection error:", err);
      setError(err?.message || 'Connection error occurred');
    });

    controller.addEventListener('roomNotFound', () => {
      console.warn("Room not found:", roomId);
      setError('Room not found');
      setRoomState(null);
    });

    // Listen for room state changes
    controller.addEventListener('stateChange', (newState) => {
      console.log("Room state changed:", newState);
      setRoomState(newState);
      setError(null); // Clear errors on successful state update
    });

    // Cleanup
    return () => {
      console.log("Cleaning up sync controller");
      isInitializedRef.current = false;
      if (controller) {
        controller.destroy();
      }
      syncControllerRef.current = null;
    };
  }, [roomId]);

  // Update sync state periodically to reflect actual connection status
  useEffect(() => {
    if (!syncControllerRef.current) return;

    const updateSyncState = () => {
      if (syncControllerRef.current) {
        const currentSyncState = syncControllerRef.current.getSyncState();
        setSyncState(currentSyncState); // Always update to reflect actual state
      }
    };

    // Initial update
    updateSyncState();

    // More frequent updates to ensure UI reflects actual state
    const syncStateInterval = setInterval(updateSyncState, 1000);

    return () => clearInterval(syncStateInterval);
  }, [roomId]);

  // Monitor and maintain connection health
  useEffect(() => {
    if (!syncControllerRef.current) return;

    const monitorConnection = () => {
      const controller = syncControllerRef.current;
      if (controller && controller.forceConnectionCheck) {
        const isHealthy = controller.forceConnectionCheck();
        console.log("Connection health check:", isHealthy);
      }
    };

    // Check connection every 10 seconds
    const connectionInterval = setInterval(monitorConnection, 10000);

    return () => clearInterval(connectionInterval);
  }, [roomId]);

  // Initialize audio element when available
  const initializeAudio = useCallback((audioElement) => {
    if (!audioElement || !syncControllerRef.current || audioElementRef.current === audioElement) {
      return;
    }

    console.log("Initializing audio element with sync controller");
    audioElementRef.current = audioElement;
    syncControllerRef.current.initialize(audioElement);
  }, []);

  // Update room state with sync
  const updateRoomState = useCallback(async (updates) => {
    if (!syncControllerRef.current) {
      throw new Error('Sync controller not initialized');
    }

    try {
      await syncControllerRef.current.updateState(updates);
    } catch (error) {
      console.error("Failed to update room state:", error);
      setError(error.message);
      throw error;
    }
  }, []);

  // Manual sync trigger with better stuck detection
  const triggerSync = useCallback(() => {
    if (!syncControllerRef.current) return;

    console.log("Triggering manual sync");
    const controller = syncControllerRef.current;
    const audio = controller.audioElement;
    const state = controller.getCurrentRoomState();
    
    if (!audio || !state) {
      console.warn("Cannot sync - missing audio element or room state");
      return;
    }

    // Log current state for debugging
    console.log("Manual sync - Current state:", {
      roomPlaying: state.isPlaying,
      audioPaused: audio.paused,
      audioMuted: audio.muted,
      audioReadyState: audio.readyState,
      audioSrc: audio.src ? "loaded" : "empty",
      roomTime: state.currentTime,
      audioTime: audio.currentTime
    });

    // Check for various stuck conditions
    const isStuck = (
      (state.isPlaying && audio.paused) || // Should be playing but paused
      (!state.isPlaying && !audio.paused) || // Should be paused but playing
      (audio.readyState === 0 && audio.src) || // Audio not loading despite having source
      (Math.abs(state.currentTime - audio.currentTime) > 10) // Time severely out of sync
    );

    if (isStuck) {
      console.log("Detected stuck audio state - using force refresh");
      controller.forceRefreshAudio();
    } else {
      // Try normal sync first
      controller.syncAudioToState();
      
      // Verify sync worked after a short delay
      setTimeout(() => {
        if (controller.audioElement && controller.getCurrentRoomState()) {
          const newAudio = controller.audioElement;
          const newState = controller.getCurrentRoomState();
          
          // Check if sync actually worked
          const stillStuck = (
            (newState.isPlaying && newAudio.paused) ||
            (!newState.isPlaying && !newAudio.paused)
          );
          
          if (stillStuck) {
            console.log("Normal sync failed - falling back to force refresh");
            controller.forceRefreshAudio();
          }
        }
      }, 1000);
    }
  }, []);

  // Get sync statistics
  const getSyncStats = useCallback(() => {
    if (!syncControllerRef.current) return null;

    return {
      ...syncState,
      roomState: syncControllerRef.current.getCurrentRoomState(),
    };
  }, [syncState]);

  // Check if sync is healthy
  const isSyncHealthy = useCallback(() => {
    const now = Date.now();
    const timeSinceLastSync = syncState.lastSync ? now - syncState.lastSync : Infinity;
    
    return (
      syncState.isConnected &&
      !syncState.connectionInterrupted &&
      timeSinceLastSync < 15000 && // Less than 15 seconds since last sync
      syncState.syncDrift < 5 // Less than 5 seconds drift
    );
  }, [syncState.isConnected, syncState.connectionInterrupted, syncState.lastSync, syncState.syncDrift]);

  return {
    // State
    roomState,
    syncState,
    error,
    
    // Functions
    initializeAudio,
    updateRoomState,
    triggerSync,
    getSyncStats,
    isSyncHealthy,
    
    // Computed values
    isConnected: syncState.isConnected,
    networkLatency: syncState.networkLatency,
    syncDrift: syncState.syncDrift,
    lastSync: syncState.lastSync,
  };
};