import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { signalRService } from '@/services/signalRService';

interface SignalRContextType {
  isConnected: boolean;
}

export const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

interface SignalRProviderProps {
  children: ReactNode;
}

export function SignalRProvider({ children }: SignalRProviderProps) {
  const [isConnected, setIsConnected] = useState(signalRService.isConnected);
  
  useEffect(() => {
    const unsubscribe = signalRService.subscribeToStatus(status => {
      setIsConnected(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <SignalRContext.Provider value={{ isConnected }}>
      {children}
    </SignalRContext.Provider>
  );
}