import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateDeviceStatus } from '@/redux/slices/dashboardSlice';
import type { Device as UiDevice } from '@/redux/slices/dashboardSlice';
import { controlService } from '@/services/controlService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { RootState } from '@/redux/store';
import { useState } from 'react';

export const DoorControl = ({ device }: { device: UiDevice }) => {
  const dispatch = useDispatch();

  const deviceId = device?.id ?? null;
  // Fallback covers legacy payloads that only provide status at hydrate
  const fallbackLocked =
    typeof device?.locked === 'boolean' ? device.locked! : !!device?.status;

  const [localLocked, setLocalLocked] = useState<boolean | null>(null);

  const storeLocked = useSelector((s: RootState) => {
    if (!deviceId) return undefined;
    return s.dashboard.devices.find(dv => dv.id === deviceId)?.locked;
  });

  const isLocked = (storeLocked ?? localLocked ?? fallbackLocked) as boolean;

  const handleToggle = async () => {
    if (!deviceId) {
      toast.error('Device not ready.');
      return;
    }
    const prev = isLocked;
    const nextStatus = !isLocked;

    setLocalLocked(nextStatus);
    dispatch(updateDeviceStatus({ id: deviceId, type: 'door', status: nextStatus }));
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No auth token found');
      await controlService.toggleDoor(deviceId, nextStatus);
      toast.success(`Door has been ${nextStatus ? 'locked' : 'unlocked'}.`);
    } catch (error) {
      setLocalLocked(prev);
      dispatch(updateDeviceStatus({ id: deviceId, type: 'door', status: prev }));
      console.error('Failed to toggle door lock:', error);
      toast.error('Failed to toggle door lock.');
    }
  };

  const iconClass = isLocked ? 'text-foreground' : 'text-red-500';
  const status = isLocked ? 'Locked' : 'Unlocked';
  const buttonText = isLocked ? 'Unlock' : 'Lock';

  return (
    <Card className="control-card h-full overflow-hidden">
      <CardHeader>
        <CardTitle className="truncate">{device.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          {isLocked ? <Lock className="text-foreground shrink-0" /> : <Unlock className="text-red-500 shrink-0" />}
          <div className="flex flex-col min-w-0">
            <span className="text-sm truncate">{status}</span>
            <span className="text-xs text-muted-foreground truncate">
              {isLocked ? 'Door is currently locked' : 'Door is currently unlocked'}
            </span>
          </div>
        </div>
        <Button onClick={handleToggle}>{buttonText}</Button>
      </CardContent>
    </Card>
  );
};
