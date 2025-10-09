import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data, error.config?.url);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  user_id: string;
  tracks?: Track[];
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expires_at: string;
}

export interface SearchResponse {
  tracks: Track[];
  playlists: Playlist[];
  total: number;
}

export const authAPI = {
  register: async (data: { username: string; email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: { username: string; password: string }) => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put<User>('/users/profile', data);
    return response.data;
  },

  getUserStats: async () => {
    const response = await api.get<{ tracks_count: number; playlists_count: number }>('/users/stats');
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/profile');
    return response.data;
  },
};

export const trackAPI = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<Track>('/tracks/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getUserTracks: async (limit = 20, offset = 0) => {
    const response = await api.get<{ tracks: Track[]; limit: number; offset: number }>('/tracks', {
      params: { limit, offset },
    });
    return response.data;
  },

  getTrack: async (id: string) => {
    const response = await api.get<Track>(`/tracks/${id}`);
    return response.data;
  },

  deleteTrack: async (id: string) => {
    const response = await api.delete(`/tracks/${id}`);
    return response.data;
  },

  getStreamUrl: (id: string) => `${API_BASE_URL}/tracks/${id}/stream`,
};

export const playlistAPI = {
  create: async (data: { name: string; description?: string }) => {
    const response = await api.post<Playlist>('/playlists', data);
    return response.data;
  },

  getUserPlaylists: async (limit = 20, offset = 0) => {
    const response = await api.get<{ playlists: Playlist[]; limit: number; offset: number }>('/playlists', {
      params: { limit, offset },
    });
    return response.data;
  },

  getPlaylist: async (id: string) => {
    const response = await api.get<Playlist>(`/playlists/${id}`);
    return response.data;
  },

  updatePlaylist: async (id: string, data: { name?: string; description?: string }) => {
    const response = await api.put<Playlist>(`/playlists/${id}`, data);
    return response.data;
  },

  deletePlaylist: async (id: string) => {
    const response = await api.delete(`/playlists/${id}`);
    return response.data;
  },

  addTrack: async (playlistId: string, trackId: string) => {
    const response = await api.post(`/playlists/${playlistId}/tracks`, { track_id: trackId });
    return response.data;
  },

  removeTrack: async (playlistId: string, trackId: string) => {
    const response = await api.delete(`/playlists/${playlistId}/tracks/${trackId}`);
    return response.data;
  },
};

export const searchAPI = {
  search: async (query: string, limit = 20, offset = 0) => {
    const response = await api.get<SearchResponse>('/search', {
      params: { q: query, limit, offset },
    });
    return response.data;
  },

  searchTracks: async (query: string, limit = 20, offset = 0) => {
    const response = await api.get<{ tracks: Track[]; limit: number; offset: number }>('/search/tracks', {
      params: { q: query, limit, offset },
    });
    return response.data;
  },

  searchPlaylists: async (query: string, limit = 20, offset = 0) => {
    const response = await api.get<{ playlists: Playlist[]; limit: number; offset: number }>('/search/playlists', {
      params: { q: query, limit, offset },
    });
    return response.data;
  },

  getSuggestions: async (query: string, limit = 10) => {
    const response = await api.get<{ suggestions: string[] }>('/search/suggestions', {
      params: { q: query, limit },
    });
    return response.data;
  },
};

export default api;
