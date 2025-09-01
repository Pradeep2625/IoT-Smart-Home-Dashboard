import { setUser, clearUser } from '@/redux/slices/dashboardSlice';
import { signalRService } from './signalRService'; // Fix 1: Import signalRService

const API_BASE_URL = 'http://localhost:5125';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

class AuthService {
  private token: string | null = null;

  constructor() {
    this.token = sessionStorage.getItem('jwt_token');
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.token);
    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data: AuthResponse = await response.json();
    this.setToken(data.token);
    return data;
  }

  setToken(token: string) {
    this.token = token;
    sessionStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  async logout(dispatch: (action: any) => void) { // Fix 2: Specify the dispatch type
    this.token = null;
    sessionStorage.removeItem('jwt_token');
    dispatch(clearUser());
    signalRService.stopConnection();
  }
}

export const authService = new AuthService();