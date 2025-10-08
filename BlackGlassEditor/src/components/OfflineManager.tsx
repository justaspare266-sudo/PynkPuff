import React, { useState, useEffect } from 'react';
import { WifiOff, Download, HardDrive, RefreshCw, AlertCircle, CheckCircle, Clock, Wifi, Signal } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { sanitizeHtml, sanitizeForLog } from '../utils/security';

interface OfflineProject {
  id: string;
  name: string;
  data: any;
  lastModified: Date;
  size: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  thumbnail?: string;
}

interface OfflineAsset {
  id: string;
  name: string;
  type: 'image' | 'font' | 'template';
  url: string;
  localUrl?: string;
  size: number;
  cached: boolean;
  lastAccessed: Date;
}

interface OfflineManagerProps {
  onProjectSave: (project: OfflineProject) => void;
  onProjectLoad: (project: OfflineProject) => void;
  onStatusChange?: (status: { isOnline: boolean; isSlowConnection: boolean }) => void;
}

export const OfflineManager: React.FC<OfflineManagerProps> = ({
  onProjectSave,
  onProjectLoad,
  onStatusChange
}) => {
  const { isOnline, isSlowConnection, connectionType, effectiveType, downlink, rtt } = useOnlineStatus();
  const [offlineProjects, setOfflineProjects] = useState<OfflineProject[]>([]);
  const [cachedAssets, setCachedAssets] = useState<OfflineAsset[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageQuota, setStorageQuota] = useState(0);
  const [showOfflineDialog, setShowOfflineDialog] = useState(false);
  const [syncQueue, setSyncQueue] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize offline storage
  useEffect(() => {
    initializeOfflineStorage();
  }, []);

  // Monitor storage usage
  useEffect(() => {
    updateStorageInfo();
  }, [offlineProjects, cachedAssets]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0) {
      processSyncQueue();
    }
  }, [isOnline, syncQueue]);

  // Notify parent component of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({ isOnline, isSlowConnection });
    }
  }, [isOnline, isSlowConnection, onStatusChange]);

  // Listen for connection events
  useEffect(() => {
    const handleConnectionRestored = () => {
      console.log('[OfflineManager] Connection restored - triggering sync');
      if (syncQueue.length > 0) {
        processSyncQueue();
      }
    };

    const handleConnectionLost = () => {
      console.log('[OfflineManager] Connection lost - enabling offline mode');
    };

    window.addEventListener('connection-restored', handleConnectionRestored);
    window.addEventListener('connection-lost', handleConnectionLost);

    return () => {
      window.removeEventListener('connection-restored', handleConnectionRestored);
      window.removeEventListener('connection-lost', handleConnectionLost);
    };
  }, [syncQueue]);

  const initializeOfflineStorage = async () => {
    try {
      // Check browser capabilities
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasIndexedDB = 'indexedDB' in window;
      const hasLocalStorage = 'localStorage' in window;
      
      if (!hasIndexedDB && !hasLocalStorage) {
        console.warn('No storage mechanisms available - offline functionality disabled');
        setIsInitialized(true);
        return;
      }

      // Register service worker with comprehensive error handling
      if (hasServiceWorker) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });
          
          console.log('[OfflineManager] Service worker registered successfully:', registration.scope);
          
          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[OfflineManager] New service worker available');
                  // Could show update notification here
                }
              });
            }
          });
          
          // Handle service worker messages
          navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
          
        } catch (error) {
          console.warn('[OfflineManager] Service worker registration failed:', error.message);
          // Continue initialization without service worker
          // The app will still work with localStorage-based offline functionality
        }
      } else {
        console.info('[OfflineManager] Service workers not supported - using localStorage only');
      }

      // Initialize storage systems
      await Promise.all([
        loadOfflineProjects(),
        loadCachedAssets(),
        initializeIndexedDB()
      ]);
      
      setIsInitialized(true);
      console.log('[OfflineManager] Offline storage initialized successfully');
      
    } catch (error) {
      console.error('[OfflineManager] Failed to initialize offline storage:', error);
      // Still mark as initialized to prevent blocking the app
      setIsInitialized(true);
    }
  };

  const loadOfflineProjects = async () => {
    try {
      // Try IndexedDB first, fallback to localStorage
      let projects: OfflineProject[] = [];
      
      if ('indexedDB' in window) {
        projects = await loadProjectsFromIndexedDB();
      }
      
      // Fallback to localStorage if IndexedDB fails or is empty
      if (projects.length === 0) {
        const stored = localStorage.getItem('offline-projects');
        if (stored) {
          projects = JSON.parse(stored).map((p: any) => ({
            ...p,
            lastModified: new Date(p.lastModified)
          }));
        }
      }
      
      setOfflineProjects(projects);
      console.log(`[OfflineManager] Loaded ${projects.length} offline projects`);
      
    } catch (error) {
      console.error('[OfflineManager] Failed to load offline projects:', sanitizeForLog(error instanceof Error ? error.message : String(error)));
      // Initialize with empty array to prevent app crashes
      setOfflineProjects([]);
    }
  };

  const loadCachedAssets = async () => {
    try {
      // Try IndexedDB first, fallback to localStorage
      let assets: OfflineAsset[] = [];
      
      if ('indexedDB' in window) {
        assets = await loadAssetsFromIndexedDB();
      }
      
      // Fallback to localStorage if IndexedDB fails or is empty
      if (assets.length === 0) {
        const stored = localStorage.getItem('cached-assets');
        if (stored) {
          assets = JSON.parse(stored).map((a: any) => ({
            ...a,
            lastAccessed: new Date(a.lastAccessed)
          }));
        }
      }
      
      setCachedAssets(assets);
      console.log(`[OfflineManager] Loaded ${assets.length} cached assets`);
      
    } catch (error) {
      console.error('[OfflineManager] Failed to load cached assets:', sanitizeForLog(error instanceof Error ? error.message : String(error)));
      // Initialize with empty array to prevent app crashes
      setCachedAssets([]);
    }
  };

  const saveProjectOffline = async (projectData: any) => {
    try {
      const project: OfflineProject = {
        id: projectData.id || `offline-${Date.now()}`,
        name: projectData.name || 'Untitled Project',
        data: projectData,
        lastModified: new Date(),
        size: JSON.stringify(projectData).length,
        syncStatus: isOnline ? 'synced' : 'pending',
        thumbnail: projectData.thumbnail
      };

      // Save to IndexedDB first, fallback to localStorage
      await saveProjectToIndexedDB(project);

      const updatedProjects = [
        ...offlineProjects.filter(p => p.id !== project.id),
        project
      ];

      setOfflineProjects(updatedProjects);

      // Add to sync queue if offline
      if (!isOnline) {
        setSyncQueue(prev => [...new Set([...prev, project.id])]);
        
        // Register background sync if service worker is available
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('project-sync');
        }
      }

      onProjectSave(project);
      console.log(`[OfflineManager] Project saved: ${project.name}`);
      
    } catch (error) {
      console.error('[OfflineManager] Failed to save project offline:', sanitizeForLog(error instanceof Error ? error.message : String(error)));
      throw error; // Re-throw to let caller handle the error
    }
  };

  const loadProjectOffline = (projectId: string) => {
    const project = offlineProjects.find(p => p.id === projectId);
    if (project) {
      onProjectLoad(project);
    }
  };

  const cacheAsset = async (asset: OfflineAsset) => {
    try {
      if (!asset.url) {
        console.warn('[OfflineManager] Cannot cache asset without URL:', asset.name);
        return;
      }

      console.log(`[OfflineManager] Caching asset: ${asset.name}`);

      // Fetch and cache the asset
      const response = await fetch(asset.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const localUrl = URL.createObjectURL(blob);

      const cachedAsset: OfflineAsset = {
        ...asset,
        localUrl,
        cached: true,
        lastAccessed: new Date(),
        size: blob.size // Update with actual size
      };

      // Save to IndexedDB first, fallback to localStorage
      await saveAssetToIndexedDB(cachedAsset);

      const updatedAssets = [
        ...cachedAssets.filter(a => a.id !== asset.id),
        cachedAsset
      ];

      setCachedAssets(updatedAssets);

      // Also cache in service worker if available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_ASSET',
          payload: { url: asset.url, cacheName: 'assets-v1' }
        });
      }

      console.log(`[OfflineManager] Asset cached successfully: ${asset.name}`);

    } catch (error) {
      console.error(`[OfflineManager] Failed to cache asset ${asset.name}:`, error);
      throw error;
    }
  };

  const clearCache = async () => {
    try {
      console.log('[OfflineManager] Clearing cache...');

      // Clear cached assets
      cachedAssets.forEach(asset => {
        if (asset.localUrl) {
          URL.revokeObjectURL(asset.localUrl);
        }
      });

      setCachedAssets([]);
      localStorage.removeItem('cached-assets');

      // Clear IndexedDB assets
      if ('indexedDB' in window) {
        const request = indexedDB.open('MasterImageEditor', 1);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction(['assets'], 'readwrite');
          const store = transaction.objectStore('assets');
          store.clear();
        };
      }

      // Clear old projects (keep last 10)
      const recentProjects = offlineProjects
        .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
        .slice(0, 10);

      setOfflineProjects(recentProjects);
      localStorage.setItem('offline-projects', JSON.stringify(recentProjects));

      // Clear service worker caches
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_CACHE',
          payload: { cacheName: 'assets-v1' }
        });
      }

      await updateStorageInfo();
      console.log('[OfflineManager] Cache cleared successfully');
      
    } catch (error) {
      console.error('[OfflineManager] Failed to clear cache:', error);
      throw error;
    }
  };

  const processSyncQueue = async () => {
    if (!isOnline || syncQueue.length === 0) return;

    try {
      for (const projectId of syncQueue) {
        const project = offlineProjects.find(p => p.id === projectId);
        if (project) {
          // Simulate cloud sync
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Update sync status
          const updatedProjects = offlineProjects.map(p =>
            p.id === projectId ? { ...p, syncStatus: 'synced' as const } : p
          );
          
          setOfflineProjects(updatedProjects);
          localStorage.setItem('offline-projects', JSON.stringify(updatedProjects));
        }
      }

      setSyncQueue([]);
    } catch (error) {
      console.error('Failed to process sync queue:', error);
    }
  };

  const updateStorageInfo = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        setStorageUsed(estimate.usage || 0);
        setStorageQuota(estimate.quota || 0);
      } else {
        // Fallback calculation
        const projectsSize = offlineProjects.reduce((total, p) => total + p.size, 0);
        const assetsSize = cachedAssets.reduce((total, a) => total + a.size, 0);
        setStorageUsed(projectsSize + assetsSize);
        setStorageQuota(50 * 1024 * 1024); // 50MB fallback
      }
    } catch (error) {
      console.error('Failed to update storage info:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    return storageQuota > 0 ? (storageUsed / storageQuota) * 100 : 0;
  };

  // IndexedDB helper functions
  const initializeIndexedDB = async () => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('MasterImageEditor', 1);
      
      request.onerror = () => {
        console.warn('[OfflineManager] IndexedDB not available, using localStorage');
        resolve(); // Don't fail, just continue without IndexedDB
      };
      
      request.onsuccess = () => {
        console.log('[OfflineManager] IndexedDB initialized successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('lastModified', 'lastModified', { unique: false });
          projectStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('assets')) {
          const assetStore = db.createObjectStore('assets', { keyPath: 'id' });
          assetStore.createIndex('type', 'type', { unique: false });
          assetStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }
        
        console.log('[OfflineManager] IndexedDB schema created');
      };
    });
  };

  const loadProjectsFromIndexedDB = async (): Promise<OfflineProject[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MasterImageEditor', 1);
      
      request.onerror = () => resolve([]);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const projects = getAllRequest.result.map((p: any) => ({
            ...p,
            lastModified: new Date(p.lastModified)
          }));
          resolve(projects);
        };
        
        getAllRequest.onerror = () => resolve([]);
      };
    });
  };

  const loadAssetsFromIndexedDB = async (): Promise<OfflineAsset[]> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MasterImageEditor', 1);
      
      request.onerror = () => resolve([]);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['assets'], 'readonly');
        const store = transaction.objectStore('assets');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const assets = getAllRequest.result.map((a: any) => ({
            ...a,
            lastAccessed: new Date(a.lastAccessed)
          }));
          resolve(assets);
        };
        
        getAllRequest.onerror = () => resolve([]);
      };
    });
  };

  const saveProjectToIndexedDB = async (project: OfflineProject) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('MasterImageEditor', 1);
      
      request.onerror = () => {
        // Fallback to localStorage
        const projects = [...offlineProjects.filter(p => p.id !== project.id), project];
        localStorage.setItem('offline-projects', JSON.stringify(projects));
        resolve();
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        const putRequest = store.put(project);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => {
          // Fallback to localStorage
          const projects = [...offlineProjects.filter(p => p.id !== project.id), project];
          localStorage.setItem('offline-projects', JSON.stringify(projects));
          resolve();
        };
      };
    });
  };

  const saveAssetToIndexedDB = async (asset: OfflineAsset) => {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('MasterImageEditor', 1);
      
      request.onerror = () => {
        // Fallback to localStorage
        const assets = [...cachedAssets.filter(a => a.id !== asset.id), asset];
        localStorage.setItem('cached-assets', JSON.stringify(assets));
        resolve();
      };
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['assets'], 'readwrite');
        const store = transaction.objectStore('assets');
        const putRequest = store.put(asset);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => {
          // Fallback to localStorage
          const assets = [...cachedAssets.filter(a => a.id !== asset.id), asset];
          localStorage.setItem('cached-assets', JSON.stringify(assets));
          resolve();
        };
      };
    });
  };

  // Service worker message handler
  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, payload } = event.data;
    
    switch (type) {
      case 'CACHE_SIZE':
        // Update storage info when service worker reports cache size
        setStorageUsed(prev => prev + payload.size);
        break;
        
      case 'SYNC_COMPLETE':
        // Handle sync completion
        if (payload.projectId) {
          setOfflineProjects(prev => prev.map(p => 
            p.id === payload.projectId 
              ? { ...p, syncStatus: 'synced' as const }
              : p
          ));
        }
        break;
        
      case 'OFFLINE_READY':
        console.log('[OfflineManager] Service worker is ready for offline use');
        break;
        
      default:
        console.log('[OfflineManager] Unknown service worker message:', type);
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <>
      {/* Connection Status Indicator */}
      {(!isOnline || isSlowConnection) && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-40">
          <div className={`border rounded-lg px-4 py-2 flex items-center gap-2 ${
            !isOnline 
              ? 'bg-red-100 border-red-200' 
              : 'bg-yellow-100 border-yellow-200'
          }`}>
            {!isOnline ? (
              <WifiOff className="w-4 h-4 text-red-600" />
            ) : (
              <Signal className="w-4 h-4 text-yellow-600" />
            )}
            <span className={`text-sm font-medium ${
              !isOnline ? 'text-red-800' : 'text-yellow-800'
            }`}>
              {!isOnline ? 'Working Offline' : 'Slow Connection'}
            </span>
            {syncQueue.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                !isOnline 
                  ? 'bg-red-200 text-red-700' 
                  : 'bg-yellow-200 text-yellow-700'
              }`}>
                {syncQueue.length} pending
              </span>
            )}
            {isSlowConnection && isOnline && (
              <span className="text-xs text-yellow-600">
                {effectiveType} • {downlink.toFixed(1)} Mbps
              </span>
            )}
          </div>
        </div>
      )}

      {/* Offline Manager Button */}
      <button
        onClick={() => setShowOfflineDialog(true)}
        className="fixed bottom-16 left-4 z-40 p-3 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Offline Manager"
      >
        <HardDrive className="w-5 h-5" />
      </button>

      {/* Offline Manager Dialog */}
      {showOfflineDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-5xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Offline Manager
                </h2>
                <p className="text-sm text-gray-500">
                  Manage offline projects and cached assets
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">
                  {formatBytes(storageUsed)} / {formatBytes(storageQuota)} used
                </div>
                <button
                  onClick={() => setShowOfflineDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Storage Usage */}
            <div className="p-4 border-b">
              {/* Connection Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    {isOnline ? (
                      isSlowConnection ? (
                        <Signal className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <Wifi className="w-4 h-4 text-green-500" />
                      )
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    Connection Status
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    isOnline 
                      ? isSlowConnection 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {isOnline ? (isSlowConnection ? 'Slow' : 'Online') : 'Offline'}
                  </span>
                </div>
                {isOnline && (
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Type: {connectionType} • Speed: {effectiveType}</div>
                    <div>Downlink: {downlink.toFixed(1)} Mbps • RTT: {rtt}ms</div>
                  </div>
                )}
              </div>
              
              {/* Storage Usage */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Storage Usage</span>
                <span className="text-sm text-gray-600">
                  {getStoragePercentage().toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    getStoragePercentage() > 80 ? 'bg-red-500' :
                    getStoragePercentage() > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
                />
              </div>
              {getStoragePercentage() > 80 && (
                <p className="text-xs text-red-600 mt-1">
                  Storage is running low. Consider clearing cache.
                </p>
              )}
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Offline Projects */}
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Offline Projects ({offlineProjects.length})</h3>
                  {syncQueue.length > 0 && isOnline && (
                    <button
                      onClick={processSyncQueue}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Sync All
                    </button>
                  )}
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {offlineProjects.map(project => (
                    <div key={project.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{project.name}</h4>
                          <p className="text-xs text-gray-500">
                            {sanitizeHtml(project.lastModified.toLocaleString())} • {sanitizeHtml(formatBytes(project.size))}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded text-xs ${
                            project.syncStatus === 'synced' ? 'bg-green-100 text-green-700' :
                            project.syncStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {project.syncStatus === 'synced' ? (
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                            ) : project.syncStatus === 'pending' ? (
                              <Clock className="w-3 h-3 inline mr-1" />
                            ) : (
                              <AlertCircle className="w-3 h-3 inline mr-1" />
                            )}
                            {project.syncStatus}
                          </div>
                          <button
                            onClick={() => loadProjectOffline(project.id)}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                          >
                            Load
                          </button>
                        </div>
                      </div>
                      
                      {project.thumbnail && (
                        <div className="w-full h-16 bg-gray-200 rounded overflow-hidden">
                          <img
                            src={project.thumbnail}
                            alt={project.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  {offlineProjects.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No offline projects</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cached Assets */}
              <div className="w-80 border-l p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Cached Assets ({cachedAssets.length})</h3>
                  <button
                    onClick={clearCache}
                    className="px-3 py-1.5 border rounded hover:bg-gray-50 text-sm"
                  >
                    Clear Cache
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {cachedAssets.map(asset => (
                    <div key={asset.id} className="bg-gray-50 rounded p-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{asset.name}</p>
                          <p className="text-xs text-gray-500">
                            {asset.type} • {formatBytes(asset.size)}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          asset.cached ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </div>
                    </div>
                  ))}

                  {cachedAssets.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Download className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No cached assets</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Offline Features</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Full editor functionality</li>
                    <li>• Local project storage</li>
                    <li>• Asset caching</li>
                    <li>• Auto-sync when online</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};