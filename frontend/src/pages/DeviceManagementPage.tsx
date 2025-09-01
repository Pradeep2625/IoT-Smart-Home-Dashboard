import React, { useState, useEffect } from 'react';
import { deviceService, Device } from '@/services/deviceService';
import { toast } from 'sonner';
import { AddDeviceForm } from '@/components/AddDeviceForm';
import { DeviceList } from '@/components/DeviceList';
import { authService } from '@/services/authService';

export function DeviceManagementPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceToEdit, setDeviceToEdit] = useState<Device | null>(null);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const fetchedDevices = await deviceService.getDevices();
      setDevices(fetchedDevices);
    } catch (error) {
      toast.error('Failed to fetch devices.');
      console.error('Failed to fetch devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDeviceAdded = () => {
    fetchDevices();
  };
  
  const handleDelete = async (id: number) => {
    try {
      await deviceService.deleteDevice(id);
      toast.success('Device deleted successfully.');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to delete device.');
      console.error('Failed to delete device:', error);
    }
  };

  const handleEdit = (device: Device) => {
    setDeviceToEdit(device);
  };

  return (
    <div className="flex justify-center w-full px-4">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
        <div className="col-span-1">
          <AddDeviceForm 
            onDeviceAdded={handleDeviceAdded} 
            deviceToEdit={deviceToEdit} 
            setDeviceToEdit={setDeviceToEdit} 
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <DeviceList devices={devices} isLoading={isLoading} onDelete={handleDelete} onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
}