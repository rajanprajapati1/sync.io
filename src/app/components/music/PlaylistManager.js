import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Paper,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Alert,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  MusicNote,
  QueueMusic,
  MoreVert as MoreIcon,
} from '@mui/icons-material';

const PlaylistManager = ({
  playlist = [],
  currentSong = null,
  isPlaying = false,
  isCreator = false,
  onPlaySong,
  onRemoveSong,
  onReorderPlaylist,
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSongIndex, setSelectedSongIndex] = useState(null);

  const handleMenuOpen = (event, index) => {
    setAnchorEl(event.currentTarget);
    setSelectedSongIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSongIndex(null);
  };

  const handlePlaySong = (song, index) => {
    if (onPlaySong && isCreator) {
      onPlaySong(song, index);
    }
    handleMenuClose();
  };

  const handleRemoveSong = (index) => {
    if (onRemoveSong && isCreator) {
      onRemoveSong(index);
    }
    handleMenuClose();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCurrentSong = (song) => {
    return currentSong && song.id === currentSong.id;
  };

  const getTotalDuration = () => {
    const total = playlist.reduce((sum, song) => sum + (song.duration || 0), 0);
    const hours = Math.floor(total / 3600);
    const mins = Math.floor((total % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (playlist.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
        <QueueMusic sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" color="text.secondary" gutterBottom>
          No songs in playlist
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Search and add songs to get started
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Playlist Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" component="h3">
          Playlist ({playlist.length} songs)
        </Typography>
        <Chip
          label={getTotalDuration()}
          variant="outlined"
          size="small"
        />
      </Box>

      {/* Creator Instructions */}
      {!isCreator && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Only the room creator can control playback and manage the playlist
        </Alert>
      )}

      {/* Playlist */}
      <Paper sx={{ maxHeight: 500, overflow: 'auto' }}>
        <List>
          {playlist.map((song, index) => (
            <ListItem
              key={`${song.id}-${index}`}
              divider={index < playlist.length - 1}
              sx={{
                bgcolor: isCurrentSong(song) ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: isCurrentSong(song) ? 'action.selected' : 'action.hover',
                },
              }}
            >
              {/* Drag Handle (Creator Only) */}
              {isCreator && (
                <Box sx={{ mr: 1, cursor: 'grab' }}>
                  <DragIcon color="action" />
                </Box>
              )}

              <ListItemAvatar>
                <Avatar
                  src={song.albumArt}
                  alt={song.title}
                  sx={{ width: 48, height: 48 }}
                >
                  <MusicNote />
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography 
                      variant="subtitle2" 
                      noWrap
                      sx={{ 
                        fontWeight: isCurrentSong(song) ? 'bold' : 'normal',
                        color: isCurrentSong(song) ? 'primary.main' : 'inherit'
                      }}
                    >
                      {song.title}
                    </Typography>
                    {isCurrentSong(song) && (
                      <Chip
                        label={isPlaying ? "Playing" : "Paused"}
                        size="small"
                        color={isPlaying ? "success" : "default"}
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {song.artist}
                    </Typography>
                    <Box display="flex" gap={1} mt={0.5}>
                      {song.duration > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {formatDuration(song.duration)}
                        </Typography>
                      )}
                      {song.language && (
                        <Typography variant="caption" color="text.secondary">
                          • {song.language}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <Box display="flex" alignItems="center">
                  {/* Queue Position */}
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ mr: 1, minWidth: 20, textAlign: 'center' }}
                  >
                    {index + 1}
                  </Typography>

                  {/* Creator Controls */}
                  {isCreator && (
                    <>
                      {/* Play/Pause Button */}
                      <IconButton
                        edge="end"
                        onClick={() => handlePlaySong(song, index)}
                        disabled={disabled}
                        color={isCurrentSong(song) ? "primary" : "default"}
                        title={isCurrentSong(song) && isPlaying ? "Pause" : "Play"}
                      >
                        {isCurrentSong(song) && isPlaying ? <PauseIcon /> : <PlayIcon />}
                      </IconButton>

                      {/* More Options */}
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuOpen(e, index)}
                        disabled={disabled}
                        title="More options"
                      >
                        <MoreIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {selectedSongIndex !== null && (
          <>
            <MenuItem 
              onClick={() => handlePlaySong(playlist[selectedSongIndex], selectedSongIndex)}
              disabled={disabled}
            >
              <PlayIcon sx={{ mr: 1 }} />
              Play Now
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={() => handleRemoveSong(selectedSongIndex)}
              disabled={disabled}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon sx={{ mr: 1 }} />
              Remove from Playlist
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};

export default PlaylistManager;