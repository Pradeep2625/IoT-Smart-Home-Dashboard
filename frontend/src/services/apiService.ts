const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5125';

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = sessionStorage.getItem('jwt_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const apiService = {
  async getDevices(): Promise<any[]> {
    return fetchWithAuth('/api/devices');
  },
  async getMetrics(deviceId: number): Promise<any> {
    return fetchWithAuth(`/api/sensors/metrics?deviceId=${deviceId}`);
  },
  async toggleLight(deviceId: number, status: boolean): Promise<any> {
    return fetchWithAuth(`/api/control/light?id=${deviceId}`, {
      method: 'POST',
      body: JSON.stringify(status),
    });
  },
  async setThermostat(deviceId: number, temperature: number): Promise<any> {
    return fetchWithAuth(`/api/control/thermostat?id=${deviceId}`, {
      method: 'POST',
      body: JSON.stringify(temperature),
    });
  },
  async toggleDoor(deviceId: number, locked: boolean): Promise<any> {
    return fetchWithAuth(`/api/control/door?id=${deviceId}`, {
      method: 'POST',
      body: JSON.stringify(locked),
    });
  },

  async toggleSecurityCamera(deviceId: number, isArmed: boolean): Promise<any> {
    return fetchWithAuth(`/api/control/armed?id=${deviceId}`, {
      method: 'POST',
      body: JSON.stringify(isArmed),
    });
  },

  // New
  async getSecurityHistory(deviceId: number): Promise<any[]> {
    return fetchWithAuth(`/api/sensors/security/history?deviceId=${deviceId}&take=20`);
  },

  async getLatestSecurity(deviceId: number): Promise<string> 
  {
    return fetchWithAuth(`/api/sensors/security?deviceId=${deviceId}`);
  },

  // Simulated history (keep for now if needed)
  async getTemperatureHistory(deviceId: number): Promise<{ time: string; value: number; }[]> {
    console.log(`Fetching temperature history for device ${deviceId}`);
    return [
      { time: '12:00', value: 20 },
      { time: '13:00', value: 21 },
      { time: '14:00', value: 22 },
      { time: '15:00', value: 23 },
      { time: '16:00', value: 22 },
      { time: '17:00', value: 21 },
    ];
  },
  async getPowerHistory(deviceId: number): Promise<{ time: string; value: number; }[]> {
    console.log(`Fetching power history for device ${deviceId}`);
    return [
      { time: '12:00', value: 150 },
      { time: '13:00', value: 160 },
      { time: '14:00', value: 180 },
      { time: '15:00', value: 170 },
      { time: '16:00', value: 190 },
      { time: '17:00', value: 200 },
    ];
  },
};
