import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5125';

export type SecurityAlert = {
  id: string;
  timestamp: string; // ISO 8601
  cameraId: string;
  alertType: string;
  severity?: string;
  description?: string;
};

export async function getSecurityAlerts(): Promise<SecurityAlert[]> {
  const token = authService.getToken();
  if (!token) throw new Error('Authentication required.');
  const res = await fetch(`${API_BASE_URL}/api/sensors/security`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch security alerts.');
  const raw = await res.json();
  const list = Array.isArray(raw?.alerts) ? raw.alerts : Array.isArray(raw) ? raw : [];
  return list as SecurityAlert[];
}
