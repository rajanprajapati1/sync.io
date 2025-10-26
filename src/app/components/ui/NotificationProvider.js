"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error,
  Warning,
  Info,
  Wifi,
  WifiOff,
  PersonAdd,
  PersonRemove,
  MeetingRoom,
  ExitToApp,
} from '@mui/icons-material';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      autoHideDuration: 6000,
      ...notification,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-remove notification after duration
    if (newNotification.autoHideDuration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.autoHideDuration);
    }
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: 'success',
      message,
      icon: <CheckCircle />,
      ...options,
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: 'error',
      message,
      icon: <Error />,
      autoHideDuration: 8000, // Longer duration for errors
      ...options,
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: 'warning',
      message,
      icon: <Warning />,
      ...options,
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: 'info',
      message,
      icon: <Info />,
      ...options,
    });
  }, [addNotification]);

  // Specialized methods for connection status
  const showConnectionStatus = useCallback((isConnected, options = {}) => {
    const message = isConnected ? 'Connected to server' : 'Connection lost';
    const icon = isConnected ? <Wifi /> : <WifiOff />;
    const type = isConnected ? 'success' : 'error';
    
    return addNotification({
      type,
      message,
      icon,
      autoHideDuration: isConnected ? 3000 : 0, // Keep disconnection notice until reconnected
      ...options,
    });
  }, [addNotification]);

  // Specialized methods for room events
  const showRoomEvent = useCallback((eventType, data = {}, options = {}) => {
    let message, icon, type = 'info';

    switch (eventType) {
      case 'room_created':
        message = `Room "${data.roomId}" created successfully`;
        icon = <MeetingRoom />;
        type = 'success';
        break;
      case 'room_joined':
        message = `Joined room "${data.roomId}" successfully`;
        icon = <PersonAdd />;
        type = 'success';
        break;
      case 'room_left':
        message = `Left room "${data.roomId}"`;
        icon = <ExitToApp />;
        type = 'info';
        break;
      case 'user_joined':
        message = `${data.userName} joined the room`;
        icon = <PersonAdd />;
        type = 'info';
        break;
      case 'user_left':
        message = `${data.userName} left the room`;
        icon = <PersonRemove />;
        type = 'info';
        break;
      case 'user_kicked':
        message = data.isCurrentUser 
          ? 'You were removed from the room'
          : `${data.userName} was removed from the room`;
        icon = <PersonRemove />;
        type = data.isCurrentUser ? 'error' : 'warning';
        break;
      case 'room_ended':
        message = 'Room has been ended by the creator';
        icon = <MeetingRoom />;
        type = 'warning';
        break;
      case 'room_full':
        message = 'Room is at maximum capacity';
        icon = <Warning />;
        type = 'warning';
        break;
      case 'room_not_found':
        message = 'Room not found or no longer exists';
        icon = <Error />;
        type = 'error';
        break;
      default:
        message = data.message || 'Room event occurred';
        icon = <Info />;
    }

    return addNotification({
      type,
      message,
      icon,
      ...options,
    });
  }, [addNotification]);

  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConnectionStatus,
    showRoomEvent,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Render notifications */}
      <Box
        sx={{
          position: 'fixed',
          top: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: (theme) => theme.zIndex.snackbar,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: { xs: 'calc(100vw - 32px)', sm: 400 },
        }}
      >
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </Box>
    </NotificationContext.Provider>
  );
};

const NotificationItem = ({ notification, onClose }) => {
  const { type, message, title, icon, action } = notification;

  return (
    <Alert
      severity={type}
      icon={icon}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {action}
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onClose}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      }
      sx={{
        width: '100%',
        boxShadow: (theme) => theme.shadows[6],
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      <Typography variant="body2">{message}</Typography>
    </Alert>
  );
};

export default NotificationProvider;