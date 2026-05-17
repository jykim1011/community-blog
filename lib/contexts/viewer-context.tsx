'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface ViewerState {
  url: string;
  site: string;
  color: string;
}

interface ViewerContextValue {
  viewer: ViewerState | null;
  openViewer: (state: ViewerState) => void;
  closeViewer: () => void;
  preloadUrl: string | null;
  preloadViewer: (url: string) => void;
  cancelPreload: () => void;
}

const ViewerContext = createContext<ViewerContextValue | null>(null);

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [preloadUrl, setPreloadUrl] = useState<string | null>(null);

  const openViewer = useCallback((state: ViewerState) => {
    setPreloadUrl(null);
    setViewer(state);
  }, []);
  const closeViewer = useCallback(() => setViewer(null), []);
  const preloadViewer = useCallback((url: string) => setPreloadUrl(url), []);
  const cancelPreload = useCallback(() => setPreloadUrl(null), []);

  return (
    <ViewerContext.Provider value={{ viewer, openViewer, closeViewer, preloadUrl, preloadViewer, cancelPreload }}>
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer() {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error('useViewer must be used within ViewerProvider');
  return ctx;
}
