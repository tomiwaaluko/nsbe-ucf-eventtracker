// Determine API URL:
// 1. Use NEXT_PUBLIC_API_URL if explicitly set
// 2. Use relative path '/api' in production (Vercel)
// 3. Fall back to localhost for development
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In production on Vercel, use relative path
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // In development, use localhost backend
  return 'http://localhost:4000/api';
};

const API_URL = getApiUrl();

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  // OAuth
  getOAuthUrl: (provider: "google" | "discord", redirectUri?: string) => {
    const params = new URLSearchParams();
    if (redirectUri) {
      params.set("redirect_uri", redirectUri);
    }
    return `${API_URL}/auth/oauth/${provider}?${params.toString()}`;
  },

  linkOAuthAccount: async (
    token: string,
    data: { provider: "google" | "discord"; code: string; state: string }
  ) => {
    const response = await fetch(`${API_URL}/auth/oauth/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Members
  getMe: async (token: string) => {
    const response = await fetch(`${API_URL}/members/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("getMe API error:", response.status, errorText);
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }
    return response.json();
  },

  updateMe: async (
    token: string,
    data: { firstName?: string; lastName?: string }
  ) => {
    const response = await fetch(`${API_URL}/members/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  searchMembers: async (token: string, query: string) => {
    const response = await fetch(`${API_URL}/members?query=${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getAllMembers: async (token: string) => {
    const response = await fetch(`${API_URL}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  updateMemberRole: async (token: string, memberId: string, role: string) => {
    const response = await fetch(`${API_URL}/members/${memberId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    return response.json();
  },

  // Events
  getEvents: async (token: string) => {
    const response = await fetch(`${API_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getEvent: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  createEvent: async (token: string, data: any) => {
    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateEvent: async (token: string, id: string, data: any) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteEvent: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Attendance
  checkIn: async (token: string, data: { eventId: string; token: string }) => {
    const response = await fetch(`${API_URL}/attendance/check-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  manualCheckIn: async (
    token: string,
    data: { eventId: string; memberId: string }
  ) => {
    const response = await fetch(`${API_URL}/attendance/manual`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getMyAttendance: async (token: string) => {
    const response = await fetch(`${API_URL}/attendance/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getEventAttendance: async (token: string, eventId: string) => {
    const response = await fetch(`${API_URL}/attendance/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getAllAttendance: async (token: string) => {
    const response = await fetch(`${API_URL}/attendance`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  // Stats
  getMyStats: async (token: string) => {
    const response = await fetch(`${API_URL}/stats/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  get111Leaderboard: async (token: string) => {
    const response = await fetch(`${API_URL}/stats/leaderboard/111`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  get333Leaderboard: async (token: string) => {
    const response = await fetch(`${API_URL}/stats/leaderboard/333`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  getAdminStats: async (token: string) => {
    const response = await fetch(`${API_URL}/stats/admin`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },
};
