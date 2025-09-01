import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { RootState } from '@/redux/store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { updateDeviceStatus } from '@/redux/slices/dashboardSlice';
import { toast } from 'sonner';
import { Sun } from 'lucide-react';
import { authService } from '@/services/authService';
import { controlService } from '@/services/controlService';
import type { Device as UiDevice } from '@/redux/slices/dashboardSlice';
export function LightControl({ device }: { device: UiDevice }) {
  const dispatch = useDispatch();

  // Stable inputs
  const deviceId = device?.id ?? null;
  const deviceName = device?.name ?? 'Light';
  const fallbackStatus = !!device?.status;

  // Local optimistic fallback so controlled Switch flips immediately
  const [localLight, setLocalLight] = useState<boolean | null>(null);

  // Store value (may be undefined if device not in Redux yet)
  const storeStatus = useSelector((s: RootState) => {
    if (!deviceId) return undefined;
    return s.dashboard.devices.find(dv => dv.id === deviceId)?.status;
  });

  // Effective value: prefer store, else local optimistic, else device fallback
  const isLightOn = (storeStatus ?? localLight ?? fallbackStatus) as boolean;

  const handleToggle = async (checked: boolean | 'indeterminate') => {
    if (!deviceId) {
      toast.error('Device not ready.');
      return;
    }
    const nextStatus = checked === true;
    const prev = isLightOn;

    // Optimistic: update local + Redux immediately
    setLocalLight(nextStatus);
    dispatch(updateDeviceStatus({ id: deviceId, type: 'light', status: nextStatus }));
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No auth');
      await controlService.toggleLight(deviceId, nextStatus);
      toast.success(`'${deviceName}' turned ${nextStatus ? 'on' : 'off'}.`);
      // Optional: clear local after success so store drives UI when it updates
      // setLocalLight(null);
    } catch {
      // Revert local + Redux precisely
      setLocalLight(prev);
      dispatch(updateDeviceStatus({ id: deviceId, type: 'light', status: prev }));
      toast.error('Failed to toggle light.');
    }
  };

  const iconClass = isLightOn
    ? 'text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]'
    : 'text-foreground/50';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className={iconClass} />
          {deviceName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <span>{isLightOn ? 'On' : 'Off'}</span>
        <Switch checked={isLightOn} onCheckedChange={handleToggle} />
      </CardContent>
    </Card>
  );
}
