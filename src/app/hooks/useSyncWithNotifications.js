import { useEffect, useRef } from "react";
import { useSync } from "./useSync";
import { useNotification } from "@/app/components/ui/NotificationProvider";

/**
 * Enhanced sync hook that integrates with the notification system
 * Simplified version to prevent infinite loops
 */
export const useSyncWithNotifications = (roomId) => {
  const syncHook = useSync(roomId);
  const { showConnectionStatus, showError, showWarning } = useNotification();
  
  // Track previous states to detect meaningful changes only
  const prevConnectionState = useRef(null);
  const prevErrorState = useRef(null);
  const notificationShownRef = useRef(false);

  // Monitor connection status changes (less frequently)
  useEffect(() => {
    const { isConnected, connectionInterrupted } = syncHook.syncState;
    
    // Only show notifications on meaningful state changes
    if (prevConnectionState.current !== null) {
      // Connection status changed
      if (prevConnectionState.current.isConnected !== isConnected) {
        console.log("Connection status changed:", isConnected);
        if (!notificationShownRef.current) {
          showConnectionStatus(isConnected);
          notificationShownRef.current = true;
          // Reset flag after delay to allow future notifications
          setTimeout(() => {
            notificationShownRef.current = false;
          }, 5000);
        }
      }
      
      // Connection was interrupted
      if (!prevConnectionState.current.connectionInterrupted && connectionInterrupted) {
        console.log("Connection interrupted");
        showWarning("Connection interrupted. Attempting to reconnect...", {
          autoHideDuration: 5000,
        });
      }
    }
    
    prevConnectionState.current = { isConnected, connectionInterrupted };
  }, [syncHook.syncState.isConnected, syncHook.syncState.connectionInterrupted, showConnectionStatus, showWarning]);

  // Monitor sync errors (only show new errors)
  useEffect(() => {
    if (syncHook.error && syncHook.error !== prevErrorState.current) {
      console.log("Sync error:", syncHook.error);
      
      // Handle specific error types with appropriate notifications
      if (syncHook.error.includes('Room not found')) {
        showError("Room not found. Please check the room ID.");
      } else if (syncHook.error.includes('Connection error')) {
        showError("Connection error. Please check your internet connection.");
      } else {
        showError(syncHook.error);
      }
      
      prevErrorState.current = syncHook.error;
    } else if (!syncHook.error && prevErrorState.current) {
      // Error cleared
      prevErrorState.current = null;
    }
  }, [syncHook.error, showError]);

  return {
    ...syncHook,
    // Add any additional notification-specific functionality here if needed
  };
};