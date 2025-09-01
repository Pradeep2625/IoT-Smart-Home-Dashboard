import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Device } from '@/services/deviceService';
import { Trash2, Edit } from 'lucide-react';

interface DeviceListProps {
  devices: Device[];
  isLoading: boolean;
  onDelete: (id: number) => void;
  onEdit: (device: Device) => void; // Add a new prop for editing
}

export function DeviceList({ devices, isLoading, onDelete, onEdit }: DeviceListProps) {
  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>My Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading devices...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>My Devices</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>{device.id}</TableCell>
                <TableCell>{device.name}</TableCell>
                <TableCell>{device.type}</TableCell>
                <TableCell>{device.status ? 'On' : 'Off'}</TableCell>
                <TableCell className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(device)}>
                    <Edit className="h-4 w-4 text-gray-400" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(device.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}