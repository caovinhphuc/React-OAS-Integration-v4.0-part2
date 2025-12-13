import React, { createContext, useContext, ReactNode } from 'react';
import { useSecurity } from '@/hooks/useSecurity';

interface SecurityContextType {
  isAuthenticated: boolean;
  sessionInfo: {
    userId: string | null;
    email: string | null;
    lastActivity: number | null;
    deviceId: string | null;
  } | null;
  isSessionValid: boolean;
  initializeSession: (token: string, refreshToken: string) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  logout: (reason?: string) => void;
  checkSession: () => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(
  undefined
);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({
  children,
}) => {
  const security = useSecurity();

  return (
    <SecurityContext.Provider value={security}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurityContext = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error(
      'useSecurityContext must be used within a SecurityProvider'
    );
  }
  return context;
};
