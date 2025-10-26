'use client';

import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { WifiOff, Refresh, Home } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      // Try to go back to the previous page or home
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/');
      }
    } else {
      // Force a page reload to check connectivity
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <WifiOff
            sx={{
              fontSize: 80,
              color: isOnline ? 'success.main' : 'error.main',
              mb: 2,
            }}
          />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom>
          {isOnline ? 'Connection Restored!' : 'You\'re Offline'}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {isOnline
            ? 'Your internet connection has been restored. You can now continue using the app.'
            : 'It looks like you\'re not connected to the internet. Some features may not be available until you reconnect.'
          }
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRetry}
            color={isOnline ? 'success' : 'primary'}
            size="large"
          >
            {isOnline ? 'Continue' : 'Try Again'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={handleGoHome}
            size="large"
          >
            Go Home
          </Button>
        </Box>

        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Offline Features Available:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • View cached room information
            <br />
            • Access previously loaded content
            <br />
            • Browse your music library
            <br />
            • Review app settings
          </Typography>
        </Box>

        <Typography variant="caption" display="block" sx={{ mt: 3, opacity: 0.7 }}>
          Connection Status: {isOnline ? '🟢 Online' : '🔴 Offline'}
        </Typography>
      </Paper>
    </Container>
  );
}