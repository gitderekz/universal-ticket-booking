import React, { createContext, useContext, useState, useCallback } from 'react';
import { SystemLog, mockSystemLogs } from '../data/mockData';

interface SystemLogsContextType {
  logs: SystemLog[];
  addLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

const SystemLogsContext = createContext<SystemLogsContextType | undefined>(undefined);

export const useSystemLogs = () => {
  const context = useContext(SystemLogsContext);
  if (!context) throw new Error('useSystemLogs must be used within SystemLogsProvider');
  return context;
};

export const SystemLogsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<SystemLog[]>([...mockSystemLogs].reverse());

  const addLog = useCallback((logData: Omit<SystemLog, 'id' | 'timestamp'>) => {
    const newLog: SystemLog = {
      ...logData,
      id: `log${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  return (
    <SystemLogsContext.Provider value={{ logs, addLog, clearLogs }}>
      {children}
    </SystemLogsContext.Provider>
  );
};
