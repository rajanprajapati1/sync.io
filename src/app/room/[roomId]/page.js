"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  ExitToApp as LeaveIcon,
  Share as ShareIcon,
  People as PeopleIcon,
  MusicNote,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import Layout from "@/app/components/ui/Layout";
import ResponsiveContainer from "@/app/components/ui/ResponsiveContainer";
import ResponsiveGrid from "@/app/components/ui/ResponsiveGrid";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import MusicPlayer from "@/app/components/MusicPlayer";
import MembersList from "@/app/components/room/MembersList";
import RoomSettings from "@/app/components/room/RoomSettings";
import { useRoom } from "@/app/hooks/useRoom";
import { useAuthContext } from "@/app/components/auth/AuthProvider";
import { useNotification } from "@/app/components/ui/NotificationProvider";
// Import the new music components
import SongSearch from "@/app/components/music/SongSearch";
import PlaylistManager from "@/app/components/music/PlaylistManager";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthContext();
  const { showSuccess, showError, showRoomEvent } = useNotification();
  const roomId = params.roomId;
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [settingsLoading, setSettingsLoading] = React.useState(false);

  const {
    roomState,
    members,
    loading,
    error,
    isCreator,
    isMember,
    canJoin,
    joinRoom,
    leaveRoom,
    updateRoomState,
    deleteRoom,
    kickUser,
    updateRoomSettings,
  } = useRoom(roomId);

  // Use room state playlist directly instead of local state
  const playlist = roomState?.playlist || [];
  const currentSong = roomState?.currentSong || null;

  // Auto-join room if user is not a member but can join
  useEffect(() => {
    if (user && roomState && !isMember && canJoin) {
      joinRoom().catch((error) => {
        console.error("Auto-join failed:", error);
      });
    }
  }, [user, roomState, isMember, canJoin, joinRoom]);

  const handleLeaveRoom = async () => {
    try {
      await leaveRoom();
      showRoomEvent('room_left', { roomId });
      router.push("/dashboard");
    } catch (error) {
      console.error("Error leaving room:", error);
      showError("Failed to leave room. Please try again.");
    }
  };

  const handleDeleteRoom = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this room? This will remove all members.",
      )
    ) {
      try {
        await deleteRoom();
        showRoomEvent('room_ended');
        router.push("/dashboard");
      } catch (error) {
        console.error("Error deleting room:", error);
        showError("Failed to delete room. Please try again.");
      }
    }
  };

  const handleShareRoom = async () => {
    const roomUrl = `${window.location.origin}/room/${roomId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${roomState?.roomName || "Music Room"}`,
          text: "Join me for synchronized music listening!",
          url: roomUrl,
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        copyToClipboard(roomUrl);
      }
    } else {
      copyToClipboard(roomUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showSuccess("Room link copied to clipboard!");
    }).catch(() => {
      showError("Failed to copy room link to clipboard");
    });
  };

  const handleUpdateRoomSettings = async (settings) => {
    setSettingsLoading(true);
    try {
      await updateRoomSettings(settings);
      setSettingsOpen(false);
    } catch (error) {
      console.error("Error updating room settings:", error);
      // Error will be handled by the RoomSettings component
    } finally {
      setSettingsLoading(false);
    }
  };

  // Music and playlist management functions
  const handleAddToPlaylist = async (song) => {
    try {
      // Check if song already exists in playlist
      const exists = playlist.some(existingSong => existingSong.id === song.id);
      if (exists) {
        showError(`"${song.title}" is already in the playlist`);
        return;
      }

      // Add song to playlist
      const newPlaylist = [...playlist, song];
      await updateRoomState({
        playlist: newPlaylist,
      });

      showSuccess(`Added "${song.title}" to playlist`);
    } catch (error) {
      console.error("Error adding song to playlist:", error);
      showError("Failed to add song to playlist");
    }
  };

  const handlePlayNow = async (song) => {
    if (!isCreator) return;

    try {
      // Add to playlist if not already there
      let newPlaylist = playlist;
      if (!playlist.some(s => s.id === song.id)) {
        newPlaylist = [...playlist, song];
      }

      // Play the song immediately
      await updateRoomState({
        currentSong: song,
        currentTime: 0,
        isPlaying: true,
        playlist: newPlaylist,
      });

      showSuccess(`Now playing "${song.title}"`);
    } catch (error) {
      console.error("Error playing song:", error);
      showError("Failed to play song");
    }
  };

  const handlePlayFromPlaylist = async (song, index) => {
    if (!isCreator) return;

    try {
      await updateRoomState({
        currentSong: song,
        currentTime: 0,
        isPlaying: true,
      });
    } catch (error) {
      console.error("Error playing song from playlist:", error);
      showError("Failed to play song");
    }
  };

  const handleRemoveFromPlaylist = async (index) => {
    if (!isCreator) return;

    try {
      const songToRemove = playlist[index];
      
      // Remove song from playlist
      const newPlaylist = playlist.filter((_, i) => i !== index);
      await updateRoomState({
        playlist: newPlaylist,
      });

      showSuccess(`Removed "${songToRemove?.title}" from playlist`);
    } catch (error) {
      console.error("Error removing song from playlist:", error);
      showError("Failed to remove song from playlist");
    }
  };

  const handleSongChange = async (direction) => {
    if (!isCreator) return;

    try {
      if (playlist.length === 0) {
        showError("No songs in playlist");
        return;
      }

      // Find current song index in playlist
      const currentIndex = playlist.findIndex(song => 
        song.id === roomState.currentSong?.id
      );

      let newIndex;
      if (direction === "next") {
        newIndex = currentIndex >= 0 ? (currentIndex + 1) % playlist.length : 0;
      } else {
        newIndex = currentIndex >= 0 ? 
          (currentIndex - 1 + playlist.length) % playlist.length : 
          playlist.length - 1;
      }

      const newSong = playlist[newIndex];
      if (newSong) {
        await updateRoomState({
          currentSong: newSong,
          currentTime: 0,
          isPlaying: true,
        });
      }
    } catch (error) {
      console.error("Error changing song:", error);
      showError("Failed to change song");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <ResponsiveContainer sx={{ textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading room...
            </Typography>
          </ResponsiveContainer>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Layout>
          <ResponsiveContainer>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={() => router.push("/dashboard")}
              sx={{ minHeight: { xs: 44, sm: 36 } }}
            >
              Back to Dashboard
            </Button>
          </ResponsiveContainer>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!roomState) {
    return (
      <ProtectedRoute>
        <Layout>
          <ResponsiveContainer>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Room not found
            </Alert>
            <Button
              variant="contained"
              onClick={() => router.push("/dashboard")}
              sx={{ minHeight: { xs: 44, sm: 36 } }}
            >
              Back to Dashboard
            </Button>
          </ResponsiveContainer>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <ResponsiveContainer>
          {/* Room Header */}
          <Box mb={{ xs: 3, md: 4 }}>
            <Box
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "flex-start" }}
              gap={{ xs: 2, sm: 0 }}
              mb={2}
            >
              <Box>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" },
                    textAlign: { xs: "center", sm: "left" }
                  }}
                >
                  {roomState.roomName}
                </Typography>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mb={1}
                  sx={{
                    flexWrap: "wrap",
                    justifyContent: { xs: "center", sm: "flex-start" }
                  }}
                >
                  <Chip
                    icon={<PeopleIcon />}
                    label={`${members.length}/${roomState.maxMembers} members`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />

                  <Chip
                    label={`Room ID: ${roomId}`}
                    variant="outlined"
                    size="small"
                  />

                  {isCreator && (
                    <Chip
                      label="Creator"
                      color="secondary"
                      size="small"
                    />
                  )}
                </Box>
              </Box>

              <Box
                display="flex"
                gap={1}
                sx={{
                  flexDirection: { xs: "column", sm: "row" },
                  width: { xs: "100%", sm: "auto" }
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ShareIcon />}
                  onClick={handleShareRoom}
                  sx={{ minHeight: { xs: 44, sm: 36 } }}
                >
                  Share
                </Button>
                {isCreator && (
                  <Button
                    variant="outlined"
                    startIcon={<SettingsIcon />}
                    onClick={() => setSettingsOpen(true)}
                    sx={{ minHeight: { xs: 44, sm: 36 } }}
                  >
                    Settings
                  </Button>
                )}
                {isCreator
                  ? <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteRoom}
                    sx={{ minHeight: { xs: 44, sm: 36 } }}
                  >
                    Delete Room
                  </Button>
                  : <Button
                    variant="outlined"
                    startIcon={<LeaveIcon />}
                    onClick={handleLeaveRoom}
                    sx={{ minHeight: { xs: 44, sm: 36 } }}
                  >
                    Leave Room
                  </Button>}
              </Box>
            </Box>
          </Box>

          <ResponsiveGrid container spacing={3}>
            {/* Music Player */}
            <ResponsiveGrid item xs={12} lg={6}>
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                  >
                    <MusicNote sx={{ mr: 1, verticalAlign: "middle" }} />
                    Now Playing
                  </Typography>

                  {roomState.currentSong
                    ? <MusicPlayer
                      roomId={roomId}
                      onSongChange={handleSongChange}
                    />
                    : <Box textAlign="center" py={{ xs: 3, sm: 4 }}>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        gutterBottom
                        sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                      >
                        No music is currently playing
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.9rem" } }}
                      >
                        Search for songs and add them to the playlist to get started
                      </Typography>
                    </Box>}
                </CardContent>
              </Card>
            </ResponsiveGrid>

            {/* Members List */}
            <ResponsiveGrid item xs={12} lg={6}>
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <MembersList
                    members={members}
                    roomState={roomState}
                    onKickUser={kickUser}
                    maxMembers={roomState.maxMembers}
                    showActions={true}
                  />
                </CardContent>
              </Card>
            </ResponsiveGrid>

            {/* Song Search */}
            <ResponsiveGrid item xs={12} lg={6}>
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                  >
                    🔍 Search Music
                  </Typography>
                  <SongSearch
                    onAddToPlaylist={handleAddToPlaylist}
                    onPlayNow={handlePlayNow}
                    isCreator={isCreator}
                    disabled={loading}
                  />
                </CardContent>
              </Card>
            </ResponsiveGrid>

            {/* Playlist Manager */}
            <ResponsiveGrid item xs={12} lg={6}>
              <Card>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                  >
                    🎵 Playlist Queue
                  </Typography>
                  <PlaylistManager
                    playlist={playlist}
                    currentSong={roomState.currentSong}
                    isPlaying={roomState.isPlaying}
                    isCreator={isCreator}
                    onPlaySong={handlePlayFromPlaylist}
                    onRemoveSong={handleRemoveFromPlaylist}
                    disabled={loading}
                  />
                </CardContent>
              </Card>
            </ResponsiveGrid>
          </ResponsiveGrid>

          {/* Room Settings Dialog */}
          <RoomSettings
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            roomState={roomState}
            onUpdateSettings={handleUpdateRoomSettings}
            loading={settingsLoading}
          />
        </ResponsiveContainer>
      </Layout>
    </ProtectedRoute>
  );
}
