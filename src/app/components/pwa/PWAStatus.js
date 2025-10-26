'use client';

import { Box, Chip, Tooltip } from '@mui/material';
import { 
  Wifi, 
  WifiOff, 
  GetApp, 
  CheckCircle, 
  CloudDone 
} from '@mui/icons-material';
import { usePWAContext } from './PWAProvider';

export default function PWAStatus() {
  const { isOnline, isInstalled } = usePWAContext();

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* Online/Offline Status */}
      <Tooltip title={isOnline ? 'Connected' : 'Offline'}>
        <Chip
          icon={isOnline ? <Wifi /> : <WifiOff />}
          label={isOnline ? 'Online' : 'Offline'}
          color={isOnline ? 'success' : 'error'}
          size="small"
          variant="outlined"
        />
      </Tooltip>

      {/* PWA Installation Status */}
      {isInstalled && (
        <Tooltip title="App is installed">
          <Chip
            icon={<CheckCircle />}
            label="Installed"
            color="primary"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}

      {/* Service Worker Status */}
      {isOnline && (
        <Tooltip title="Service Worker active">
          <Chip
            icon={<CloudDone />}
            label="PWA"
            color="info"
            size="small"
            variant="outlined"
          />
        </Tooltip>
      )}
    </Box>
  );
}