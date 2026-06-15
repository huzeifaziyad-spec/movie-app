const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const cache = new Map();

export const fetchFromTMDB = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}`;
  
  if (cache.has(url)) {
    return cache.get(url);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.status_message || "Error Fetching from TMDB");
    }
    const data = await response.json();
    cache.set(url, data);
    return data;
  } catch (error) {
    console.error(`TMDB Fetch Error (${endpoint}):`, error);
    throw error;
  }
};

export const movieGenreMap = {
  "Action": 28, "Adventure": 12, "Animation": 16, "Biography": 1, "Crime": 80, "Comedy": 35, "Documentary": 99, "Drama": 18, "Family": 10751, "Fantasy": 14, "History": 36, "Horror": 27, "Music": 10402, "Mystery": 9648, "Romance": 10749, "Science Fiction": 878, "TV Movie": 10770, "Thriller": 53, "War": 10752, "Western": 37
};

export const tvGenreMap = {
  "Action & Adventure": 10759, "Animation": 16, "Comedy": 35, "Crime": 80, "Documentary": 99, "Drama": 18, "Family": 10751, "Kids": 10762, "Mystery": 9648, "News": 10763, "Reality": 10764, "Sci-Fi & Fantasy": 10765, "Soap": 10766, "Talk": 10767, "War & Politics": 10768, "Western": 37
};

export const genreMap = movieGenreMap;
