import React, { useRef, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Slider,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Alert,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeOff,
  VolumeUp,
  Sync,
  SyncProblem,
  SignalWifiOff,
} from "@mui/icons-material";
import { useSync } from "@/app/hooks/useSync";

const MusicPlayer = ({ roomId, onSongChange }) => {
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // start muted
  const [showSyncStatus, setShowSyncStatus] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [syncIssues, setSyncIssues] = useState(null);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(true);

  // Use the sync hook
  const {
    roomState,
    syncState,
    error: syncError,
    initializeAudio,
    updateRoomState,
    triggerSync,
    isSyncHealthy,
    networkLatency,
    syncDrift,
  } = useSync(roomId);

    // Robust audio initialization and connection monitoring
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
  }, [syncState.isConnected, roomState, syncIssues]);

  // Clear sync issues

  // Clear sync issues when user interacts
  useEffect(() => {
    if (hasInteracted) {
      setAutoplayBlocked(false);
      setSyncIssues(null);
    }
  }, [hasInteracted]);

  // Handle room state changes for UI updates only (sync is handled by sync controller)
  useEffect(() => {
    if (!roomState || !audioRef.current) return;

    const audio = audioRef.current;
    
    // Update song source if changed
    if (roomState.currentSong?.url && audio.src !== roomState.currentSong.url) {
      console.log("MusicPlayer: Song changed, updating source");
      audio.src = roomState.currentSong.url;
      audio.load();
    }

    // Trigger sync when room state changes (let sync controller handle the details)
    triggerSync();
  }, [roomState?.currentSong?.url, roomState?.isPlaying, triggerSync]);

    const handlePlayPause = async () => {
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
  };

  const handleTimeUpdate = () => {
    if (!isSeeking && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSliderChange = (event, newValue) => {
    setIsSeeking(true);
    setCurrentTime(newValue);
  };

  const handleSliderChangeCommitted = async (event, newValue) => {
    if (audioRef.current) {
      console.log(`User seeking to: ${newValue.toFixed(2)}s`);
      audioRef.current.currentTime = newValue;
      try {
        await updateRoomState({ 
          currentTime: newValue,
          isPlaying: roomState?.isPlaying || false // Preserve play state during seek
        });
        console.log("Seek position updated successfully");
      } catch (error) {
        console.error("Failed to update seek position:", error);
      }
    }
    setIsSeeking(false);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const toggleMute = () => {
    setHasInteracted(true);
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  };

  const handleSongEnded = async () => {
    try {
      // Notify parent component that song ended so it can advance to next song
      if (onSongChange) {
        onSongChange("next");
      } else {
        // Fallback: just stop playing
        await updateRoomState({ isPlaying: false });
      }
    } catch (error) {
      console.error("Failed to handle song ended:", error);
    }
  };

  const getSyncStatusIcon = () => {
    if (!syncState.isConnected) {
      return <SignalWifiOff color="error" />;
    }
    if (!isSyncHealthy()) {
      return <SyncProblem color="warning" />;
    }
    return <Sync color="success" />;
  };

  const getSyncStatusText = () => {
    if (!syncState.isConnected) {
      return "Disconnected";
    }
    if (!isSyncHealthy()) {
      return `Sync drift: ${syncDrift.toFixed(1)}s`;
    }
    return `Latency: ${networkLatency.toFixed(0)}ms`;
  };

  // Debug logging (only log once when roomState changes)
  useEffect(() => {
    console.log("MusicPlayer Debug:", {
      roomId,
      hasRoomState: !!roomState,
      currentSong: roomState?.currentSong?.title,
      isPlaying: roomState?.isPlaying,
      syncConnected: syncState.isConnected
    });
  }, [roomState?.isPlaying, roomState?.currentSong?.title, syncState.isConnected]);

  // --- Loading state ---
  if (!roomState) {
    return (
      <>
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: 400,
            height: 500,
            margin: "auto",
            mt: 5,
            p: 2,
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            Connecting to room...
          </Typography>
          {syncError && (
            <Typography variant="body2" color="error" sx={{ mt: 1, textAlign: "center" }}>
              Error: {syncError}
            </Typography>
          )}
        </Card>
        
        {/* Hidden audio element for sync system initialization */}
        <audio
          ref={audioRef}
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleSongEnded}
          style={{ display: 'none' }}
        />
      </>
    );
  }

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: 400,
        margin: "auto",
        mt: 5,
      }}
    >
      <CardMedia
        component="img"
        sx={{ height: 250 }}
        image={
          roomState.currentSong?.albumArt || "https://via.placeholder.com/400"
        }
        alt={roomState.currentSong?.title}
      />
      <CardContent sx={{ textAlign: "center" }}>
        <Typography component="div" variant="h5">
          {roomState.currentSong?.title || "No Song"}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {roomState.currentSong?.artist || "Select a song"}
        </Typography>
      </CardContent>

      <Box sx={{ p: 2 }}>
        <Slider
          aria-label="time-indicator"
          size="small"
          value={currentTime}
          min={0}
          step={1}
          max={duration || 0}
          onChange={handleSliderChange}
          onChangeCommitted={handleSliderChangeCommitted}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: -2 }}>
          <Typography variant="body2" color="text.secondary">
            {formatTime(currentTime)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatTime(duration)}
          </Typography>
        </Box>
      </Box>

      {/* User Interaction Required Alert */}
      {roomState.isPlaying && (isMuted || needsUserInteraction) && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Alert 
            severity="info" 
            size="small" 
            sx={{ mb: 1 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {
                  setHasInteracted(true);
                  setNeedsUserInteraction(false);
                  if (audioRef.current) {
                    audioRef.current.muted = false;
                    setIsMuted(false);
                    // Try to play immediately after user interaction
                    audioRef.current.play().catch(error => {
                      console.log("Play failed even after user interaction:", error);
                      setSyncIssues("Click the play button to start audio");
                    });
                  }
                }}
                sx={{ ml: 1 }}
              >
                <VolumeUp />
              </IconButton>
            }
          >
            {needsUserInteraction 
              ? "Click to start audio - browser requires user interaction"
              : "Music is playing! Click to unmute and hear the audio."
            }
          </Alert>
        </Box>
      )}

      {/* Sync Issues Alert */}
      {syncIssues && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Alert 
            severity="warning" 
            size="small" 
            sx={{ mb: 1 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={triggerSync}
                sx={{ ml: 1 }}
              >
                <Sync />
              </IconButton>
            }
          >
            {syncIssues}
          </Alert>
        </Box>
      )}

      {/* Sync Status Display */}
      {(syncError || !isSyncHealthy()) && (
        <Box sx={{ px: 2, pb: 1 }}>
          {syncError && (
            <Alert severity="error" size="small" sx={{ mb: 1 }}>
              {syncError}
            </Alert>
          )}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
            <Chip
              icon={getSyncStatusIcon() }
              label={getSyncStatusText() || 'no label'}
              size="small"
              variant="outlined"
              onClick={() => setShowSyncStatus(!showSyncStatus)}
            />
          </Box>
          {showSyncStatus && (
            <Box sx={{ mt: 1, p: 1, bgcolor: "background.paper", borderRadius: 1 }}>
              <Typography variant="caption" display="block">
                Network Latency: {networkLatency.toFixed(0)}ms
              </Typography>
              <Typography variant="caption" display="block">
                Sync Drift: {syncDrift.toFixed(2)}s
              </Typography>
              <Typography variant="caption" display="block">
                Connected: {syncState.isConnected ? "Yes" : "No"}
              </Typography>
              <Typography variant="caption" display="block">
                Last Sync: {syncState.lastSync ? new Date(syncState.lastSync).toLocaleTimeString() : "Never"}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pb: 1,
        }}
      >
        <IconButton aria-label="previous" onClick={() => onSongChange && onSongChange("prev")}>
          <SkipPrevious />
        </IconButton>
        <IconButton aria-label="play/pause" onClick={handlePlayPause}>
          {roomState.isPlaying
            ? <Pause sx={{ height: 38, width: 38 }} />
            : <PlayArrow sx={{ height: 38, width: 38 }} />}
        </IconButton>
        <IconButton aria-label="next" onClick={() => onSongChange && onSongChange("next")}>
          <SkipNext />
        </IconButton>
        <IconButton aria-label="mute" onClick={toggleMute}>
          {isMuted ? <VolumeOff /> : <VolumeUp />}
        </IconButton>
        <IconButton aria-label="sync" onClick={triggerSync} title="Manual sync">
          <Sync />
        </IconButton>
      </Box>

      <audio
        ref={audioRef}
        muted={isMuted} // start muted for autoplay safety
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleSongEnded}
        src={roomState.currentSong?.url}
      />
    </Card>
  );
};

export default MusicPlayer;
