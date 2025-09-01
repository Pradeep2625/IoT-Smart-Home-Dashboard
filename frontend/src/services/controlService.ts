import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5125';

// Helper function to handle requests
async function request(endpoint: string, body: unknown) {
  const token = authService.getToken();
  if (!token) throw new Error('Authentication required.');

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    // Send primitive JSON (boolean/number) directly when needed
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${endpoint}`);
  }

  // Return parsed JSON if available, otherwise void
  try {
    return await response.json();
  } catch {
    return;
  }
}

export const controlService = {
  // Send primitive boolean in body (not { status })
  toggleLight: (id: number, status: boolean) =>
    request(`/api/control/light?id=${id}`, status),

  // Send primitive number in body (not { temperature })
  setThermostat: (id: number, temperature: number) =>
    request(`/api/control/thermostat?id=${id}`, temperature),

  // Send primitive boolean in body (not { locked })
  toggleDoor: (id: number, locked: boolean) =>
    request(`/api/control/door?id=${id}`, locked),

  // Send primitive boolean in body (not { isArmed })
  toggleSecurityCamera: (id: number, isArmed: boolean) =>
    request(`/api/control/armed?id=${id}`, isArmed),
};
