import { ref, onValue, off } from "firebase/database";
import { database } from "./firebase";
import { updateRoomState } from "./database";
import { SYNC_CONFIG } from "@/app/utils/constants";

/**
 * SyncController manages real-time music synchronization across multiple clients
 * Simplified version to prevent infinite loops
 */
export class SyncController {
  constructor(roomId) {
    this.roomId = roomId;
    this.listeners = new Map();
    this.syncState = {
      isConnected: false,
      lastSync: null,
      networkLatency: 50, // Default latency
      syncDrift: 0,
      connectionInterrupted: false,
    };
    this.audioElement = null;
    this.lastKnownState = null;
    this.roomListener = null;
    this.isDestroyed = false;
    this.lastUpdateTime = 0; // Track when we last updated to prevent conflicts
    this.syncDebounceTimeout = null;
    this.continuousSyncInterval = null; // For continuous time sync
    this.isInitialSync = true; // Track if this is the first sync

    // Bind methods to preserve context
    this.handleRoomStateChange = this.handleRoomStateChange.bind(this);
    this.continuousTimeSync = this.continuousTimeSync.bind(this);
  }

  /**
   * Initialize sync controller with audio element
   */
  initialize(audioElement) {
    if (this.isDestroyed) return this;

    this.audioElement = audioElement;
    this.setupRoomListener();
    this.startContinuousSync();
    return this;
  }

  /**
   * Start continuous sync for real-time synchronization
   */
  startContinuousSync() {
    if (this.continuousSyncInterval) {
      clearInterval(this.continuousSyncInterval);
    }

    // Continuous sync every 2 seconds for real-time updates
    this.continuousSyncInterval = setInterval(() => {
      if (!this.isDestroyed && this.audioElement && this.lastKnownState) {
        this.continuousTimeSync();
      }
    }, 2000);
  }

  /**
   * Continuous time sync to keep all devices in perfect sync
   */
  continuousTimeSync() {
    if (!this.audioElement || !this.lastKnownState || this.isDestroyed) return;

    const audio = this.audioElement;
    const state = this.lastKnownState;

    // Only sync if audio is playing and we have a valid state
    if (state.isPlaying && !audio.paused && audio.readyState >= 2) {
      const now = Date.now();
      const timeSinceUpdate = state.timestamp ? (now - state.timestamp) / 1000 : 0;
      
      // Calculate expected current time
      const expectedTime = state.currentTime + timeSinceUpdate;
      const actualTime = audio.currentTime;
      const timeDifference = Math.abs(expectedTime - actualTime);

      // Sync if drift is more than 0.5 seconds
      if (timeDifference > 0.5) {
        console.log(`Continuous sync correction: ${actualTime.toFixed(2)}s -> ${expectedTime.toFixed(2)}s`);
        audio.currentTime = Math.max(0, Math.min(expectedTime, audio.duration || 0));
      }
    }
  }

  /**
   * Set up real-time listener for room state changes
   */
  setupRoomListener() {
    if (!this.roomId || this.isDestroyed) {
      console.error("SyncController: No roomId provided or controller destroyed");
      return;
    }

    // Clean up existing listener
    this.cleanupRoomListener();

    console.log(`Setting up Firebase listener for room: ${this.roomId}`);
    const roomRef = ref(database, `rooms/${this.roomId}`);

    this.roomListener = onValue(
      roomRef,
      this.handleRoomStateChange,
      (error) => {
        console.error("Sync listener error:", error);
        this.handleConnectionError(error);
      }
    );

    // Mark as connected only after listener is set up
    this.syncState.isConnected = true;
    console.log("Firebase listener established, marked as connected");
  }

  /**
   * Clean up room listener
   */
  cleanupRoomListener() {
    if (this.roomListener) {
      const roomRef = ref(database, `rooms/${this.roomId}`);
      off(roomRef, 'value', this.roomListener);
      this.roomListener = null;
    }
  }

    /**
   * Handle room state changes from Firebase
   */
  handleRoomStateChange(snapshot) {
    if (this.isDestroyed) return;

    if (!snapshot.exists()) {
      console.warn("Room not found in Firebase");
      this.handleRoomNotFound();
      return;
    }

    const newState = snapshot.val();
    const now = Date.now();

    console.log("Firebase room state received:", {
      isPlaying: newState.isPlaying,
      currentSong: newState.currentSong?.title,
      timestamp: newState.timestamp,
      hasAudio: !!this.audioElement
    });

    // Update sync state - ensure connection is marked as active
    this.syncState.isConnected = true;
    this.syncState.lastSync = now;
    this.syncState.connectionInterrupted = false;

    // Prevent processing our own updates too quickly to avoid conflicts
    if (this.lastUpdateTime && newState.timestamp &&
      Math.abs(newState.timestamp - this.lastUpdateTime) < 500) {
      console.log("Skipping sync - this appears to be our own recent update");
      this.lastKnownState = newState;
      this.notifyListeners('stateChange', newState);
      return;
    }

    // Calculate sync drift if we have a previous state
    if (this.lastKnownState && newState.timestamp) {
      const expectedTime = this.lastKnownState.currentTime +
        ((now - this.lastKnownState.timestamp) / 1000);
      this.syncState.syncDrift = Math.abs(newState.currentTime - expectedTime);
    }

    // Check if this is a meaningful state change that requires audio sync
    // CRITICAL FIX: Lower threshold for better real-time sync
    const shouldSync = !this.lastKnownState ||
      this.lastKnownState.isPlaying !== newState.isPlaying ||
      this.lastKnownState.currentSong?.url !== newState.currentSong?.url ||
      Math.abs(this.lastKnownState.currentTime - newState.currentTime) > 0.5; // Much more sensitive

    // Store previous state for comparison
    const prevState = this.lastKnownState;
    this.lastKnownState = newState;

    // Automatically sync audio if there's a meaningful change
    if (shouldSync && this.audioElement) {
      console.log("Auto-syncing audio due to room state change:", {
        playStateChanged: prevState ? prevState.isPlaying !== newState.isPlaying : false,
        songChanged: prevState ? prevState.currentSong?.url !== newState.currentSong?.url : false,
        timeChanged: prevState ? Math.abs(prevState.currentTime - newState.currentTime) : 0
      });

      // Debounce sync to prevent rapid fire syncing
      if (this.syncDebounceTimeout) {
        clearTimeout(this.syncDebounceTimeout);
      }

      this.syncDebounceTimeout = setTimeout(() => {
        this.syncAudioToState(newState);
      }, 100);
    }

    // Always notify listeners of state changes
    this.notifyListeners('stateChange', newState);
  }




  /**
   * Manually sync audio element to room state
   */
  syncAudioToState(roomState = null) {
    const state = roomState || this.lastKnownState;
    if (!this.audioElement || !state || this.isDestroyed) return;

    const audio = this.audioElement;

    try {
      console.log("Syncing audio to state:", {
        songTitle: state.currentSong?.title,
        isPlaying: state.isPlaying,
        currentTime: state.currentTime,
        audioSrc: audio.src,
        audioPaused: audio.paused,
        audioCurrentTime: audio.currentTime
      });

      // Sync song URL first if changed
      if (state.currentSong?.url && audio.src !== state.currentSong.url) {
        console.log("Syncing new song:", state.currentSong.title);
        audio.src = state.currentSong.url;
        audio.load();

        // Wait for audio to be ready before continuing
        return new Promise((resolve) => {
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            this.continueSync(audio, state);
            resolve();
          };
          audio.addEventListener('canplay', onCanPlay);
          // Fallback timeout
          setTimeout(() => {
            audio.removeEventListener('canplay', onCanPlay);
            this.continueSync(audio, state);
            resolve();
          }, 1000);
        });
      } else {
        this.continueSync(audio, state);
      }

    } catch (error) {
      console.warn("Error syncing audio:", error);
    }
  }

  /**
   * Continue sync after audio is ready
   */
  continueSync(audio, state) {
    try {
      console.log("Continue sync - Audio state:", {
        readyState: audio.readyState,
        paused: audio.paused,
        muted: audio.muted,
        currentTime: audio.currentTime,
        duration: audio.duration,
        src: audio.src ? "loaded" : "empty"
      });

      // First sync time to avoid conflicts, then handle play/pause
      this.syncTimeFirst(audio, state);

      // Then handle play/pause state with better error handling
      if (state.isPlaying && audio.paused) {
        if (audio.src && state.currentSong?.url && audio.readyState >= 2) {
          console.log("Starting playback");

          // Try to play with comprehensive error handling
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio playback started successfully");
                // Verify playback actually started
                setTimeout(() => {
                  if (audio.paused && state.isPlaying) {
                    console.warn("Audio still paused after play() - autoplay may be blocked");
                    this.handleAutoplayBlocked(audio, state);
                  }
                }, 100);
              })
              .catch(error => {
                console.error("Audio play failed:", error);
                this.handlePlayError(error, audio, state);
              });
          } else {
            // Fallback for older browsers
            setTimeout(() => {
              if (audio.paused && state.isPlaying) {
                this.handleAutoplayBlocked(audio, state);
              }
            }, 100);
          }
        } else {
          console.warn("Cannot play - audio not ready or no source");
        }
      } else if (!state.isPlaying && !audio.paused) {
        console.log("Pausing playback");
        audio.pause();
      }

    } catch (error) {
      console.error("Error in continueSync:", error);
      // Try force refresh on error
      setTimeout(() => this.forceRefreshAudio(), 1000);
    }
  }

  /**
   * Sync time with proper precision for real-time sync
   */
  syncTimeFirst(audio, state) {
    try {
      if (audio.readyState >= 2 && state.currentTime !== undefined) {
        const now = Date.now();
        const timeSinceUpdate = state.timestamp ? (now - state.timestamp) / 1000 : 0;

        // Calculate target time with network compensation
        let targetTime = state.currentTime;
        
        // Add time compensation if audio should be playing and state is recent
        if (state.isPlaying && timeSinceUpdate < 10) {
          targetTime = state.currentTime + timeSinceUpdate;
        }

        targetTime = Math.max(0, Math.min(targetTime, audio.duration || 0));
        const timeDifference = Math.abs(audio.currentTime - targetTime);

        // CRITICAL FIX: Lower threshold for better sync (was 3 seconds, now 1 second)
        if (timeDifference > 1) {
          console.log(`Syncing time: ${audio.currentTime.toFixed(2)}s -> ${targetTime.toFixed(2)}s (diff: ${timeDifference.toFixed(2)}s)`);
          audio.currentTime = targetTime;
        }
      }
    } catch (error) {
      console.warn("Error syncing time:", error);
    }
  }

  /**
   * Handle autoplay blocked scenario
   */
  handleAutoplayBlocked(audio, state) {
    console.log("Handling autoplay blocked - audio remains paused");
    // Don't try to force play when autoplay is blocked
    // The user will need to interact with the UI to start playback
    this.notifyListeners('autoplayBlocked', { audio, state });
  }

  /**
   * Handle play errors with specific error handling
   */
  handlePlayError(error, audio, state) {
    console.error("Play error details:", {
      name: error.name,
      message: error.message,
      audioState: {
        readyState: audio.readyState,
        paused: audio.paused,
        muted: audio.muted,
        src: audio.src ? "loaded" : "empty"
      }
    });

    if (error.name === 'NotAllowedError') {
      // Autoplay blocked - this is expected behavior
      this.handleAutoplayBlocked(audio, state);
    } else if (error.name === 'AbortError') {
      // Play was interrupted - try again after a short delay
      setTimeout(() => {
        if (state.isPlaying && audio.paused && audio.readyState >= 2) {
          console.log("Retrying play after AbortError");
          audio.play().catch(retryError => {
            console.warn("Retry play failed:", retryError);
          });
        }
      }, 500);
    } else {
      // Other errors - try force refresh
      console.log("Unknown play error - attempting force refresh");
      setTimeout(() => this.forceRefreshAudio(), 1000);
    }
  }

  /**
   * Force refresh audio element when stuck
   */
  forceRefreshAudio() {
    if (!this.audioElement || !this.lastKnownState) return;

    console.log("Force refreshing stuck audio element");
    const audio = this.audioElement;
    const state = this.lastKnownState;

    try {
      // Save current state
      const wasPlaying = !audio.paused;
      const currentTime = audio.currentTime;

      // Force reload the audio source
      if (state.currentSong?.url) {
        console.log("Reloading audio source for force refresh");

        // Clear current source first
        audio.pause();
        audio.src = "";
        audio.load();

        // Set new source
        audio.src = state.currentSong.url;
        audio.load();

        // Wait for audio to be ready then sync
        const onCanPlay = () => {
          audio.removeEventListener('canplay', onCanPlay);
          console.log("Audio reloaded, continuing sync");
          this.continueSync(audio, state);
        };

        const onError = () => {
          audio.removeEventListener('error', onError);
          console.error("Audio failed to reload during force refresh");
        };

        audio.addEventListener('canplay', onCanPlay);
        audio.addEventListener('error', onError);

        // Fallback timeout
        setTimeout(() => {
          audio.removeEventListener('canplay', onCanPlay);
          audio.removeEventListener('error', onError);
          console.log("Force refresh timeout - attempting sync anyway");
          this.continueSync(audio, state);
        }, 3000);
      }
    } catch (error) {
      console.error("Error force refreshing audio:", error);
    }
  }

  /**
   * Update room state
   */
  async updateState(updates) {
    if (!this.roomId || this.isDestroyed) return;

    try {
      const timestamp = Date.now();
      this.lastUpdateTime = timestamp; // Track when we last updated to prevent conflicts

      const stateUpdate = {
        ...updates,
        timestamp,
      };

      console.log("Updating room state:", stateUpdate);
      await updateRoomState(this.roomId, stateUpdate);
    } catch (error) {
      console.error("Failed to update room state:", error);
      this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * Handle connection errors and interruptions
   */
  handleConnectionError(error) {
    if (this.isDestroyed) return;

    this.syncState.isConnected = false;
    this.syncState.connectionInterrupted = true;

    this.notifyListeners('connectionError', error);

    // Attempt to reconnect after delay
    setTimeout(() => {
      if (!this.syncState.isConnected && !this.isDestroyed) {
        this.setupRoomListener();
      }
    }, 5000); // 5 second delay
  }

  /**
   * Handle room not found scenario
   */
  handleRoomNotFound() {
    if (this.isDestroyed) return;

    this.syncState.isConnected = false;
    this.notifyListeners('roomNotFound');
  }

  /**
   * Add event listener for sync events
   */
  addEventListener(event, callback) {
    if (this.isDestroyed) return;

    if (!this.listeners.has(`event_${event}`)) {
      this.listeners.set(`event_${event}`, new Set());
    }
    this.listeners.get(`event_${event}`).add(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event, callback) {
    const eventListeners = this.listeners.get(`event_${event}`);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  /**
   * Notify all listeners of an event
   */
  notifyListeners(event, data) {
    if (this.isDestroyed) return;

    const eventListeners = this.listeners.get(`event_${event}`);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in sync event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get current sync state
   */
  getSyncState() {
    return { ...this.syncState };
  }

  /**
   * Get current room state
   */
  getCurrentRoomState() {
    return this.lastKnownState;
  }

  /**
   * Check if connection is actually healthy
   */
  isConnectionHealthy() {
    const now = Date.now();
    const timeSinceLastSync = this.syncState.lastSync ? now - this.syncState.lastSync : Infinity;
    
    return (
      this.syncState.isConnected &&
      !this.syncState.connectionInterrupted &&
      timeSinceLastSync < 30000 && // Less than 30 seconds since last sync
      this.roomListener !== null
    );
  }

  /**
   * Force connection check and reconnect if needed
   */
  forceConnectionCheck() {
    console.log("Force checking connection status");
    
    if (!this.isConnectionHealthy()) {
      console.log("Connection unhealthy, attempting reconnect");
      this.syncState.isConnected = false;
      this.setupRoomListener();
    }
    
    return this.isConnectionHealthy();
  }

  /**
   * Clean up all listeners and intervals
   */
  destroy() {
    this.isDestroyed = true;

    // Clean up Firebase listener
    this.cleanupRoomListener();

    // Clean up continuous sync interval
    if (this.continuousSyncInterval) {
      clearInterval(this.continuousSyncInterval);
      this.continuousSyncInterval = null;
    }

    // Clean up debounce timeout
    if (this.syncDebounceTimeout) {
      clearTimeout(this.syncDebounceTimeout);
      this.syncDebounceTimeout = null;
    }

    // Reset state
    this.syncState.isConnected = false;
    this.audioElement = null;
    this.lastKnownState = null;
    this.listeners.clear();
  }
}

/**
 * Factory function to create sync controller instance
 */
export const createSyncController = (roomId) => {
  return new SyncController(roomId);
};