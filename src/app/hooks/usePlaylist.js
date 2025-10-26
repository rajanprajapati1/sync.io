import { useState, useCallback } from 'react';

/**
 * Custom hook for managing playlist state and operations
 */
export const usePlaylist = (initialPlaylist = []) => {
  const [playlist, setPlaylist] = useState(initialPlaylist);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Add song to playlist
  const addSong = useCallback((song) => {
    setPlaylist(prev => {
      // Check if song already exists
      const exists = prev.some(existingSong => existingSong.id === song.id);
      if (exists) {
        console.log('Song already in playlist:', song.title);
        return prev;
      }
      
      console.log('Adding song to playlist:', song.title);
      return [...prev, song];
    });
  }, []);

  // Remove song from playlist
  const removeSong = useCallback((index) => {
    setPlaylist(prev => {
      const newPlaylist = prev.filter((_, i) => i !== index);
      
      // Adjust current index if necessary
      if (index < currentIndex) {
        setCurrentIndex(prev => prev - 1);
      } else if (index === currentIndex && index >= newPlaylist.length) {
        setCurrentIndex(Math.max(0, newPlaylist.length - 1));
      }
      
      return newPlaylist;
    });
  }, [currentIndex]);

  // Move to next song
  const nextSong = useCallback(() => {
    setCurrentIndex(prev => {
      const nextIndex = prev + 1;
      return nextIndex < playlist.length ? nextIndex : 0; // Loop to beginning
    });
  }, [playlist.length]);

  // Move to previous song
  const previousSong = useCallback(() => {
    setCurrentIndex(prev => {
      const prevIndex = prev - 1;
      return prevIndex >= 0 ? prevIndex : playlist.length - 1; // Loop to end
    });
  }, [playlist.length]);

  // Jump to specific song
  const jumpToSong = useCallback((index) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentIndex(index);
    }
  }, [playlist.length]);

  // Reorder playlist
  const reorderPlaylist = useCallback((fromIndex, toIndex) => {
    setPlaylist(prev => {
      const newPlaylist = [...prev];
      const [movedSong] = newPlaylist.splice(fromIndex, 1);
      newPlaylist.splice(toIndex, 0, movedSong);
      
      // Adjust current index if necessary
      if (fromIndex === currentIndex) {
        setCurrentIndex(toIndex);
      } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
        setCurrentIndex(prev => prev - 1);
      } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
        setCurrentIndex(prev => prev + 1);
      }
      
      return newPlaylist;
    });
  }, [currentIndex]);

  // Clear entire playlist
  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentIndex(0);
  }, []);

  // Replace entire playlist
  const setNewPlaylist = useCallback((newPlaylist, newCurrentIndex = 0) => {
    setPlaylist(newPlaylist);
    setCurrentIndex(Math.min(newCurrentIndex, Math.max(0, newPlaylist.length - 1)));
  }, []);

  // Get current song
  const getCurrentSong = useCallback(() => {
    return playlist[currentIndex] || null;
  }, [playlist, currentIndex]);

  // Check if there's a next song
  const hasNext = useCallback(() => {
    return currentIndex < playlist.length - 1;
  }, [currentIndex, playlist.length]);

  // Check if there's a previous song
  const hasPrevious = useCallback(() => {
    return currentIndex > 0;
  }, [currentIndex]);

  // Get playlist statistics
  const getStats = useCallback(() => {
    const totalDuration = playlist.reduce((sum, song) => sum + (song.duration || 0), 0);
    return {
      totalSongs: playlist.length,
      totalDuration,
      currentIndex,
      currentSong: getCurrentSong(),
    };
  }, [playlist, currentIndex, getCurrentSong]);

  return {
    // State
    playlist,
    currentIndex,
    
    // Actions
    addSong,
    removeSong,
    nextSong,
    previousSong,
    jumpToSong,
    reorderPlaylist,
    clearPlaylist,
    setNewPlaylist,
    
    // Getters
    getCurrentSong,
    hasNext,
    hasPrevious,
    getStats,
  };
};