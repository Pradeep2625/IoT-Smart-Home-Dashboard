import { useContext } from 'react';
import { SignalRContext } from '@/contexts/SignalRContext'; // Note the change in import path

export function useSignalR() {
  const context = useContext(SignalRContext);
  if (context === undefined) {
    throw new Error('useSignalR must be used within a SignalRProvider');
  }
  return context;
}