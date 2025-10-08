import { useState, useEffect } from 'react';

interface OnlineStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export const useOnlineStatus = (): OnlineStatus => {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      const newStatus: OnlineStatus = {
        isOnline: navigator.onLine,
        isSlowConnection: false,
        connectionType: 'unknown',
        effectiveType: 'unknown',
        downlink: 0,
        rtt: 0
      };

      if (connection) {
        newStatus.connectionType = connection.type || 'unknown';
        newStatus.effectiveType = connection.effectiveType || 'unknown';
        newStatus.downlink = connection.downlink || 0;
        newStatus.rtt = connection.rtt || 0;
        
        // Determine if connection is slow
        newStatus.isSlowConnection = 
          connection.effectiveType === 'slow-2g' ||
          connection.effectiveType === '2g' ||
          (connection.downlink && connection.downlink < 0.5) ||
          (connection.rtt && connection.rtt > 2000);
      }

      setStatus(newStatus);
    };

    const handleOnline = () => {
      console.log('[OnlineStatus] Connection restored');
      updateOnlineStatus();
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('connection-restored'));
    };

    const handleOffline = () => {
      console.log('[OnlineStatus] Connection lost');
      updateOnlineStatus();
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('connection-lost'));
    };

    const handleConnectionChange = () => {
      console.log('[OnlineStatus] Connection changed');
      updateOnlineStatus();
    };

    // Initial status check
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes (if supported)
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    // Periodic connectivity check (every 30 seconds when online)
    const connectivityCheck = setInterval(() => {
      if (navigator.onLine) {
        // Ping a small resource to verify actual connectivity
        fetch('/manifest.json', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        })
        .then(() => {
          if (!status.isOnline) {
            handleOnline();
          }
        })
        .catch(() => {
          if (status.isOnline) {
            handleOffline();
          }
        });
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
      
      clearInterval(connectivityCheck);
    };
  }, [status.isOnline]);

  return status;
};