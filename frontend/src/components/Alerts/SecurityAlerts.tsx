import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RootState } from '@/redux/store';
import { setAlerts } from '@/redux/slices/dashboardSlice';
import { getSecurityAlerts } from '@/services/sensorService';

export function SecurityAlerts() {
  const dispatch = useDispatch();
  const alerts = useSelector((s: RootState) => s.dashboard.alerts);

  useEffect(() => {
    // Initial load; realtime updates continue via SignalR handler
    (async () => {
      try {
        const list = await getSecurityAlerts();
        dispatch(setAlerts(list));
      } catch (e) {
        console.error('Failed to load alerts', e);
      }
    })();
  }, [dispatch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 && (
          <div className="text-sm text-muted-foreground">No alerts</div>
        )}
        {alerts.map(a => (
          <div key={a.id} className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="font-medium">{a.alert_type ?? a.type}</span>
              <span className="text-xs text-muted-foreground">
                {a.description ?? a.message}
              </span>
              <span className="text-xs text-muted-foreground">
                {a.timestamp}
              </span>
            </div>
            <div className="text-xs px-2 py-0.5 rounded bg-muted">
              {a.camera_id ?? 'N/A'} · {a.type}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
