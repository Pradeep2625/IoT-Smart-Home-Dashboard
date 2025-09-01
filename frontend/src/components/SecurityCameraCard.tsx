import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { RootState } from '@/redux/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { Camera, ShieldCheck, ShieldOff } from 'lucide-react';
import { authService } from '@/services/authService';
import { controlService } from '@/services/controlService';
import { updateDeviceStatus } from '@/redux/slices/dashboardSlice';
import type { Device as UiDevice } from '@/redux/slices/dashboardSlice';

interface SecurityCameraCardProps {
  device: UiDevice;
  unreadAlerts: number;
}

export function SecurityCameraCard({ device, unreadAlerts }: SecurityCameraCardProps) {
  const dispatch = useDispatch();

  const deviceId = device?.id ?? null;
  const deviceName = device?.name ?? 'Security Camera';
  const fallbackArmed =
    typeof device?.isArmed === 'boolean' ? device.isArmed! : !!device?.status;
  const baseOnline = device?.isOnline ?? false;

  const [localArmed, setLocalArmed] = useState<boolean | null>(null);

  const storeArmed = useSelector((s: RootState) => {
    if (!deviceId) return undefined;
    return s.dashboard.devices.find(d => d.id === deviceId)?.isArmed;
  });

  const isArmed = (storeArmed ?? localArmed ?? fallbackArmed) as boolean;
  const isOnlineEffective = baseOnline || isArmed;

  const handleToggle = async (checked: boolean | 'indeterminate') => {
    if (!deviceId) {
      toast.error('Device not ready.');
      return;
    }
    const nextArmedStatus = checked === true;
    const prev = isArmed;

    setLocalArmed(nextArmedStatus);
    dispatch(updateDeviceStatus({ id: deviceId, type: 'security', isArmed: nextArmedStatus }));
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No auth');
      await controlService.toggleSecurityCamera(deviceId, nextArmedStatus);
      toast.success(`Security system ${nextArmedStatus ? 'armed' : 'disarmed'}.`);
    } catch {
      setLocalArmed(prev);
      dispatch(updateDeviceStatus({ id: deviceId, type: 'security', isArmed: prev }));
      toast.error('Failed to update security status.');
    }
  };

  return (
    <Card className="control-card h-full overflow-hidden">
      <CardHeader className="flex items-center justify-between gap-3">
        {/* Left: icon + name; allow shrink + ellipsis */}
        <div className="flex items-center gap-2 min-w-0">
          <Camera className={isOnlineEffective ? 'text-primary' : 'text-muted-foreground'} />
          <CardTitle className="glow-text truncate">{deviceName}</CardTitle>
        </div>

        {/* Right: online badge */}
        <div className={`text-sm font-semibold ${isOnlineEffective ? 'text-green-500' : 'text-red-500'}`}>
          {isOnlineEffective ? 'Online' : 'Offline'}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {/* Row: status + switch; min-w-0 allows shrink, truncate prevents overflow */}
        <div className="flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 text-xl min-w-0">
            {isArmed ? <ShieldCheck className="text-green-500 shrink-0" /> : <ShieldOff className="text-red-500 shrink-0" />}
            <span className="truncate">{isArmed ? 'System Armed' : 'System Disarmed'}</span>
          </div>
          <div className="shrink-0">
            <Switch checked={isArmed} onCheckedChange={handleToggle} />
          </div>
        </div>

        {/* Alerts line stays inside; it will wrap if needed */}
        <div className="text-sm">
          {unreadAlerts > 0 ? (
            <span className="text-red-500 font-bold">{unreadAlerts} new alert(s)</span>
          ) : (
            <span className="text-muted-foreground">No new alerts</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
