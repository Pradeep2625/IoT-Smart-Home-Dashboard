import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, markAllRead, clearAlerts, removeAlert } from '@/redux/slices/dashboardSlice';
import { RootState } from '@/redux/store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Settings } from 'lucide-react';
import { WifiIndicator } from './WifiIndicator';
import { NotificationsBell } from '@/components/NotificationBell';

export const DashboardHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const user = useSelector((state: RootState) => state.dashboard.user);
  const { unreadCount, alerts } = useSelector((s: RootState) => s.dashboard);

  const handleLogout = () => {
    sessionStorage.removeItem('jwt_token');
    dispatch(clearUser());
    toast({ title: 'Logged out successfully!', description: 'You have been securely signed out.' });
    navigate('/login');
  };

  // Option 1: acknowledge (keep history but hide via filtering in Bell if desired)
  const onMarkAllReadAck = () => dispatch(markAllRead());

  // Option 2: erase items completely
  const onMarkAllReadClear = () => dispatch(clearAlerts());

  return (
    <div className="dashboard-header">
      <div className="flex items-center gap-3">
        <div className="text-2xl md:text-3xl font-extrabold glow-text">Smart Home Dashboard</div>
        <WifiIndicator />
      </div>
      <div className="flex items-center gap-4">
        <NotificationsBell
          unreadCount={unreadCount}
          alerts={alerts}                    // or alerts.filter(a => !a.isAcknowledged)
          onMarkAllRead={onMarkAllReadAck}   // swap to onMarkAllReadClear to erase
          onDismiss={(id) => dispatch(removeAlert(id))}
        />
        <div className="text-sm md:text-base opacity-90">{`Welcome ${user?.username ?? ''}`}</div>
        <Button variant="ghost" onClick={() => navigate('/devices')} className="flex items-center gap-2">
          <Settings size={18} />
          <span>Manage Devices</span>
        </Button>
        <Button variant="ghost" onClick={handleLogout}>Log Out</Button>
      </div>
    </div>
  );
};
