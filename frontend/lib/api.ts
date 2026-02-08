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

/** API key for backend requests (must match backend API_KEY). */
const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? "";

/** Headers including API key for backend requests. */
function apiHeaders(extra?: HeadersInit): HeadersInit {
  const headers: Record<string, string> = {};
  if (API_KEY) headers["X-API-Key"] = API_KEY;
  return { ...headers, ...(extra as Record<string, string>) };
}

/** Get the API base URL (includes /api). Use for constructing fetch URLs. */
export { getApiUrl };

/** Headers with API key - export for use in components that call fetch directly. */
export { apiHeaders };

/** OAuth redirect base: NEXT_PUBLIC_APP_URL when set, else window.location.origin. No hardcoded localhost. */
export function getOAuthRedirectBase(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
}

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: apiHeaders({ "Content-Type": "application/json" }),
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
      headers: apiHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Members
  getMe: async (token: string) => {
    const response = await fetch(`${API_URL}/members/me`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
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
      headers: apiHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteAccount: async (token: string) => {
    const response = await fetch(`${API_URL}/members/me`, {
      method: "DELETE",
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      let msg = "Failed to delete account";
      try {
        const err = JSON.parse(errorText);
        msg = err.message || msg;
      } catch {
        if (errorText) msg = errorText;
      }
      throw new Error(msg);
    }
    return response.json();
  },

  searchMembers: async (token: string, query: string) => {
    const response = await fetch(`${API_URL}/members?query=${query}`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return response.json();
  },

  getAllMembers: async (token: string) => {
    const response = await fetch(`${API_URL}/members`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return response.json();
  },

  getAdmins: async (token: string) => {
    const response = await fetch(`${API_URL}/members/admins`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch admins");
    }
    return response.json();
  },

  updateMemberRole: async (token: string, memberId: string, role: string) => {
    const response = await fetch(`${API_URL}/members/${memberId}/role`, {
      method: "PUT",
      headers: apiHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify({ role }),
    });
    return response.json();
  },

  updateMemberStatus: async (token: string, memberId: string, isActive: boolean) => {
    const response = await fetch(`${API_URL}/members/${memberId}/status`, {
      method: "PUT",
      headers: apiHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify({ isActive }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to update member status: ${response.statusText}`);
    }
    return response.json();
  },

  // Events
  getEvents: async (token: string, activeOnly = false) => {
    const url = new URL(`${API_URL}/events`);
    if (activeOnly) url.searchParams.set('activeOnly', 'true');
    const response = await fetch(url.toString(), {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return response.json();
  },

  getEvent: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return response.json();
  },

  createEvent: async (token: string, data: any) => {
    const response = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: apiHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }),
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
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return response.json();
  },

  getEventQR: async (
    token: string,
    id: string,
    format: "png" | "svg" | "dataurl" = "dataurl",
    size: number = 512
  ) => {
    const params = new URLSearchParams();
    params.set("format", format);
    params.set("size", size.toString());

    // Add timeout to prevent hanging (10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `${API_URL}/events/${id}/qr?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to fetch QR code: ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch {
          // If not JSON, use the text as error message
          if (errorText) {
            errorMessage = errorText;
          }
        }
        throw new Error(errorMessage);
      }

      if (format === "png" || format === "svg") {
        return response.blob();
      } else {
        return response.json();
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('QR code request timed out. Please try again.');
      }
      throw error;
    }
  },

  // Attendance
  checkIn: async (token: string, data: { eventId: string; token: string }) => {
    const url = `${API_URL}/attendance/check-in`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: apiHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText || response.statusText };
      }
      
      const errorMessage = errorData.message || `Failed to check in: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  },

  manualCheckIn: async (
    token: string,
    data: { eventId: string; memberId: string }
  ) => {
    const response = await fetch(`${API_URL}/attendance/manual`, {
      method: "POST",
      headers: apiHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }),
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
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return response.json();
  },

  getAllAttendance: async (token: string) => {
    const response = await fetch(`${API_URL}/attendance`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
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
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
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
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return response.json();
  },
};
