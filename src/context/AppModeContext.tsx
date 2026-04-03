import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSettings, saveSettings, AppMode } from '../utils/storage';

interface AppModeContextType {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => Promise<void>;
}

const AppModeContext = createContext<AppModeContextType>({
  appMode: 'qrx',
  setAppMode: async () => {},
});

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [appMode, setAppModeState] = useState<AppMode>('qrx');

  useEffect(() => {
    getSettings().then(s => setAppModeState(s.appMode));
  }, []);

  const setAppMode = async (mode: AppMode) => {
    setAppModeState(mode);
    await saveSettings({ appMode: mode });
  };

  return (
    <AppModeContext.Provider value={{ appMode, setAppMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  return useContext(AppModeContext);
}
