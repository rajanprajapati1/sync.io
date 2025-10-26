/**
 * Comprehensive fix for sync issues - making it robust and working
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Applying Robust Sync Fixes...\n');

// Fix 1: Add better connection status handling in sync.js
const syncPath = path.join(__dirname, 'src/app/libs/sync.js');
let syncContent = fs.readFileSync(syncPath, 'utf8');

// Add connection health check method
const connectionHealthCheck = `
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
  }`;

// Insert before the destroy method
syncContent = syncContent.replace(
  '  /**\n   * Clean up all listeners and intervals\n   */',
  connectionHealthCheck + '\n\n  /**\n   * Clean up all listeners and intervals\n   */'
);

// Fix 2: Improve the handleRoomStateChange to be more robust
const improvedHandleRoomStateChange = `  /**
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
    const shouldSync = !this.lastKnownState ||
      this.lastKnownState.isPlaying !== newState.isPlaying ||
      this.lastKnownState.currentSong?.url !== newState.currentSong?.url ||
      Math.abs(this.lastKnownState.currentTime - newState.currentTime) > 2;

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
  }`;

// Replace the existing handleRoomStateChange method
syncContent = syncContent.replace(
  /\/\*\*\s*\n\s*\* Handle room state changes from Firebase[\s\S]*?(?=\n\s*\/\*\*|\n\s*[a-zA-Z_])/,
  improvedHandleRoomStateChange + '\n\n'
);

fs.writeFileSync(syncPath, syncContent);
console.log('✅ Updated sync.js with robust connection handling');

// Fix 3: Add better audio initialization and autoplay handling
const musicPlayerPath = path.join(__dirname, 'src/app/components/MusicPlayer.js');
let musicPlayerContent = fs.readFileSync(musicPlayerPath, 'utf8');

// Add a robust audio initialization effect
const robustAudioInit = `  // Robust audio initialization and connection monitoring
  useEffect(() => {
    if (!audioRef.current || !initializeAudio) return;

    console.log("MusicPlayer: Setting up robust audio initialization");
    
    const audio = audioRef.current;
    
    // Configure audio element for better compatibility
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";
    
    // Initialize with sync controller
    initializeAudio(audio);
    
    // Set up comprehensive audio event handlers
    const handleAudioError = (e) => {
      console.error("Audio error:", e);
      setSyncIssues("Audio failed to load. Try refreshing or check your connection.");
    };
    
    const handleAudioCanPlay = () => {
      console.log("Audio ready to play");
      setSyncIssues(null);
    };
    
    const handleAudioLoadStart = () => {
      console.log("Audio loading started");
    };
    
    const handleAudioWaiting = () => {
      console.log("Audio waiting for data");
      setSyncIssues("Loading audio...");
    };
    
    const handleAudioPlaying = () => {
      console.log("Audio actually playing");
      setSyncIssues(null);
      setNeedsUserInteraction(false);
    };
    
    // Add all event listeners
    audio.addEventListener('error', handleAudioError);
    audio.addEventListener('canplay', handleAudioCanPlay);
    audio.addEventListener('loadstart', handleAudioLoadStart);
    audio.addEventListener('waiting', handleAudioWaiting);
    audio.addEventListener('playing', handleAudioPlaying);
    
    // Cleanup function
    return () => {
      audio.removeEventListener('error', handleAudioError);
      audio.removeEventListener('canplay', handleAudioCanPlay);
      audio.removeEventListener('loadstart', handleAudioLoadStart);
      audio.removeEventListener('waiting', handleAudioWaiting);
      audio.removeEventListener('playing', handleAudioPlaying);
    };
  }, [initializeAudio]);

  // Monitor sync connection status
  useEffect(() => {
    if (!syncState.isConnected && roomState) {
      setSyncIssues("Connection lost. Trying to reconnect...");
    } else if (syncState.isConnected && syncIssues === "Connection lost. Trying to reconnect...") {
      setSyncIssues(null);
    }
  }, [syncState.isConnected, roomState, syncIssues]);`;

// Replace the existing audio initialization
musicPlayerContent = musicPlayerContent.replace(
  /\/\/ Initialize audio element with sync controller[\s\S]*?(?=\n\s*\/\/ Clear sync issues)/,
  robustAudioInit + '\n\n  // Clear sync issues'
);

// Add a better play/pause handler that handles autoplay restrictions
const robustPlayPause = `  const handlePlayPause = async () => {
    if (!roomState) return;

    console.log("Play/Pause clicked - Current state:", {
      isPlaying: roomState.isPlaying,
      hasInteracted,
      isMuted,
      audioReady: audioRef.current?.readyState
    });

    setHasInteracted(true);
    setNeedsUserInteraction(false);
    
    const newState = !roomState.isPlaying;
    
    // If user is trying to play, ensure audio is ready
    if (newState && audioRef.current) {
      // Unmute audio for user interaction
      setIsMuted(false);
      audioRef.current.muted = false;
      
      // Try to play immediately to test autoplay
      try {
        await audioRef.current.play();
        console.log("Audio play test successful");
      } catch (error) {
        console.log("Autoplay blocked, will sync after state update:", error.name);
      }
    }
    
    try {
      await updateRoomState({
        isPlaying: newState,
        currentTime: audioRef.current?.currentTime || 0,
      });
      
      console.log("Room state updated successfully:", { isPlaying: newState });
    } catch (error) {
      console.error("Failed to update play/pause state:", error);
      setSyncIssues("Failed to update playback state. Check your connection.");
    }
  };`;

// Replace the existing handlePlayPause
musicPlayerContent = musicPlayerContent.replace(
  /const handlePlayPause = async \(\) => \{[\s\S]*?\n  \};/,
  robustPlayPause
);

fs.writeFileSync(musicPlayerPath, musicPlayerContent);
console.log('✅ Updated MusicPlayer.js with robust audio handling');

// Fix 4: Add connection monitoring to useSync hook
const useSyncPath = path.join(__dirname, 'src/app/hooks/useSync.js');
let useSyncContent = fs.readFileSync(useSyncPath, 'utf8');

// Add connection monitoring
const connectionMonitoring = `  // Monitor and maintain connection health
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
  }, [roomId]);`;

// Insert before the initializeAudio callback
useSyncContent = useSyncContent.replace(
  '  // Initialize audio element when available',
  connectionMonitoring + '\n\n  // Initialize audio element when available'
);

fs.writeFileSync(useSyncPath, useSyncContent);
console.log('✅ Updated useSync.js with connection monitoring');

console.log('\n🎯 Robust Sync Fixes Applied Successfully!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Added connection health monitoring');
console.log('✅ Improved Firebase listener robustness');
console.log('✅ Enhanced audio initialization and error handling');
console.log('✅ Better autoplay restriction handling');
console.log('✅ Comprehensive user interaction management');
console.log('✅ Connection status monitoring and auto-reconnect');
console.log('');
console.log('🔧 Key Improvements:');
console.log('• Connection health checks every 10 seconds');
console.log('• Auto-reconnect when connection is lost');
console.log('• Better audio loading and error feedback');
console.log('• Robust autoplay blocked detection');
console.log('• Clear user interaction prompts');
console.log('• Comprehensive audio event monitoring');
console.log('');
console.log('📱 Now the app should:');
console.log('1. Show proper connection status');
console.log('2. Handle autoplay restrictions gracefully');
console.log('3. Provide clear feedback when audio needs user interaction');
console.log('4. Auto-reconnect when connection is lost');
console.log('5. Work reliably across multiple devices');