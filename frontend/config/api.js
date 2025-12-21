import * as SecureStore from "expo-secure-store";
import { useAuth } from "../context/AuthContext.js";
export const API_URL = "http://192.168.1.7:8080";

let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

const getAuthToken = async () => {
  return await SecureStore.getItemAsync("userToken");
};

// Base API call function
export const apiCall = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("user");

      if (logoutCallback) {
        logoutCallback();
      }

      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error(data.message || "Request failed");
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sessions API
export const sessionsAPI = {
  getMyList: async () => {
    return apiCall("/sessions/mylist", {
      method: "GET",
    });
  },

  getPrebuilt: async () => {
    return apiCall("/sessions/prebuilt", {
      method: "GET",
    });
  },

  subscribe: async (sessionId) => {
    return apiCall(`/sessions/${sessionId}/subscribe`, {
      method: "POST",
    });
  },

  unsubscribe: async (sessionId) => {
    return apiCall(`/sessions/${sessionId}/unsubscribe`, {
      method: "DELETE",
    });
  },

  delete: async (sessionId) => {
    return apiCall(`/sessions/${sessionId}`, {
      method: "DELETE",
    });
  },

  toggleFavorite: async (sessionId, isFavorite) => {
    return apiCall(`/sessions/${sessionId}/favorite`, {
      method: "POST",
      body: JSON.stringify({
        favorite: isFavorite,
      }),
    });
  },

  create: async (sessionData) => {
    return apiCall("/sessions", {
      method: "POST",
      body: JSON.stringify(sessionData),
    });
  },

  update: async (sessionId, sessionData) => {
    return apiCall(`/sessions/${sessionId}`, {
      method: "PUT",
      body: JSON.stringify(sessionData),
    });
  },

  updateProgress: async (sessionId, progress) => {
    return apiCall(`/sessions/${sessionId}/progress`, {
      method: "PUT",
      body: JSON.stringify({ progress }),
    });
  },

  resetProgress: async () => {
    return apiCall("/sessions/reset-progress", {
      method: "POST",
    });
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    return apiCall("/user/profile", {
      method: "GET",
    });
  },

  updateProfile: async (userData) => {
    return apiCall("/user/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  updateAvatar: async (avatarData) => {
    return apiCall("/user/avatar", {
      method: "POST",
      body: JSON.stringify(avatarData),
    });
  },
};

export const transformSessionData = (sessionData) => {
  return {
    id: sessionData.id,
    title: sessionData.title,
    type: sessionData.type,
    duration: sessionData.duration,
    difficulty: sessionData.difficulty,
    intensity: sessionData.intensity,
    description: sessionData.description,
    image: sessionData.image?.startsWith("http")
      ? { uri: sessionData.image }
      : sessionData.image
      ? { uri: `${API_URL}${sessionData.image}` }
      : null,
    progress: sessionData.progress || null,
    ownerId: sessionData.ownerId,
    isFavorite: sessionData.isFavorite || false,
  };
};
