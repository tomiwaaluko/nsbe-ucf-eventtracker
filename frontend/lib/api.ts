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

/** Session expiry event for handling 401 responses */
let sessionExpiredCallback: (() => void) | null = null;

export function onSessionExpired(callback: () => void) {
  sessionExpiredCallback = callback;
}

function handleResponse(response: Response): Promise<any> {
  if (response.status === 401) {
    // Session expired - trigger callback
    if (sessionExpiredCallback) {
      sessionExpiredCallback();
    }
    throw new Error("Session expired");
  }

  if (!response.ok) {
    return response.text().then((text) => {
      let errorMessage = response.statusText;
      try {
        const json = JSON.parse(text);
        errorMessage = json.message || errorMessage;
      } catch (e) {
        // Use text as-is if not JSON
        if (text) errorMessage = text;
      }
      throw new Error(errorMessage);
    });
  }

  return response.json();
}

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

export interface PointType {
  label: string;
  points: number;
  zone: 'general' | 'communication' | 'program' | 'parliamentarian';
  requiresLabel: boolean;
  autoSource: string | null;
}

export interface PointTypesMap {
  [key: string]: PointType;
}

export interface PointEntry {
  id: string;
  memberId: string;
  member: { firstName: string; lastName: string; email: string };
  pointTypeKey: string;
  points: number;
  semester: string;
  label: string | null;
  note: string | null;
  awardedById: string;
  awardedBy: { firstName: string; lastName: string };
  createdAt: string;
}

export interface LeaderboardEntry {
  memberId: string;
  name: string;
  totalPoints: number;
  general: number;
  communication: number;
  program: number;
  parliamentarian: number;
}

export interface BulkAwardResult {
  awarded: number;
  skipped: number;
  notFound: number;
}

export interface ResolvedMembersResult {
  resolved: Array<{ line: string; member: { id: string; name: string; email: string } }>;
  unresolved: string[];
}

/** JSON shape returned by GET /members/me/export (dates as ISO strings). */
export interface MemberExportEvent {
  id: string;
  name: string;
  description: string | null;
  category: string;
  semester: string;
  startTime: string;
  endTime: string;
  location: string | null;
  isActive: boolean;
}

export interface MemberExportPayload {
  exportedAt: string;
  profile: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
    emailVerified: boolean;
    isActive: boolean;
    bio: string | null;
    discordUsername: string | null;
    graduationYear: number | null;
    linkedInUrl: string | null;
    major: string | null;
    phoneNumber: string | null;
    photoUrl: string | null;
    hasPassword: boolean;
  };
  oauthAccounts: Array<{
    id: string;
    provider: string;
    providerEmail: string | null;
    emailVerified: boolean;
    createdAt: string;
  }>;
  attendance: Array<{
    id: string;
    checkedInAt: string;
    checkInMethod: string;
    event: MemberExportEvent;
  }>;
  eventInterests: Array<{
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    event: MemberExportEvent;
  }>;
  achievements: {
    oneOneOne: {
      completed: boolean;
      completedAt?: string;
      progress: { bucket1: number; bucket2: number; bucket3: number };
    };
    threeThreeThree: {
      completed: boolean;
      completedAt?: string;
      progress: { bucket1: number; bucket2: number; bucket3: number };
    };
  };
  achievementsBySemester: Array<{
    semester: string;
    workshopsSocials: number;
    fundraiserCommunityService: number;
    gbm: number;
    has111: boolean;
    has333: boolean;
    completed111At?: string;
    completed333At?: string;
  }>;
  points: {
    bySemester: Array<{
      semester: string;
      totalPoints: number;
      zones: {
        general: number;
        communication: number;
        program: number;
        parliamentarian: number;
      };
      manualEntries: Array<{
        id: string;
        pointTypeKey: string;
        points: number;
        semester: string;
        label: string | null;
        note: string | null;
        createdAt: string;
        awardedByName?: string;
      }>;
      autoEntries: Array<{
        pointTypeKey: string;
        label: string;
        points: number;
        zone: string;
        eventId: string;
        eventName: string;
        eventStartTime: string;
      }>;
    }>;
  };
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

  checkDuplicateUser: async (data: { firstName: string; lastName: string; email: string }) => {
    const response = await fetch(`${API_URL}/auth/check-duplicate`, {
      method: "POST",
      headers: apiHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    return response.json();
  },

  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: apiHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to send password reset email");
    }
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
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
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

  getMyOAuthAccounts: async (token: string) => {
    const response = await fetch(`${API_URL}/members/me/oauth-accounts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch OAuth accounts");
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
    return handleResponse(response);
  },

  getEvent: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/events/${id}`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
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
      headers: apiHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }),
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
          headers: apiHeaders({ Authorization: `Bearer ${token}` }),
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

  checkInWithCode: async (token: string, code: string) => {
    const url = `${API_URL}/attendance/check-in-code`;

    const response = await fetch(url, {
      method: "POST",
      headers: apiHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify({ code: code.toUpperCase() }),
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
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
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
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
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
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return response.json();
  },

  getAdminStats: async (token: string) => {
    const response = await fetch(`${API_URL}/stats/admin`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return response.json();
  },

  // Global Leaderboard
  getGlobalLeaderboard: async (
    token: string,
    semester?: string,
    limit?: number,
  ) => {
    const params = new URLSearchParams();
    if (semester) params.append('semester', semester);
    if (limit) params.append('limit', limit.toString());
    const url = `${API_URL}/stats/leaderboard${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getMyLeaderboardPosition: async (token: string, semester?: string) => {
    const url = semester
      ? `${API_URL}/stats/leaderboard/me?semester=${encodeURIComponent(semester)}`
      : `${API_URL}/stats/leaderboard/me`;
    const response = await fetch(url, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getTopMembers: async (token: string, limit: number = 10, semester?: string) => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (semester) params.append('semester', semester);
    const url = `${API_URL}/stats/leaderboard/top?${params.toString()}`;
    const response = await fetch(url, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getLeaderboardStats: async (token: string, semester?: string) => {
    const url = semester
      ? `${API_URL}/stats/leaderboard/stats?semester=${encodeURIComponent(semester)}`
      : `${API_URL}/stats/leaderboard/stats`;
    const response = await fetch(url, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  // Friends
  getFriends: async (token: string) => {
    const response = await fetch(`${API_URL}/friends`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getFriendRequestsReceived: async (token: string) => {
    const response = await fetch(`${API_URL}/friends/requests/received`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getFriendRequestsSent: async (token: string) => {
    const response = await fetch(`${API_URL}/friends/requests/sent`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getMemberDirectory: async (token: string, search?: string) => {
    const url = search
      ? `${API_URL}/friends/directory?search=${encodeURIComponent(search)}`
      : `${API_URL}/friends/directory`;
    const response = await fetch(url, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch member directory');
    }
    return response.json();
  },

  getFriendshipStatus: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/friends/status/${userId}`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch friendship status');
    }
    return response.json();
  },

  sendFriendRequest: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/friends/request/${userId}`, {
      method: 'POST',
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  acceptFriendRequest: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/friends/accept/${userId}`, {
      method: 'POST',
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  declineFriendRequest: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/friends/decline/${userId}`, {
      method: 'DELETE',
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  cancelFriendRequest: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/friends/cancel/${userId}`, {
      method: 'DELETE',
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  unfriend: async (token: string, userId: string) => {
    const response = await fetch(`${API_URL}/friends/${userId}`, {
      method: 'DELETE',
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  // Event Interest (Plan to Attend)
  markPlanToAttend: async (token: string, eventId: string) => {
    const response = await fetch(`${API_URL}/event-interest/${eventId}`, {
      method: 'POST',
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  unmarkPlanToAttend: async (token: string, eventId: string) => {
    const response = await fetch(`${API_URL}/event-interest/${eventId}`, {
      method: 'DELETE',
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getMyPlannedEvents: async (token: string) => {
    const response = await fetch(`${API_URL}/event-interest/my`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getEventPlanners: async (token: string, eventId: string) => {
    const response = await fetch(`${API_URL}/event-interest/event/${eventId}`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch event planners');
    }
    return response.json();
  },

  checkIfPlanning: async (token: string, eventId: string) => {
    const response = await fetch(`${API_URL}/event-interest/check/${eventId}`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to check planning status');
    }
    return response.json();
  },

  // Points
  getPointTypes: async (token: string): Promise<PointTypesMap> => {
    const response = await fetch(`${API_URL}/points/types`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getPointsSemesters: async (token: string): Promise<string[]> => {
    const response = await fetch(`${API_URL}/points/semesters`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getPointsLeaderboard: async (token: string, semester: string): Promise<LeaderboardEntry[]> => {
    const response = await fetch(`${API_URL}/points/leaderboard?semester=${encodeURIComponent(semester)}`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getMemberPoints: async (token: string, memberId: string, semester: string): Promise<any> => {
    const response = await fetch(`${API_URL}/points/member/${memberId}?semester=${encodeURIComponent(semester)}`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  getManualPointEntries: async (token: string, semester: string): Promise<PointEntry[]> => {
    const response = await fetch(`${API_URL}/points/manual?semester=${encodeURIComponent(semester)}`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  bulkAwardPoints: async (
    token: string,
    payload: {
      memberIds: string[];
      pointTypeKey: string;
      semester: string;
      label?: string;
      note?: string;
    }
  ): Promise<BulkAwardResult> => {
    const response = await fetch(`${API_URL}/points/bulk`, {
      method: 'POST',
      headers: apiHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },

  resolveMembers: async (token: string, lines: string[]): Promise<ResolvedMembersResult> => {
    const response = await fetch(`${API_URL}/points/resolve-members`, {
      method: 'POST',
      headers: apiHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify({ lines }),
    });
    return handleResponse(response);
  },

  deletePointEntry: async (token: string, entryId: string): Promise<void> => {
    const response = await fetch(`${API_URL}/points/manual/${entryId}`, {
      method: 'DELETE',
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    return handleResponse(response);
  },

  updateMemberMembership: async (token: string, memberId: string, chapterMembershipActive: boolean) => {
    const response = await fetch(`${API_URL}/members/${memberId}/membership`, {
      method: 'PUT',
      headers: apiHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
      body: JSON.stringify({ chapterMembershipActive }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Failed to update chapter membership: ${response.statusText}`);
    }
    return response.json();
  },

  exportMyData: async (token: string): Promise<MemberExportPayload> => {
    const response = await fetch(`${API_URL}/members/me/export`, {
      headers: apiHeaders({ Authorization: `Bearer ${token}` }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to export data');
    }
    return response.json();
  },
};
