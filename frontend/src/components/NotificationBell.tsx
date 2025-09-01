import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell } from 'lucide-react';

type AlertItem = {
  id: string;
  timestamp: string;
  alert_type?: string;
  type?: string;
  description?: string;
  message?: string;
  isAcknowledged?: boolean;
};

type Props = {
  unreadCount: number;
  alerts: AlertItem[];
  onMarkAllRead: () => void;       // mark or clear, depending on wiring
  onDismiss: (id: string) => void; // remove single alert
};

export function NotificationsBell({ unreadCount, alerts, onMarkAllRead, onDismiss }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;         // click inside panel
      if (btnRef.current?.contains(t)) return;           // click on toggle
      setOpen(false);                                     // outside → close
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  const toggle = () => setOpen(o => !o);

  // If rendering only unread, filter here; otherwise pass full list
  const items = alerts;

  const panel = (
    <div
      ref={panelRef}
      className="fixed right-4 top-12 z- w-80 rounded-lg border border-border/30 bg-card shadow-lg p-2"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Alerts</span>
        <button className="text-xs text-primary hover:underline" onClick={onMarkAllRead}>
          Mark all read
        </button>
      </div>
      <div className="max-h-64 overflow-auto space-y-2">
        {items.length === 0 && <div className="text-xs text-muted-foreground p-2">No alerts</div>}
        {items.slice(0, 20).map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-2 p-2 rounded hover:bg-muted/20">
            <div className="min-w-0">
              <div className="text-xs font-medium truncate">{a.alert_type ?? a.type ?? 'Alert'}</div>
              <div className="text-[11px] text-muted-foreground truncate" title={a.description ?? a.message}>
                {a.description ?? a.message}
              </div>
              <div className="text-[10px] text-muted-foreground">{a.timestamp}</div>
            </div>
            <button
              className="text-[11px] text-destructive hover:underline shrink-0"
              onClick={() => onDismiss(a.id)}
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="relative p-2 rounded-md hover:bg-secondary transition-colors"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Notifications"
      >
        <Bell className="text-primary" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary text-[10px] font-bold text-background shadow">
            {unreadCount}
          </span>
        )}
      </button>
      {open && createPortal(panel, document.body)}
    </>
  );
}
