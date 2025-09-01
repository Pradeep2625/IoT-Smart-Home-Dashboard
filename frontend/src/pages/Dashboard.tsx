import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { DashboardHeader } from '@/components/DashboardHeader';
import { CurrentMetrics } from '@/components/CurrentMetrics';
import { LightControl } from '@/components/LightControl';
import { ThermostatControl } from '@/components/ThermostatControl';
import { DoorControl } from '@/components/DoorControl';
import { signalRService } from '@/services/signalRService';
import { deviceService } from '@/services/deviceService';
import { SecurityCameraCard } from '@/components/SecurityCameraCard';
import { setInitialDeviceStates } from '@/redux/slices/dashboardSlice';

const Dashboard = () => {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((s: RootState) => s.dashboard.isAuthenticated);
  const devices = useSelector((s: RootState) => s.dashboard.devices);
  const alerts = useSelector((s: RootState) => s.dashboard.alerts);

  useEffect(() => {
  if (!isAuthenticated) return;

  let cancelled = false;

  const run = async () => {
    try {
      await signalRService.startConnection(); // await so UI isn’t racing the hub [1]
      const list = await deviceService.getDevices();
      if (!cancelled) dispatch(setInitialDeviceStates(list));
    } catch (e) {
      console.error('Dashboard init failed:', e);
      if (!cancelled) dispatch(setInitialDeviceStates([]));
    }
  };

  run();

  return () => {
    cancelled = true;
    // If no global provider manages the hub, keep this; otherwise remove to avoid closing the shared hub.
    signalRService.stopConnection();
  };
}, [isAuthenticated, dispatch]);


  const thermostat = devices.find(d => d.type.toLowerCase().includes('thermostat'));
  const lightDevices = devices.filter(d => d.type.toLowerCase().includes('light'));
  const doorDevices = devices.filter(d => d.type.toLowerCase().includes('door'));
  const cameraDevices = devices.filter(d => {
    const t = d.type.toLowerCase();
    return t.includes('security') || t.includes('camera');
  });

  const unreadAlerts = alerts.filter(a => !a.isAcknowledged).length;

  return (
    <div>
      <DashboardHeader />
      <div className="mx-auto w-[80vw] max-w-screen-2xl px-4 lg:px-6"></div>
      <div className="dashboard-grid">
        <CurrentMetrics />
        {thermostat && <ThermostatControl device={thermostat} />}
        {lightDevices.map(d => <LightControl key={d.id} device={d} />)}
        {doorDevices.map(d => <DoorControl key={d.id} device={d} />)}
        {cameraDevices.map(d => (
          <SecurityCameraCard key={d.id} device={d} unreadAlerts={unreadAlerts} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
