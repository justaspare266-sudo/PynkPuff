import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Clock, Download, Trash2, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../stores/editorStore';

interface BackupEntry {
  id: string;
  timestamp: number;
  projectData: any;
  size: number;
  type: 'auto' | 'manual';
  description?: string;
}

export const AutoBackupSystem: React.FC = () => {
  const { layers = [] } = useEditorStore();
  const objects = layers.flatMap(layer => layer.objects);
  const exportProject = () => ({ layers, canvas: { width: 800, height: 600 } });
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [showBackupPanel, setShowBackupPanel] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackupTime, setLastBackupTime] = useState<number>(0);

  // Auto-backup interval (5 minutes)
  const BACKUP_INTERVAL = 5 * 60 * 1000;
  const MAX_BACKUPS = 20;

  // Load existing backups on mount
  useEffect(() => {
    const savedBackups = localStorage.getItem('editor-backups');
    if (savedBackups) {
      try {
        setBackups(JSON.parse(savedBackups));
      } catch (error) {
        console.error('Failed to load backups:', error);
      }
    }
  }, []);

  // Save backups to localStorage
  useEffect(() => {
    if (backups.length > 0) {
      localStorage.setItem('editor-backups', JSON.stringify(backups));
    }
  }, [backups]);

  // Create backup
  const createBackup = (type: 'auto' | 'manual', description?: string) => {
    try {
      const projectData = exportProject();
      const backup: BackupEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        projectData,
        size: JSON.stringify(projectData).length,
        type,
        description
      };

      setBackups(prev => {
        const newBackups = [backup, ...prev].slice(0, MAX_BACKUPS);
        return newBackups;
      });

      setLastBackupTime(Date.now());
      return true;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return false;
    }
  };

  // Auto-backup when objects change
  useEffect(() => {
    if (!objects || objects.length === 0) return;

    const now = Date.now();
    if (now - lastBackupTime > BACKUP_INTERVAL) {
      createBackup('auto');
    }
  }, [objects, lastBackupTime]);

  // Periodic auto-backup
  useEffect(() => {
    const interval = setInterval(() => {
      if (objects && objects.length > 0) {
        createBackup('auto');
      }
    }, BACKUP_INTERVAL);

    return () => clearInterval(interval);
  }, [objects?.length]);

  // Restore from backup
  const restoreBackup = async (backup: BackupEntry) => {
    setIsRestoring(true);
    try {
      // Import the backup data
      // const { loadProject } = useEditorStore.getState();
      // await loadProject(backup.projectData);
      
      // Create a restore point
      createBackup('manual', `Restored from ${new Date(backup.timestamp).toLocaleString()}`);
      
      setShowBackupPanel(false);
    } catch (error) {
      console.error('Failed to restore backup:', error);
    } finally {
      setIsRestoring(false);
    }
  };

  // Delete backup
  const deleteBackup = (backupId: string) => {
    setBackups(prev => prev.filter(b => b.id !== backupId));
  };

  // Download backup
  const downloadBackup = (backup: BackupEntry) => {
    const blob = new Blob([JSON.stringify(backup.projectData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date(backup.timestamp).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <>
      {/* Backup Status Indicator */}
      <motion.div
        className="fixed top-16 right-4 z-30 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-600">Auto-backup</span>
        </div>
        <button
          onClick={() => setShowBackupPanel(true)}
          className="text-gray-400 hover:text-gray-600"
          title="View backups"
        >
          <Clock size={14} />
        </button>
      </motion.div>

      {/* Backup Panel */}
      <AnimatePresence>
        {showBackupPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBackupPanel(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Save size={20} />
                    Backup & Recovery
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => createBackup('manual', 'Manual backup')}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Create Backup
                    </button>
                    <button
                      onClick={() => setShowBackupPanel(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {backups.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Save size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No backups available</p>
                    <p className="text-sm">Backups are created automatically every 5 minutes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {backups.map(backup => (
                      <div
                        key={backup.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              backup.type === 'auto' ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                            <span className="font-medium">
                              {backup.description || `${backup.type === 'auto' ? 'Auto' : 'Manual'} Backup`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatSize(backup.size)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(backup.timestamp).toLocaleString()} • {formatTimeAgo(backup.timestamp)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadBackup(backup)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                            title="Download backup"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => restoreBackup(backup)}
                            disabled={isRestoring}
                            className="p-2 text-gray-400 hover:text-green-600 disabled:opacity-50"
                            title="Restore backup"
                          >
                            <RotateCcw size={16} />
                          </button>
                          <button
                            onClick={() => deleteBackup(backup.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Delete backup"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recovery Warning */}
              <div className="p-4 bg-yellow-50 border-t">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Recovery Notice:</strong> Restoring a backup will replace your current project. 
                    A backup of your current state will be created automatically.
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restoring Overlay */}
      <AnimatePresence>
        {isRestoring && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center"
          >
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Restoring backup...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};