import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5125';

export type DeviceType = 'light' | 'door' | 'thermostat' | 'security';

export interface Device {
  id: number;
  name: string;
  type: DeviceType;
  userId: number;
  status: boolean;
  value?: number;
  isOnline: boolean;
  isArmed?: boolean;
  temperature?: number;
  locked?: boolean;
}

export interface NewDevice {
  name: string;
  type: string;
}

export const deviceService = {
  getDevices: async (): Promise<Device[]> => {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required.');
    const response = await fetch(`${API_BASE_URL}/api/devices`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch devices.');
    return await response.json();
  },

  addDevice: async (newDevice: NewDevice): Promise<Device> => {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required.');
    const response = await fetch(`${API_BASE_URL}/api/devices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(newDevice),
    });
    if (!response.ok) throw new Error('Failed to add device.');
    return await response.json();
  },

  updateDevice: async (device: Device): Promise<void> => {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required.');
    const response = await fetch(`${API_BASE_URL}/api/devices/${device.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(device),
    });
    if (!response.ok) throw new Error('Failed to update device.');
  },

  deleteDevice: async (id: number): Promise<void> => {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required.');
    const response = await fetch(`${API_BASE_URL}/api/devices/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete device.');
  },

  // ✅ New: toggle armed status
  toggleArmedStatus: async (id: number, isArmed: boolean): Promise<Device> => {
    const token = authService.getToken();
    if (!token) throw new Error('Authentication required.');
    const response = await fetch(`${API_BASE_URL}/api/devices/${id}/toggle-armed`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ isArmed }),
    });
    if (!response.ok) throw new Error('Failed to toggle armed status.');
    return await response.json();
  },
};
