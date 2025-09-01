import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateDeviceStatus } from '@/redux/slices/dashboardSlice';
import { controlService } from '@/services/controlService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import type { Device as UiDevice } from '@/redux/slices/dashboardSlice';
export const ThermostatControl = ({ device }: { device: UiDevice }) => {
  const dispatch = useDispatch();

  // Stable values outside the selector to avoid prop deref inside selector/JSX
  const deviceId = device?.id ?? null;
  const deviceName = device?.name ?? 'Thermostat';
  const defaultTemp = typeof device?.temperature === 'number' ? device.temperature! : 22;

  // Defensive selector: never deref device here; always return a safe number
  const temperature = useSelector((s: RootState) => {
    if (!deviceId) return defaultTemp;
    const t = s.dashboard.devices.find(d => d.id === deviceId)?.temperature;
    return typeof t === 'number' ? t : defaultTemp;
  });

  const handleSetTemperature = async (newTemp: number) => {
    if (!deviceId) {
      toast.error('Device not ready.');
      return;
    }
    const prevTemp = temperature;

    // Optimistic update
    dispatch(updateDeviceStatus({ id: deviceId, type: 'thermostat', temperature: newTemp }));
    try {
      const token = authService.getToken();
      if (!token) throw new Error('No auth token found');
      await controlService.setThermostat(deviceId, newTemp);
      toast.success(`Thermostat set to ${newTemp}°C.`);
    } catch {
      // Precise revert on failure
      dispatch(updateDeviceStatus({ id: deviceId, type: 'thermostat', temperature: prevTemp }));
      toast.error('Failed to set thermostat.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="text-foreground" />
          {deviceName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-semibold">{temperature}°C</span>
            <span className="text-xs text-muted-foreground">Set your desired temperature.</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleSetTemperature(temperature - 1)}>-</Button>
            <Button size="sm" variant="outline" onClick={() => handleSetTemperature(temperature + 1)}>+</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
