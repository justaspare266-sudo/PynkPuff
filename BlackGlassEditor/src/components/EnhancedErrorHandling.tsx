import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  AlertTriangle, 
  X, 
  RefreshCw, 
  Bug, 
  FileText, 
  Download, 
  Copy, 
  Send, 
  Settings, 
  Info, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  User, 
  Code, 
  Database, 
  Wifi, 
  WifiOff,
  HardDrive,
  Cpu,
  MemoryStick,
  Monitor,
  Zap,
  Shield,
  ShieldAlert,
  RotateCcw,
  Play,
  Pause,
  Square
} from 'lucide-react';

export interface ErrorInfo {
  id: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info' | 'debug';
  category: 'rendering' | 'io' | 'network' | 'memory' | 'performance' | 'user' | 'system';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

export interface ErrorRecoveryOptions {
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number;
  fallbackMode: boolean;
  userNotification: boolean;
  logToConsole: boolean;
  logToServer: boolean;
  saveToLocalStorage: boolean;
}

interface EnhancedErrorHandlingProps {
  onError?: (error: ErrorInfo) => void;
  onRecovery?: (errorId: string) => void;
  onReport?: (error: ErrorInfo) => void;
  onClearAll?: () => void;
  recoveryOptions?: Partial<ErrorRecoveryOptions>;
  className?: string;
}

const defaultRecoveryOptions: ErrorRecoveryOptions = {
  autoRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  fallbackMode: true,
  userNotification: true,
  logToConsole: true,
  logToServer: false,
  saveToLocalStorage: true
};

export const EnhancedErrorHandling: React.FC<EnhancedErrorHandlingProps> = ({
  onError,
  onRecovery,
  onReport,
  onClearAll,
  recoveryOptions = {},
  className = ''
}) => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);
  const [showErrorPanel, setShowErrorPanel] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorInfo | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [errorStats, setErrorStats] = useState({
    total: 0,
    resolved: 0,
    critical: 0,
    byCategory: {} as Record<string, number>,
    bySeverity: {} as Record<string, number>
  });
  
  const options = { ...defaultRecoveryOptions, ...recoveryOptions };
  const retryCounts = useRef<Map<string, number>>(new Map());
  const errorBoundaryRef = useRef<ErrorBoundaryState | null>(null);

  // Load errors from localStorage
  useEffect(() => {
    if (options.saveToLocalStorage) {
      const savedErrors = localStorage.getItem('image-editor-errors');
      if (savedErrors) {
        try {
          const parsed = JSON.parse(savedErrors);
          setErrors(parsed.map((e: any) => ({
            ...e,
            timestamp: new Date(e.timestamp)
          })));
        } catch (error) {
          console.error('Failed to load saved errors:', error);
        }
      }
    }
  }, [options.saveToLocalStorage]);

  // Save errors to localStorage
  const saveErrors = useCallback((updatedErrors: ErrorInfo[]) => {
    if (options.saveToLocalStorage) {
      localStorage.setItem('image-editor-errors', JSON.stringify(updatedErrors));
    }
    setErrors(updatedErrors);
  }, [options.saveToLocalStorage]);

  // Update error statistics
  useEffect(() => {
    const stats = {
      total: errors.length,
      resolved: errors.filter(e => e.resolved).length,
      critical: errors.filter(e => e.severity === 'critical').length,
      byCategory: errors.reduce((acc, error) => {
        acc[error.category] = (acc[error.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: errors.reduce((acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    setErrorStats(stats);
  }, [errors]);

  // Create error info from error object
  const createErrorInfo = useCallback((error: Error, context?: Record<string, any>): ErrorInfo => {
    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'error',
      category: 'system',
      message: error.message,
      stack: error.stack,
      context,
      severity: 'medium',
      resolved: false,
      sessionId: `session-${Date.now()}`,
      component: context?.component || 'Unknown'
    };
  }, []);

  // Log error
  const logError = useCallback((error: Error, context?: Record<string, any>) => {
    const errorInfo = createErrorInfo(error, context);
    
    // Log to console
    if (options.logToConsole) {
      console.error('Error logged:', errorInfo);
    }
    
    // Save to state
    const updatedErrors = [...errors, errorInfo];
    saveErrors(updatedErrors);
    
    // Notify parent
    onError?.(errorInfo);
    
    // Auto-retry if enabled
    if (options.autoRetry && errorInfo.severity !== 'critical') {
      setTimeout(() => {
        retryError(errorInfo.id);
      }, options.retryDelay);
    }
    
    return errorInfo;
  }, [errors, createErrorInfo, saveErrors, onError, options]);

  // Retry error recovery
  const retryError = useCallback(async (errorId: string) => {
    const error = errors.find(e => e.id === errorId);
    if (!error) return;
    
    const retryCount = retryCounts.current.get(errorId) || 0;
    if (retryCount >= options.maxRetries) {
      console.warn(`Max retries exceeded for error ${errorId}`);
      return;
    }
    
    retryCounts.current.set(errorId, retryCount + 1);
    
    try {
      setIsRecovering(true);
      setRecoveryProgress(0);
      
      // Simulate recovery process
      for (let i = 0; i <= 100; i += 10) {
        setRecoveryProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Mark as resolved
      const updatedErrors = errors.map(e => 
        e.id === errorId ? { ...e, resolved: true } : e
      );
      saveErrors(updatedErrors);
      
      onRecovery?.(errorId);
      
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
    } finally {
      setIsRecovering(false);
      setRecoveryProgress(0);
    }
  }, [errors, saveErrors, onRecovery, options]);

  // Manual error recovery
  const handleRecoverError = useCallback((errorId: string) => {
    retryError(errorId);
  }, [retryError]);

  // Mark error as resolved
  const handleResolveError = useCallback((errorId: string) => {
    const updatedErrors = errors.map(e => 
      e.id === errorId ? { ...e, resolved: true } : e
    );
    saveErrors(updatedErrors);
  }, [errors, saveErrors]);

  // Delete error
  const handleDeleteError = useCallback((errorId: string) => {
    const updatedErrors = errors.filter(e => e.id !== errorId);
    saveErrors(updatedErrors);
  }, [errors, saveErrors]);

  // Clear all errors
  const handleClearAllErrors = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all errors?')) {
      saveErrors([]);
      onClearAll?.();
    }
  }, [saveErrors, onClearAll]);

  // Export errors
  const handleExportErrors = useCallback(() => {
    const dataStr = JSON.stringify(errors, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `errors-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [errors]);

  // Report error
  const handleReportError = useCallback((error: ErrorInfo) => {
    onReport?.(error);
    // In a real app, this would send to error reporting service
    console.log('Error reported:', error);
  }, [onReport]);

  // Get error icon
  const getErrorIcon = (type: string, severity: string) => {
    if (severity === 'critical') return XCircle;
    if (type === 'error') return AlertTriangle;
    if (type === 'warning') return AlertCircle;
    if (type === 'info') return Info;
    return Bug;
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rendering': return Monitor;
      case 'io': return HardDrive;
      case 'network': return Wifi;
      case 'memory': return MemoryStick;
      case 'performance': return Cpu;
      case 'user': return User;
      case 'system': return Settings;
      default: return Bug;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold">Error Handling</h3>
          <span className="text-sm text-gray-500">({errors.length} errors)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowErrorPanel(!showErrorPanel)}
            className="p-2 rounded hover:bg-gray-100"
            title="Toggle Error Panel"
          >
            <Bug className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleClearAllErrors}
            className="p-2 rounded hover:bg-gray-100 text-red-600"
            title="Clear All Errors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Statistics */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{errorStats.total}</div>
            <div className="text-sm text-gray-500">Total Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{errorStats.resolved}</div>
            <div className="text-sm text-gray-500">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{errorStats.critical}</div>
            <div className="text-sm text-gray-500">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((errorStats.resolved / Math.max(errorStats.total, 1)) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Resolved Rate</div>
          </div>
        </div>
      </div>

      {/* Error List */}
      {showErrorPanel && (
        <div className="p-4 max-h-96 overflow-y-auto">
          {errors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No errors found</p>
              <p className="text-sm">All systems running smoothly!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {errors.map(error => {
                const ErrorIcon = getErrorIcon(error.type, error.severity);
                const CategoryIcon = getCategoryIcon(error.category);
                
                return (
                  <div
                    key={error.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      error.resolved ? 'opacity-50 bg-green-50' : ''
                    }`}
                    onClick={() => setSelectedError(error)}
                  >
                    <div className="flex items-start space-x-3">
                      <ErrorIcon className={`w-5 h-5 mt-0.5 ${
                        error.resolved ? 'text-green-500' : 'text-red-500'
                      }`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 truncate">
                            {error.message}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(error.severity)}`}>
                            {error.severity}
                          </span>
                          {error.resolved && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CategoryIcon className="w-3 h-3" />
                            <span>{error.category}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(error.timestamp)}</span>
                          </div>
                          {error.component && (
                            <div className="flex items-center space-x-1">
                              <Code className="w-3 h-3" />
                              <span>{error.component}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {!error.resolved && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRecoverError(error.id);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            title="Recover"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveError(error.id);
                          }}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Mark as Resolved"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteError(error.id);
                          }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Error Details Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Error Details</h3>
              <button
                onClick={() => setSelectedError(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                    {selectedError.message}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity
                  </label>
                  <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(selectedError.severity)}`}>
                    {selectedError.severity}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="flex items-center space-x-2">
                    {React.createElement(getCategoryIcon(selectedError.category), { className: "w-4 h-4" })}
                    <span className="text-sm text-gray-900">{selectedError.category}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timestamp
                  </label>
                  <p className="text-sm text-gray-900">{formatDate(selectedError.timestamp)}</p>
                </div>
              </div>

              {selectedError.stack && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stack Trace
                  </label>
                  <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                    {selectedError.stack}
                  </pre>
                </div>
              )}

              {selectedError.context && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Context
                  </label>
                  <pre className="text-xs text-gray-900 bg-gray-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedError.context, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRecoverError(selectedError.id)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Recover</span>
                  </button>
                  
                  <button
                    onClick={() => handleResolveError(selectedError.id)}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Resolve</span>
                  </button>
                  
                  <button
                    onClick={() => handleReportError(selectedError)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <Send className="w-4 h-4" />
                    <span>Report</span>
                  </button>
                </div>
                
                <button
                  onClick={() => handleDeleteError(selectedError.id)}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recovery Progress */}
      {isRecovering && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-blue-500 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Recovering Error</h3>
              <p className="text-sm text-gray-600 mb-4">Attempting to recover from error...</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${recoveryProgress}%` }}
                />
              </div>
              
              <p className="text-sm text-gray-500">{recoveryProgress}% complete</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Error Boundary Component
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: ErrorInfo) => void },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorId: `boundary-${Date.now()}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorData: ErrorInfo = {
      id: `boundary-${Date.now()}`,
      timestamp: new Date(),
      type: 'error',
      category: 'system',
      message: error.message,
      stack: error.stack,
      context: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      },
      severity: 'high',
      resolved: false,
      component: 'ErrorBoundary'
    };

    this.props.onError?.(errorData);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h3>
            <p className="text-sm text-red-600 mb-4">
              An error occurred in this component. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling
export const useErrorHandling = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const logError = useCallback((error: Error, context?: Record<string, any>) => {
    const errorInfo: ErrorInfo = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'error',
      category: 'user',
      message: error.message,
      stack: error.stack,
      context,
      severity: 'medium',
      resolved: false
    };

    setErrors(prev => [...prev, errorInfo]);
    return errorInfo;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    errors,
    logError,
    clearErrors
  };
};
