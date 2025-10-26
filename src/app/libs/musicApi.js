/**
 * Music API service for Saavn integration
 * Handles song search and song details fetching
 */

const SAAVN_API_BASE = process.env.URL;

/**
 * Search for songs using Saavn API
 * @param {string} query - Search query
 * @param {number} page - Page number (default: 0)
 * @param {number} limit - Number of results (default: 10)
 * @returns {Promise<Object>} Search results
 */
export const searchSongs = async (query, page = 0, limit = 10) => {
  try {
    const response = await fetch(
      `${SAAVN_API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Search API returned error');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error searching songs:', error);
    throw error;
  }
};

/**
 * Get detailed song information by ID
 * @param {string} songId - Song ID
 * @returns {Promise<Object>} Song details
 */
export const getSongDetails = async (songId) => {
  try {
    const response = await fetch(`${SAAVN_API_BASE}/songs/${songId}`);
    
    if (!response.ok) {
      throw new Error(`Song details fetch failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Song details API returned error');
    }
    
    return data.data[0]; // Return first song from array
  } catch (error) {
    console.error('Error fetching song details:', error);
    throw error;
  }
};

/**
 * Transform Saavn song data to our internal format
 * @param {Object} saavnSong - Song data from Saavn API
 * @returns {Object} Transformed song object
 */
export const transformSaavnSong = (saavnSong) => {
  // Get the best quality download URL
  const downloadUrls = saavnSong.downloadUrl || [];
  const bestQualityUrl = downloadUrls.find(url => url.quality === '320kbps') || 
                        downloadUrls.find(url => url.quality === '160kbps') || 
                        downloadUrls[0];
  
  // Get the best quality image
  const images = saavnSong.image || [];
  const bestImage = images.find(img => img.quality === '500x500') || 
                   images.find(img => img.quality === '150x150') || 
                   images[0];
  
  // Get primary artist name
  const primaryArtist = saavnSong.artists?.primary?.[0]?.name || 'Unknown Artist';
  
  return {
    id: saavnSong.id,
    title: saavnSong.name,
    artist: primaryArtist,
    url: bestQualityUrl?.url || '',
    albumArt: bestImage?.url || 'https://via.placeholder.com/400x400/1976d2/ffffff?text=No+Image',
    duration: saavnSong.duration || 0,
    album: saavnSong.album?.name || '',
    year: saavnSong.year || null,
    language: saavnSong.language || '',
    hasLyrics: saavnSong.hasLyrics || false,
    // Additional metadata
    saavnId: saavnSong.id,
    saavnUrl: saavnSong.url,
    explicitContent: saavnSong.explicitContent || false,
    playCount: saavnSong.playCount || 0,
  };
};

/**
 * Search and transform songs in one call
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Array of transformed songs
 */
export const searchAndTransformSongs = async (query, page = 0, limit = 10) => {
  try {
    const searchResults = await searchSongs(query, page, limit);
    
    if (!searchResults.results || searchResults.results.length === 0) {
      return [];
    }
    
    return searchResults.results.map(transformSaavnSong);
  } catch (error) {
    console.error('Error in searchAndTransformSongs:', error);
    throw error;
  }
};

/**
 * Get song details and transform to our format
 * @param {string} songId - Song ID
 * @returns {Promise<Object>} Transformed song object
 */
export const getSongDetailsTransformed = async (songId) => {
  try {
    const songDetails = await getSongDetails(songId);
    return transformSaavnSong(songDetails);
  } catch (error) {
    console.error('Error in getSongDetailsTransformed:', error);
    throw error;
  }
};

/**
 * Validate if a song URL is playable
 * @param {string} url - Song URL to validate
 * @returns {Promise<boolean>} Whether the URL is playable
 */
export const validateSongUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Song URL validation failed:', error);
    return false;
  }
};