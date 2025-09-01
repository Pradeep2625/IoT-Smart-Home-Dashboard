import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Device {
  id: number;
  name: string;
  type: string;
  isOnline: boolean;
  isArmed?: boolean;
  locked?: boolean;
  status?: boolean | number;
  temperature?: number;
  value?: number;
}

export interface TemperatureData { time: string; value: number; }
export interface PowerData { time: string; value: number; }

export interface Alert {
  id: string;
  timestamp: string;
  message?: string;
  type?: string;
  camera_id?: string;
  alert_type?: string;
  description?: string;
  isAcknowledged?: boolean;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface DashboardState {
  currentMetrics: { temperature: number; humidity: number; };
  devices: Device[];
  temperatureHistory: TemperatureData[];
  powerUsage: PowerData[];
  alerts: Alert[];
  unreadCount: number;
  isConnected: boolean;
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: DashboardState = {
  currentMetrics: { temperature: 22, humidity: 45 },
  devices: [],
  temperatureHistory: [],
  powerUsage: [],
  alerts: [],
  unreadCount: 0,
  isConnected: false,
  user: null,
  isAuthenticated: false,
};

// Normalize inbound alerts into UI shape
function normalizeAlert(a: any): Alert {
  return {
    id: String(a.id ?? crypto.randomUUID()),
    timestamp: String(a.timestamp ?? new Date().toISOString()),
    message: a.message ?? a.description,
    type: a.type ?? a.alert_type,
    camera_id: a.cameraId ?? a.camera_id,
    alert_type: a.alertType ?? a.alert_type ?? a.type,
    description: a.description ?? a.message,
    isAcknowledged: Boolean(a.isAcknowledged ?? false),
  };
}

type UpdatePayload = {
  id: number;
  type: string;
  status?: boolean | number;
  temperature?: number;
  isArmed?: boolean;
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setInitialDeviceStates: (state, action: PayloadAction<Device[]>) => {
      state.devices = action.payload.map((d) => {
        const t = d.type?.toLowerCase?.() ?? '';
        const n: Device = { ...d };
        if (t === 'door') {
          if (typeof n.locked !== 'boolean' && typeof n.status === 'boolean') n.locked = !!n.status;
        }
        if (t === 'security' || t === 'camera' || t === 'securitycamera') {
          if (typeof n.isArmed !== 'boolean' && typeof n.status === 'boolean') n.isArmed = !!n.status;
        }
        if (t === 'thermostat') {
          if (typeof n.temperature !== 'number' && typeof n.value === 'number') n.temperature = Number(n.value);
        }
        return n;
      });
    },

    updateDeviceStatus: (state, action: PayloadAction<UpdatePayload>) => {
      const { id, type } = action.payload;
      const deviceToUpdate = state.devices.find((d) => d.id === id);
      if (!deviceToUpdate) return;
      const t = type.toLowerCase();
      if (t === 'light') {
        if (typeof action.payload.status === 'boolean') deviceToUpdate.status = action.payload.status;
      } else if (t === 'door') {
        if (typeof action.payload.status === 'boolean') deviceToUpdate.locked = action.payload.status;
      } else if (t === 'thermostat') {
        if (typeof action.payload.temperature === 'number') deviceToUpdate.temperature = action.payload.temperature;
      } else if (t === 'camera' || t === 'security' || t === 'securitycamera') {
        if (typeof action.payload.isArmed === 'boolean') deviceToUpdate.isArmed = action.payload.isArmed;
      }
    },

    updateCurrentMetrics: (state, action: PayloadAction<Partial<DashboardState['currentMetrics']>>) => {
      state.currentMetrics = { ...state.currentMetrics, ...action.payload };
    },
    updateTemperatureHistory: (state, action: PayloadAction<TemperatureData[]>) => {
      state.temperatureHistory = action.payload;
    },
    updatePowerUsage: (state, action: PayloadAction<PowerData[]>) => {
      state.powerUsage = action.payload;
    },

    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },

    setAlerts: (state, action: PayloadAction<any[]>) => {
      const normalized = action.payload.map(normalizeAlert);
      state.alerts = normalized;
      state.unreadCount = normalized.filter(a => !a.isAcknowledged).length;
    },

    addAlert: (state, action: PayloadAction<any>) => {
      const raw = action.payload ?? {};
      const id = String(raw.id ?? crypto.randomUUID());
      if (!state.alerts.find(x => x.id === id)) {
        const a = normalizeAlert({ ...raw, id, isAcknowledged: false });
        state.alerts.unshift(a);
        state.unreadCount += 1;
      }
    },

    // Acknowledge all (keep history)
    markAllRead: (state) => {
      state.alerts = state.alerts.map(a => ({ ...a, isAcknowledged: true }));
      state.unreadCount = 0;
    },

    // Remove one (adjust unread if needed)
    removeAlert: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const removed = state.alerts.find(a => a.id === id);
      state.alerts = state.alerts.filter(a => a.id !== id);
      if (removed && !removed.isAcknowledged && state.unreadCount > 0) state.unreadCount -= 1;
    },

    // Clear list entirely (erase)
    clearAlerts: (state) => {
      state.alerts = [];
      state.unreadCount = 0;
    },

    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },

    // Keep if you still append chart samples later
    pushTemperatureSample: (state, action: PayloadAction<{ time: string; value: number }>) => {
      state.temperatureHistory.push(action.payload);
      if (state.temperatureHistory.length > 120) state.temperatureHistory.shift();
    },
    pushPowerSample: (state, action: PayloadAction<{ time: string; value: number }>) => {
      state.powerUsage.push(action.payload);
      if (state.powerUsage.length > 120) state.powerUsage.shift();
    },
  },
});

export const {
  setInitialDeviceStates,
  updateDeviceStatus,
  updateCurrentMetrics,
  updateTemperatureHistory,
  updatePowerUsage,
  setConnectionStatus,
  setUser,
  clearUser,
  setAlerts,
  addAlert,
  markAllRead,
  removeAlert,
  clearAlerts,
  setAuthenticated,
  pushTemperatureSample,
  pushPowerSample,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
