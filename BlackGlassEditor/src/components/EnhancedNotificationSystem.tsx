import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Bell, 
  BellOff, 
  Settings, 
  Volume2, 
  VolumeX, 
  Clock, 
  Zap,
  Download,
  Upload,
  Save,
  Trash2,
  Copy,
  Undo,
  Redo,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Filter,
  Palette,
  Type,
  Square,
  Circle,
  Image as ImageIcon,
  Star,
  Heart,
  Sparkles
} from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
  icon?: React.ComponentType<any>;
  timestamp: number;
  dismissible?: boolean;
}

interface EnhancedNotificationSystemProps {
  notifications: Notification[];
  onNotificationDismiss: (id: string) => void;
  onNotificationAction?: (id: string, action: string) => void;
  onClearAll?: () => void;
  onSettingsChange?: (settings: NotificationSettings) => void;
  className?: string;
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxNotifications: number;
  defaultDuration: number;
  showTimestamps: boolean;
  showIcons: boolean;
  animations: boolean;
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  position: 'top-right',
  maxNotifications: 5,
  defaultDuration: 5000,
  showTimestamps: true,
  showIcons: true,
  animations: true
};

export const EnhancedNotificationSystem: React.FC<EnhancedNotificationSystemProps> = ({
  notifications,
  onNotificationDismiss,
  onNotificationAction,
  onClearAll,
  onSettingsChange,
  className = ''
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const notificationRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Auto-dismiss notifications
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.persistent && notification.duration !== 0) {
        const duration = notification.duration || settings.defaultDuration;
        const timer = setTimeout(() => {
          onNotificationDismiss(notification.id);
        }, duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, settings.defaultDuration, onNotificationDismiss]);

  // Play notification sound
  const playNotificationSound = useCallback((type: Notification['type']) => {
    if (!settings.soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different notification types
    const frequencies = {
      success: 800,
      error: 400,
      warning: 600,
      info: 500,
      loading: 300
    };

    oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [settings.soundEnabled]);

  // Play sound when new notification arrives
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1];
      playNotificationSound(latestNotification.type);
    }
  }, [notifications, playNotificationSound]);

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'loading':
        return Zap;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'loading':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getNotificationIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'info':
        return 'text-blue-500';
      case 'loading':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const toggleNotificationExpansion = (notificationId: string) => {
    setExpandedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const handleSettingsChange = (newSettings: Partial<NotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    onSettingsChange?.(updatedSettings);
  };

  const getPositionClasses = () => {
    switch (settings.position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const visibleNotifications = notifications.slice(0, settings.maxNotifications);

  if (!settings.enabled || visibleNotifications.length === 0) {
    return null;
  }

  return (
    <>
      {/* Notification Container */}
      <div className={`fixed z-50 ${getPositionClasses()} space-y-2 ${className}`}>
        {visibleNotifications.map((notification) => {
          const Icon = getNotificationIcon(notification);
          const isExpanded = expandedNotifications.has(notification.id);
          
          return (
            <div
              key={notification.id}
              ref={(el) => {
                if (el) notificationRefs.current.set(notification.id, el);
              }}
              className={`max-w-sm w-full bg-white border rounded-lg shadow-lg transition-all duration-300 ${
                settings.animations ? 'animate-in slide-in-from-right' : ''
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  {settings.showIcons && (
                    <div className={`flex-shrink-0 ${getNotificationIconColor(notification.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">{notification.title}</h4>
                      <div className="flex items-center space-x-2">
                        {settings.showTimestamps && (
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        )}
                        {notification.dismissible !== false && (
                          <button
                            onClick={() => onNotificationDismiss(notification.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm mt-1">{notification.message}</p>
                    
                    {notification.action && (
                      <div className="mt-3">
                        <button
                          onClick={() => {
                            notification.action?.handler();
                            onNotificationAction?.(notification.id, 'action');
                          }}
                          className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          {notification.action.label}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notification Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Enable Notifications</label>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleSettingsChange({ enabled: e.target.checked })}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Sound Effects</label>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => handleSettingsChange({ soundEnabled: e.target.checked })}
                  className="rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Position</label>
                <select
                  value={settings.position}
                  onChange={(e) => handleSettingsChange({ position: e.target.value as any })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="bottom-center">Bottom Center</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Max Notifications: {settings.maxNotifications}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={settings.maxNotifications}
                  onChange={(e) => handleSettingsChange({ maxNotifications: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">
                  Default Duration: {settings.defaultDuration}ms
                </label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="1000"
                  value={settings.defaultDuration}
                  onChange={(e) => handleSettingsChange({ defaultDuration: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show Timestamps</label>
                <input
                  type="checkbox"
                  checked={settings.showTimestamps}
                  onChange={(e) => handleSettingsChange({ showTimestamps: e.target.checked })}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Show Icons</label>
                <input
                  type="checkbox"
                  checked={settings.showIcons}
                  onChange={(e) => handleSettingsChange({ showIcons: e.target.checked })}
                  className="rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Animations</label>
                <input
                  type="checkbox"
                  checked={settings.animations}
                  onChange={(e) => handleSettingsChange({ animations: e.target.checked })}
                  className="rounded"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <button
                onClick={onClearAll}
                className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        title="Notification Settings"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
    </>
  );
};

// Hook for easy notification management
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return newNotification.id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      icon: CheckCircle,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      icon: XCircle,
      persistent: true,
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      icon: AlertTriangle,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      icon: Info,
      ...options
    });
  }, [addNotification]);

  const showLoading = useCallback((title: string, message: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'loading',
      title,
      message,
      icon: Zap,
      persistent: true,
      ...options
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading
  };
};
