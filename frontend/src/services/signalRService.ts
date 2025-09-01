import * as signalR from '@microsoft/signalr';
import { authService } from './authService';
import { store } from '@/redux/store';
import { setConnectionStatus, addAlert } from '@/redux/slices/dashboardSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5125';
const HUB_URL = `${API_BASE_URL}/smartHomeHub`;

type AlertPayload = { id?: string; type?: string; message?: string; timestamp?: string };

class SignalRService {
  private conn: signalR.HubConnection | null = null;
  private starting: Promise<void> | null = null;
  private stopping: Promise<void> | null = null;
  private handlers = false;
  private subs: Array<(s: boolean) => void> = [];
  private online = false;

  private notify(s: boolean) {
    this.online = s;
    store.dispatch(setConnectionStatus(s));
    for (const cb of this.subs) { try { cb(s); } catch (e) { console.error('status cb', e); } }
  }

  // Backwards-compatible API used by SignalRContext.tsx
  public subscribeToStatus(cb: (s: boolean) => void) {
    this.subs.push(cb);
    cb(this.online);
    return () => { this.subs = this.subs.filter(x => x !== cb); };
  }

  private ensureBuilt() {
    if (this.conn) return;
    this.conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => authService.getToken() || '' }) // JWT → access_token [2]
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.conn.onreconnecting(() => this.notify(false));   // offline on reconnecting [1]
    this.conn.onreconnected(() => this.notify(true));     // online on reconnected [1]
    this.conn.onclose(() => this.notify(false));          // offline on close [1]
  }

  private registerHandlers() {
    if (!this.conn || this.handlers) return;
    this.conn.on('ReceiveAlert', (payload: AlertPayload | AlertPayload[]) => {
      const list = Array.isArray(payload) ? payload : [payload];
      list.forEach(a => store.dispatch(addAlert(a)));
    }); // keep only alerts since charts were removed [1]
    this.handlers = true;
  }

  async startConnection() {
    if (this.starting) return this.starting;
    if (!authService.getToken()) return; // must be logged in [2]
    this.ensureBuilt();
    if (this.stopping) await this.stopping;
    if (this.conn && this.conn.state !== signalR.HubConnectionState.Disconnected) return;

    this.registerHandlers(); // register before start [1]

    this.starting = (async () => {
      try {
        await this.conn!.start();
        this.notify(true);
      } catch (e) {
        console.error('SignalR start error', e);
        this.notify(false);
        throw e;
      } finally {
        this.starting = null;
      }
    })();
    return this.starting;
  }

  async stopConnection() {
    if (this.stopping) return this.stopping;
    if (this.starting) { try { await this.starting; } catch { /* ignore */ } }
    if (!this.conn || this.conn.state === signalR.HubConnectionState.Disconnected) { this.notify(false); return; }

    this.stopping = (async () => {
      try { await this.conn!.stop(); } catch (e) { console.error('SignalR stop error', e); }
      finally { this.notify(false); this.stopping = null; }
    })();
    return this.stopping;
  }
}

export const signalRService = new SignalRService();
