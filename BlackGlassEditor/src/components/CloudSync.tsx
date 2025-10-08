import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertTriangle, Wifi, WifiOff, Upload, Download } from 'lucide-react';

interface CloudProject {
  id: string;
  name: string;
  lastModified: Date;
  size: number;
  version: number;
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'offline' | 'error';
  thumbnail?: string;
  collaborators: string[];
}

interface SyncStatus {
  isOnline: boolean;
  isConnected: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
  error: string | null;
}

interface CloudSyncProps {
  projectData: any;
  onProjectUpdate: (data: any) => void;
  onSyncStatusChange: (status: SyncStatus) => void;
}

export const CloudSync: React.FC<CloudSyncProps> = ({
  projectData,
  onProjectUpdate,
  onSyncStatusChange
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isConnected: false,
    lastSync: null,
    pendingChanges: 0,
    syncInProgress: false,
    error: null
  });

  const [cloudProjects, setCloudProjects] = useState<CloudProject[]>([]);
  const [showCloudDialog, setShowCloudDialog] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30); // seconds

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      if (autoSync) {
        syncToCloud();
      }
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false, isConnected: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoSync]);

  // Auto-sync timer
  useEffect(() => {
    if (!autoSync || !syncStatus.isOnline) return;

    const timer = setInterval(() => {
      if (syncStatus.pendingChanges > 0) {
        syncToCloud();
      }
    }, syncInterval * 1000);

    return () => clearInterval(timer);
  }, [autoSync, syncStatus.isOnline, syncStatus.pendingChanges, syncInterval]);

  // Track project changes
  useEffect(() => {
    setSyncStatus(prev => ({
      ...prev,
      pendingChanges: prev.pendingChanges + 1
    }));
  }, [projectData]);

  const syncToCloud = async () => {
    if (!syncStatus.isOnline || syncStatus.syncInProgress) return;

    setSyncStatus(prev => ({ ...prev, syncInProgress: true, error: null }));

    try {
      // Simulate cloud sync
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check for conflicts
      const hasConflict = Math.random() < 0.05; // 5% chance
      if (hasConflict) {
        setSyncStatus(prev => ({
          ...prev,
          syncInProgress: false,
          error: 'Sync conflict detected - manual resolution required'
        }));
        return;
      }

      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        isConnected: true,
        lastSync: new Date(),
        pendingChanges: 0,
        error: null
      }));

      // Update cloud projects list
      const updatedProject: CloudProject = {
        id: 'current-project',
        name: projectData.name || 'Untitled Project',
        lastModified: new Date(),
        size: JSON.stringify(projectData).length,
        version: (cloudProjects.find(p => p.id === 'current-project')?.version || 0) + 1,
        syncStatus: 'synced',
        collaborators: []
      };

      setCloudProjects(prev => {
        const filtered = prev.filter(p => p.id !== 'current-project');
        return [...filtered, updatedProject];
      });

    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: error instanceof Error ? error.message : 'Sync failed'
      }));
    }
  };

  const loadFromCloud = async (projectId: string) => {
    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));

    try {
      // Simulate loading from cloud
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockProjectData = {
        name: 'Cloud Project',
        objects: [],
        layers: [],
        canvas: { width: 1920, height: 1080 }
      };

      onProjectUpdate(mockProjectData);
      
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date()
      }));

    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Failed to load project from cloud'
      }));
    }
  };

  const resolveConflict = async (resolution: 'local' | 'cloud' | 'merge') => {
    setSyncStatus(prev => ({ ...prev, syncInProgress: true, error: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date(),
        pendingChanges: 0
      }));

    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: 'Failed to resolve conflict'
      }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Notify parent of sync status changes
  useEffect(() => {
    onSyncStatusChange(syncStatus);
  }, [syncStatus, onSyncStatusChange]);

  return (
    <>
      {/* Sync Status Indicator */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all ${
          syncStatus.error ? 'bg-red-100 text-red-700' :
          syncStatus.syncInProgress ? 'bg-blue-100 text-blue-700' :
          syncStatus.isConnected ? 'bg-green-100 text-green-700' :
          syncStatus.isOnline ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {syncStatus.syncInProgress ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : syncStatus.error ? (
            <AlertTriangle className="w-4 h-4" />
          ) : syncStatus.isConnected ? (
            <Check className="w-4 h-4" />
          ) : syncStatus.isOnline ? (
            <Cloud className="w-4 h-4" />
          ) : (
            <CloudOff className="w-4 h-4" />
          )}
          
          <span className="text-sm font-medium">
            {syncStatus.syncInProgress ? 'Syncing...' :
             syncStatus.error ? 'Sync Error' :
             syncStatus.isConnected ? 'Synced' :
             syncStatus.isOnline ? 'Online' :
             'Offline'}
          </span>
          
          {syncStatus.pendingChanges > 0 && !syncStatus.syncInProgress && (
            <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">
              {syncStatus.pendingChanges} changes
            </span>
          )}
        </div>
      </div>

      {/* Cloud Controls */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            {syncStatus.isOnline ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            
            <div className="text-sm">
              {syncStatus.lastSync ? (
                <span className="text-gray-600">
                  Last sync: {formatTimeAgo(syncStatus.lastSync)}
                </span>
              ) : (
                <span className="text-gray-500">Never synced</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setAutoSync(!autoSync)}
              className={`px-2 py-1 text-xs rounded ${
                autoSync ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Auto-sync {autoSync ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={syncToCloud}
              disabled={!syncStatus.isOnline || syncStatus.syncInProgress}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowCloudDialog(true)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Cloud className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cloud Projects Dialog */}
      {showCloudDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[70vh] max-w-4xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Cloud Projects
                </h2>
                <p className="text-sm text-gray-500">Manage your cloud-synced projects</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>Auto-sync every</span>
                  <select
                    value={syncInterval}
                    onChange={(e) => setSyncInterval(Number(e.target.value))}
                    className="px-2 py-1 border rounded"
                  >
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1m</option>
                    <option value={300}>5m</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowCloudDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cloudProjects.map(project => (
                  <div key={project.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium truncate">{project.name}</h3>
                        <p className="text-sm text-gray-500">
                          v{project.version} • {formatFileSize(project.size)}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs ${
                        project.syncStatus === 'synced' ? 'bg-green-100 text-green-700' :
                        project.syncStatus === 'syncing' ? 'bg-blue-100 text-blue-700' :
                        project.syncStatus === 'conflict' ? 'bg-red-100 text-red-700' :
                        project.syncStatus === 'offline' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {project.syncStatus}
                      </div>
                    </div>

                    <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <span className="text-gray-400 text-sm">No preview</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>{formatTimeAgo(project.lastModified)}</span>
                      <span>{project.collaborators.length} collaborators</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => loadFromCloud(project.id)}
                        className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        <Download className="w-3 h-3 inline mr-1" />
                        Load
                      </button>
                      <button className="px-3 py-1.5 border rounded hover:bg-gray-50 text-sm">
                        Share
                      </button>
                    </div>
                  </div>
                ))}

                {cloudProjects.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-12">
                    <Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No cloud projects yet</p>
                    <p className="text-sm">Your projects will appear here when synced</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Resolution Dialog */}
      {syncStatus.error?.includes('conflict') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl w-[500px] p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Sync Conflict
            </h3>
            
            <p className="text-gray-600 mb-6">
              Your local changes conflict with the cloud version. How would you like to resolve this?
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => resolveConflict('local')}
                className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="font-medium">Keep Local Changes</div>
                <div className="text-sm text-gray-500">Overwrite cloud version with your changes</div>
              </button>
              
              <button
                onClick={() => resolveConflict('cloud')}
                className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="font-medium">Use Cloud Version</div>
                <div className="text-sm text-gray-500">Discard local changes and use cloud version</div>
              </button>
              
              <button
                onClick={() => resolveConflict('merge')}
                className="w-full p-3 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="font-medium">Attempt Merge</div>
                <div className="text-sm text-gray-500">Try to combine both versions automatically</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};