// src/lib/api.ts
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface UserSession {
  id: string;
  username: string;
  gameName: string;
  tagLine: string;
  region: string;
  balance?: {
    valorantPoints: number;
    radianitePoints: number;
    kingdomCredits: number;
  };
  accountXP?: {
    level: number;
    xp: number;
  };
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('valorant_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('valorant_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('valorant_token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok && response.status === 401) {
        this.clearToken();
        window.location.href = '/auth/login';
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Auth Methods
  async generateAuthUrl(): Promise<ApiResponse<{ authUrl: string }>> {
    return this.request('/auth/generate-url');
  }

  async processCallback(callbackUrl: string): Promise<ApiResponse<{ token: string; user: UserSession }>> {
    return this.request('/auth/callback', {
      method: 'POST',
      body: JSON.stringify({ callbackUrl }),
    });
  }

  async getProfile(): Promise<ApiResponse<UserSession>> {
    return this.request('/auth/profile');
  }

  async refreshData(): Promise<ApiResponse<any>> {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  async getAllSessions(): Promise<ApiResponse<{ sessions: Record<string, any>; count: number }>> {
    return this.request('/auth/sessions');
  }

  async switchAccount(targetUserId: string): Promise<ApiResponse<{ token: string; user: UserSession }>> {
    return this.request('/auth/switch', {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  }

  async logout(): Promise<ApiResponse<any>> {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Store Methods
  async getDailyStore(): Promise<ApiResponse<any>> {
    return this.request('/store/daily');
  }

  async getStoreHistory(days: number = 7): Promise<ApiResponse<any>> {
    return this.request(`/store/history?days=${days}`);
  }

  // Game Data Methods
  async getSkins(): Promise<ApiResponse<any>> {
    return this.request('/game-data/skins');
  }

  async getBundles(): Promise<ApiResponse<any>> {
    return this.request('/game-data/bundles');
  }

  async getGameDataHealth(): Promise<ApiResponse<any>> {
    return this.request('/game-data/health');
  }
}

export const apiService = new ApiService();
export type { ApiResponse, UserSession };