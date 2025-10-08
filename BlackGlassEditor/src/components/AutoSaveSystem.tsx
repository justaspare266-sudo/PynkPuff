import React, { useState, useEffect } from 'react';
import { Save, Clock, AlertTriangle, CheckCircle, RefreshCw, Users, GitMerge } from 'lucide-react';

interface AutoSaveState {
  enabled: boolean;
  interval: number; // seconds
  lastSaved: Date | null;
  isDirty: boolean;
  isSaving: boolean;
  error: string | null;
}

interface SaveConflict {
  id: string;
  type: 'version' | 'concurrent' | 'network';
  message: string;
  localVersion: any;
  remoteVersion: any;
  timestamp: Date;
  resolved: boolean;
}

interface AutoSaveSystemProps {
  projectData: any;
  onSave: (data: any) => Promise<void>;
  onConflictResolved: (resolution: 'local' | 'remote' | 'merge') => void;
}

export const AutoSaveSystem: React.FC<AutoSaveSystemProps> = ({
  projectData,
  onSave,
  onConflictResolved
}) => {
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    enabled: true,
    interval: 30,
    lastSaved: null,
    isDirty: false,
    isSaving: false,
    error: null
  });

  const [conflicts, setConflicts] = useState<SaveConflict[]>([]);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [currentConflict, setCurrentConflict] = useState<SaveConflict | null>(null);
  const [backupVersions, setBackupVersions] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-save timer
  useEffect(() => {
    if (!autoSaveState.enabled || !autoSaveState.isDirty) return;

    const timer = setTimeout(async () => {
      await performAutoSave();
    }, autoSaveState.interval * 1000);

    return () => clearTimeout(timer);
  }, [autoSaveState.enabled, autoSaveState.interval, autoSaveState.isDirty, projectData]);

  // Monitor project changes
  useEffect(() => {
    setAutoSaveState(prev => ({ ...prev, isDirty: true }));
  }, [projectData]);

  const performAutoSave = async () => {
    if (autoSaveState.isSaving) return;

    setAutoSaveState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      // Create backup before saving
      createBackup();

      // Simulate network delay and potential conflicts
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check for conflicts (simulate)
      const hasConflict = Math.random() < 0.1; // 10% chance of conflict
      if (hasConflict) {
        const conflict: SaveConflict = {
          id: `conflict-${Date.now()}`,
          type: 'concurrent',
          message: 'Another user has modified this project. Please resolve the conflict.',
          localVersion: projectData,
          remoteVersion: { ...projectData, modifiedBy: 'Another User' },
          timestamp: new Date(),
          resolved: false
        };
        
        setConflicts(prev => [...prev, conflict]);
        setCurrentConflict(conflict);
        setShowConflictDialog(true);
        
        setAutoSaveState(prev => ({
          ...prev,
          isSaving: false,
          error: 'Conflict detected - manual resolution required'
        }));
        return;
      }

      await onSave(projectData);
      
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        isDirty: false,
        lastSaved: new Date(),
        error: null
      }));

    } catch (error) {
      setAutoSaveState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Save failed'
      }));
    }
  };

  const createBackup = () => {
    const backup = {
      id: `backup-${Date.now()}`,
      data: JSON.parse(JSON.stringify(projectData)),
      timestamp: new Date(),
      type: 'auto'
    };
    
    setBackupVersions(prev => [...prev.slice(-9), backup]); // Keep last 10 backups
  };

  const resolveConflict = async (resolution: 'local' | 'remote' | 'merge') => {
    if (!currentConflict) return;

    try {
      let resolvedData = projectData;
      
      if (resolution === 'remote') {
        resolvedData = currentConflict.remoteVersion;
      } else if (resolution === 'merge') {
        // Simple merge strategy - in real app, this would be more sophisticated
        resolvedData = {
          ...currentConflict.remoteVersion,
          ...projectData,
          mergedAt: new Date()
        };
      }

      await onSave(resolvedData);
      onConflictResolved(resolution);

      setConflicts(prev => prev.map(conflict =>
        conflict.id === currentConflict.id
          ? { ...conflict, resolved: true }
          : conflict
      ));

      setCurrentConflict(null);
      setShowConflictDialog(false);
      
      setAutoSaveState(prev => ({
        ...prev,
        isDirty: false,
        lastSaved: new Date(),
        error: null
      }));

    } catch (error) {
      setAutoSaveState(prev => ({
        ...prev,
        error: 'Failed to resolve conflict'
      }));
    }
  };

  const restoreBackup = async (backup: any) => {
    if (confirm('Are you sure you want to restore this backup? Current changes will be lost.')) {
      try {
        await onSave(backup.data);
        setAutoSaveState(prev => ({
          ...prev,
          isDirty: false,
          lastSaved: new Date()
        }));
      } catch (error) {
        setAutoSaveState(prev => ({
          ...prev,
          error: 'Failed to restore backup'
        }));
      }
    }
  };

  const toggleAutoSave = () => {
    setAutoSaveState(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateInterval = (interval: number) => {
    setAutoSaveState(prev => ({ ...prev, interval }));
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <>
      {/* Auto-save Status Bar */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            {autoSaveState.isSaving ? (
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />
            ) : autoSaveState.error ? (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            
            <div className="text-sm">
              {autoSaveState.isSaving ? (
                'Saving...'
              ) : autoSaveState.error ? (
                <span className="text-red-600">{autoSaveState.error}</span>
              ) : autoSaveState.lastSaved ? (
                <span className="text-gray-600">
                  Saved {formatTimeAgo(autoSaveState.lastSaved)}
                </span>
              ) : (
                <span className="text-gray-600">Not saved</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleAutoSave}
              className={`px-2 py-1 text-xs rounded ${
                autoSaveState.enabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Auto-save {autoSaveState.enabled ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-64">
            <h3 className="font-medium mb-3">Auto-save Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Save Interval: {autoSaveState.interval}s
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={autoSaveState.interval}
                  onChange={(e) => updateInterval(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>10s</span>
                  <span>5m</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Recent Backups</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {backupVersions.slice(-5).reverse().map(backup => (
                    <div key={backup.id} className="flex items-center justify-between text-xs">
                      <span>{formatTimeAgo(backup.timestamp)}</span>
                      <button
                        onClick={() => restoreBackup(backup)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                  {backupVersions.length === 0 && (
                    <p className="text-xs text-gray-500">No backups yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conflict Resolution Dialog */}
      {showConflictDialog && currentConflict && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] max-w-4xl max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <GitMerge className="w-6 h-6 text-orange-500" />
                <div>
                  <h2 className="text-xl font-semibold">Resolve Save Conflict</h2>
                  <p className="text-sm text-gray-600">{currentConflict.message}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Local Version */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Your Version
                  </h3>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <p>Last modified: {new Date().toLocaleString()}</p>
                    <p>Objects: {JSON.stringify(currentConflict.localVersion).length} chars</p>
                  </div>
                  <button
                    onClick={() => resolveConflict('local')}
                    className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Keep My Version
                  </button>
                </div>

                {/* Remote Version */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Remote Version
                  </h3>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <p>Last modified: {currentConflict.timestamp.toLocaleString()}</p>
                    <p>Objects: {JSON.stringify(currentConflict.remoteVersion).length} chars</p>
                  </div>
                  <button
                    onClick={() => resolveConflict('remote')}
                    className="mt-3 w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Use Remote Version
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => resolveConflict('merge')}
                  className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
                >
                  <GitMerge className="w-4 h-4" />
                  Attempt Merge
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConflictDialog(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Merging will attempt to combine both versions automatically. 
                  Review the result carefully before continuing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Notifications */}
      {conflicts.filter(c => !c.resolved).length > 0 && (
        <div className="fixed top-4 right-4 z-40">
          <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              {conflicts.filter(c => !c.resolved).length} unresolved conflict(s)
            </span>
            <button
              onClick={() => setShowConflictDialog(true)}
              className="text-xs text-orange-600 hover:text-orange-800 underline"
            >
              Resolve
            </button>
          </div>
        </div>
      )}
    </>
  );
};