import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  PlayArrow as PlayIcon,
  MusicNote,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { searchAndTransformSongs } from '@/app/libs/musicApi';

const SongSearch = ({ 
  onAddToPlaylist, 
  onPlayNow, 
  isCreator = false,
  disabled = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchAndTransformSongs(query, 0, 10);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search songs. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        performSearch(searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
  };

  const handleAddToPlaylist = (song) => {
    if (onAddToPlaylist) {
      onAddToPlaylist(song);
    }
  };

  const handlePlayNow = (song) => {
    if (onPlayNow && isCreator) {
      onPlayNow(song);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      {/* Search Input */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search for songs..."
        value={searchQuery}
        onChange={handleSearchChange}
        disabled={disabled}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={3}>
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center' }}>
            Searching songs...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* No Results */}
      {hasSearched && !loading && searchResults.length === 0 && !error && (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
          <MusicNote sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary">
            No songs found for "{searchQuery}"
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try different keywords or check spelling
          </Typography>
        </Paper>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
          <List>
            {searchResults.map((song, index) => (
              <ListItem
                key={`${song.id}-${index}`}
                divider={index < searchResults.length - 1}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={song.albumArt}
                    alt={song.title}
                    sx={{ width: 56, height: 56 }}
                  >
                    <MusicNote />
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography variant="subtitle1" noWrap>
                      {song.title}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {song.artist}
                      </Typography>
                      {song.album && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {song.album}
                        </Typography>
                      )}
                      <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                        {song.duration > 0 && (
                          <Chip
                            label={formatDuration(song.duration)}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {song.language && (
                          <Chip
                            label={song.language}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {song.explicitContent && (
                          <Chip
                            label="Explicit"
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Box display="flex" gap={1}>
                    {/* Add to Playlist Button */}
                    <IconButton
                      edge="end"
                      onClick={() => handleAddToPlaylist(song)}
                      disabled={disabled}
                      title="Add to playlist"
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>

                    {/* Play Now Button (Creator Only) */}
                    {isCreator && (
                      <IconButton
                        edge="end"
                        onClick={() => handlePlayNow(song)}
                        disabled={disabled}
                        title="Play now"
                        color="secondary"
                      >
                        <PlayIcon />
                      </IconButton>
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Search Instructions */}
      {!hasSearched && !loading && (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
          <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Search for your favorite songs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isCreator 
              ? "You can add songs to playlist or play them immediately"
              : "You can suggest songs to add to the playlist"
            }
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SongSearch;