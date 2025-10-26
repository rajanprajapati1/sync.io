'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { Snackbar, Alert, Button } from '@mui/material';
import { Update, Refresh } from '@mui/icons-material';

const PWAContext = createContext({});

export function PWAProvider({ children }) {
  const pwa = usePWA();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (pwa.updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [pwa.updateAvailable]);

  const handleUpdate = () => {
    pwa.updateServiceWorker();
    setShowUpdatePrompt(false);
  };

  const handleDismissUpdate = () => {
    setShowUpdatePrompt(false);
  };

  return (
    <PWAContext.Provider value={pwa}>
      {children}
      
      {/* Update Available Notification */}
      <Snackbar
        open={showUpdatePrompt}
        onClose={handleDismissUpdate}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 2 }}
      >
        <Alert
          severity="info"
          icon={<Update />}
          action={
            <>
              <Button
                color="inherit"
                size="small"
                onClick={handleUpdate}
                startIcon={<Refresh />}
              >
                Update
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={handleDismissUpdate}
              >
                Later
              </Button>
            </>
          }
        >
          A new version is available! Update now for the latest features.
        </Alert>
      </Snackbar>
    </PWAContext.Provider>
  );
}

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within a PWAProvider');
  }
  return context;
}