'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  GetApp,
  Close,
  PhoneIphone,
  Computer,
  CheckCircle,
} from '@mui/icons-material';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [installationSupported, setInstallationSupported] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      // Check for standalone mode (iOS Safari)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Check for PWA installation (Android Chrome)
      const isPWA = window.navigator.standalone === true || isStandalone;
      
      setIsInstalled(isPWA);
    };

    checkIfInstalled();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA install prompt available');
      
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      setInstallationSupported(true);
      
      // Show our custom install prompt after a delay
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallDialog(true);
        }
      }, 3000); // Show after 3 seconds of app usage
    };

    // Listen for successful app installation
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallDialog(false);
      setShowSuccessMessage(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support the install prompt
      handleManualInstall();
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        setShowSuccessMessage(true);
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setShowInstallDialog(false);
      
    } catch (error) {
      console.error('Error during PWA installation:', error);
      handleManualInstall();
    }
  };

  const handleManualInstall = () => {
    // Show manual installation instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
      instructions = 'Tap the Share button in Safari, then select "Add to Home Screen"';
    } else if (isAndroid) {
      instructions = 'Tap the menu button in your browser and select "Add to Home Screen" or "Install App"';
    } else {
      instructions = 'Look for the install button in your browser\'s address bar or menu';
    }
    
    alert(`To install this app:\n\n${instructions}`);
    setShowInstallDialog(false);
  };

  const handleDismiss = () => {
    setShowInstallDialog(false);
    
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('installPromptDismissed', 'true');
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessMessage(false);
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || (typeof window !== 'undefined' && sessionStorage.getItem('installPromptDismissed'))) {
    return null;
  }

  const getDeviceIcon = () => {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return isMobile ? <PhoneIphone /> : <Computer />;
  };

  return (
    <>
      {/* Install Dialog */}
      <Dialog
        open={showInstallDialog}
        onClose={handleDismiss}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GetApp />
              <Typography variant="h6">Install Sync Music Player</Typography>
            </Box>
            <IconButton onClick={handleDismiss} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ mb: 2, fontSize: 48 }}>
              {getDeviceIcon()}
            </Box>
            
            <Typography variant="body1" sx={{ mb: 2 }}>
              Install our app for the best experience! Get:
            </Typography>
            
            <Box sx={{ textAlign: 'left', mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                ✨ Faster loading and better performance
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                📱 Native app-like experience
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🔄 Offline functionality for cached content
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                🎵 Quick access from your home screen
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleDismiss}
            sx={{ color: 'white', borderColor: 'white' }}
            variant="outlined"
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleInstallClick}
            variant="contained"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
            startIcon={<GetApp />}
          >
            Install App
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={showSuccessMessage}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSuccess}
          severity="success"
          icon={<CheckCircle />}
          sx={{ width: '100%' }}
        >
          App installed successfully! You can now access it from your home screen.
        </Alert>
      </Snackbar>
    </>
  );
}