'use client';

import { useState, useEffect } from 'react';

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') return;

    // Check initial online status
    setIsOnline(navigator.onLine);

    // Check if app is installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isPWA = window.navigator.standalone === true || isStandalone;
      setIsInstalled(isPWA);
    };

    checkInstallStatus();

    // Register service worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          setSwRegistration(registration);
          console.log('Service Worker registered successfully:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New update available
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Listen for controlling service worker changes
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // Reload the page when new service worker takes control
            window.location.reload();
          });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    };

    registerServiceWorker();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for app installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const updateServiceWorker = () => {
    if (swRegistration && swRegistration.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('All caches cleared');
        return true;
      } catch (error) {
        console.error('Error clearing caches:', error);
        return false;
      }
    }
    return false;
  };

  const getInstallPrompt = () => {
    // This would be set by the beforeinstallprompt event
    return window.deferredPrompt || null;
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  };

  const showNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const defaultOptions = {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'sync-music-notification',
        ...options,
      };

      if (swRegistration) {
        // Use service worker to show notification
        swRegistration.showNotification(title, defaultOptions);
      } else {
        // Fallback to regular notification
        new Notification(title, defaultOptions);
      }
    }
  };

  return {
    isInstalled,
    isOnline,
    swRegistration,
    updateAvailable,
    updateServiceWorker,
    clearCache,
    getInstallPrompt,
    requestNotificationPermission,
    showNotification,
  };
}