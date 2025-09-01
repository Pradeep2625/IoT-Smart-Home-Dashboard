import React from 'react';
import { useSignalR } from '@/hooks/useSignalR';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WifiIndicator() {
  const { isConnected } = useSignalR();

  // Log the value of isConnected to see what the component is receiving
  console.log("WifiIndicator component rendering. isConnected is:", isConnected);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">
        SR
      </span>
      <div 
        className={cn(
          'p-2 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-red-500'
        )}
      >
        {isConnected ? (
          <Wifi className="h-5 w-5 text-white" />
        ) : (
          <WifiOff className="h-5 w-5 text-white" />
        )}
      </div>
    </div>
  );
}