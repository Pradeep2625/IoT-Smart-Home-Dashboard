import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { deviceService, Device, NewDevice } from '@/services/deviceService';

interface AddDeviceFormProps {
  onDeviceAdded: () => void;
  deviceToEdit: Device | null;
  setDeviceToEdit: (device: Device | null) => void;
}

export function AddDeviceForm({ onDeviceAdded, deviceToEdit, setDeviceToEdit }: AddDeviceFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (deviceToEdit) {
      setName(deviceToEdit.name);
      setType(deviceToEdit.type);
    } else {
      setName('');
      setType('');
    }
  }, [deviceToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) {
      toast.error('Name and Type are required.');
      return;
    }

    setIsLoading(true);
    try {
      if (deviceToEdit) {
        const updatedDevice = { ...deviceToEdit, name, type };
        await deviceService.updateDevice(updatedDevice);
        toast.success('Device updated successfully!');
      } else {
        const newDevice: NewDevice = { name, type };
        await deviceService.addDevice(newDevice);
        toast.success('Device added successfully!');
      }
      
      setName('');
      setType('');
      setDeviceToEdit(null);
      onDeviceAdded();
    } catch (error) {
      toast.error(`Failed to ${deviceToEdit ? 'update' : 'add'} device.`);
      console.error(`Failed to ${deviceToEdit ? 'update' : 'add'} device:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>{deviceToEdit ? 'Update Device' : 'Add New Device'}</CardTitle>
        <CardDescription>
          {deviceToEdit ? 'Edit the details of your device.' : 'Create a new device to add to your home.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-name">Device Name</Label>
            <Input id="device-name" placeholder="e.g., Living Room Light" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="device-type">Device Type</Label>
            <Input id="device-type" placeholder="e.g., light, thermostat, door" value={type} onChange={(e) => setType(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : deviceToEdit ? 'Update Device' : 'Add Device'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}