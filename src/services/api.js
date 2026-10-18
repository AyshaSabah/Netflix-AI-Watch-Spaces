// API Service for Netflix AI Watch Spaces
const BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('netflix_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth Endpoints
  async register(name, email, password) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data;
  },

  async loginGuest() {
    const res = await fetch(`${BASE_URL}/auth/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login as guest');
    return data;
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Session expired');
    return await res.json();
  },

  // Movie Endpoints
  async getMovies() {
    const res = await fetch(`${BASE_URL}/movies`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch movies');
    return data.movies || [];
  },

  async getMovie(id) {
    const res = await fetch(`${BASE_URL}/movies/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Movie not found');
    return data.movie;
  },

  async getMovieTimeline(movieId) {
    const res = await fetch(`${BASE_URL}/movies/${movieId}/timeline`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch timeline trivia');
    return data.events || [];
  },

  // Room Endpoints
  async createRoom({ movieId, roomName, hostId, hostName }) {
    const res = await fetch(`${BASE_URL}/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ movieId, roomName, hostId, hostName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create room');
    return data.room;
  },

  async getRooms() {
    const res = await fetch(`${BASE_URL}/rooms`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch rooms');
    return data.rooms || [];
  },

  async getRoom(roomId) {
    const res = await fetch(`${BASE_URL}/rooms/${roomId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Room not found');
    return data;
  },

  // AI Co-Pilot Endpoint
  async askCopilot({ movieId, currentTimestamp, question }) {
    const res = await fetch(`${BASE_URL}/ai/copilot`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ movieId, currentTimestamp, question }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI Co-pilot failed to respond');
    return data;
  },

  // Watch History Endpoints
  async getUserHistory(userId) {
    const res = await fetch(`${BASE_URL}/history/${userId}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.history || [];
  },

  async updateHistory(payload) {
    const res = await fetch(`${BASE_URL}/history`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  },

  // Free Movie DB / IMDb Endpoints (Swagger 2.0 API)
  async searchFreeMovieDb(query, tt, lsn, v = 1) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (tt) params.set('tt', tt);
    if (lsn) params.set('lsn', lsn);
    if (v) params.set('v', v);

    const res = await fetch(`${BASE_URL}/imdb/search?${params.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to search Free Movie DB');
    return data.description || [];
  },

  async getTrending(category = 'all') {
    const res = await fetch(`${BASE_URL}/imdb/trending?category=${category}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch trending titles');
    return data;
  },

  async getMedia(id) {
    const res = await fetch(`${BASE_URL}/imdb/media/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch media');
    return data;
  },

  getPhotoUrl(id, w, h) {
    const params = new URLSearchParams();
    if (w) params.set('w', w);
    if (h) params.set('h', h);
    return `${BASE_URL}/imdb/photo/${id}?${params.toString()}`;
  },

  async getJustWatch(query, lang = 'en_IN') {
    const params = new URLSearchParams({ q: query, L: lang });
    const res = await fetch(`${BASE_URL}/imdb/justwatch?${params.toString()}`);
    const data = await res.json();
    return data;
  },

  async importFreeMovieDb(movieData) {
    const res = await fetch(`${BASE_URL}/imdb/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(movieData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to import movie');
    return data.movie;
  },

  // System Health
  async getHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },
};
