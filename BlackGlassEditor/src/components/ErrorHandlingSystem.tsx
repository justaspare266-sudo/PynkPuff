'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X, RefreshCw, Bug, Info, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export interface ErrorInfo {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  details?: string;
  timestamp: number;
  source: string;
  stack?: string;
  recoverable: boolean;
  action?: {
    label: string;
    handler: () => void;
  };
}

export interface ErrorHandlingSystemProps {
  errors: ErrorInfo[];
  onErrorDismiss: (errorId: string) => void;
  onErrorRetry: (errorId: string) => void;
  onErrorReport: (errorId: string) => void;
  onClearAll: () => void;
  className?: string;
}

const ErrorHandlingSystem: React.FC<ErrorHandlingSystemProps> = ({
  errors,
  onErrorDismiss,
  onErrorRetry,
  onErrorReport,
  onClearAll,
  className = ''
}) => {
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);

  const getErrorIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'success':
        return CheckCircle;
      default:
        return AlertCircle;
    }
  };

  const getErrorColor = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return 'text-red-400 bg-red-900 bg-opacity-20 border-red-500';
      case 'warning':
        return 'text-yellow-400 bg-yellow-900 bg-opacity-20 border-yellow-500';
      case 'info':
        return 'text-blue-400 bg-blue-900 bg-opacity-20 border-blue-500';
      case 'success':
        return 'text-green-400 bg-green-900 bg-opacity-20 border-green-500';
      default:
        return 'text-gray-400 bg-gray-900 bg-opacity-20 border-gray-500';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const toggleErrorExpansion = (errorId: string) => {
    setExpandedErrors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(errorId)) {
        newSet.delete(errorId);
      } else {
        newSet.add(errorId);
      }
      return newSet;
    });
  };

  const handleRetry = (errorId: string) => {
    onErrorRetry(errorId);
  };

  const handleReport = (errorId: string) => {
    onErrorReport(errorId);
  };

  const handleDismiss = (errorId: string) => {
    onErrorDismiss(errorId);
  };

  const getErrorCounts = () => {
    return errors.reduce((counts, error) => {
      counts[error.type] = (counts[error.type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  };

  const errorCounts = getErrorCounts();
  const hasErrors = errors.length > 0;

  if (!hasErrors) {
    return (
      <div className={`error-handling-system ${className}`}>
        <div className="flex items-center justify-center p-4 text-gray-500">
          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
          <span className="text-sm">No errors or warnings</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`error-handling-system ${className}`}>
      {/* Error Summary */}
      <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-300">System Status</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-gray-300"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button
              onClick={onClearAll}
              className="text-xs px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-white"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-xs">
          {errorCounts.error > 0 && (
            <div className="flex items-center space-x-1 text-red-400">
              <XCircle className="w-3 h-3" />
              <span>{errorCounts.error} errors</span>
            </div>
          )}
          {errorCounts.warning > 0 && (
            <div className="flex items-center space-x-1 text-yellow-400">
              <AlertTriangle className="w-3 h-3" />
              <span>{errorCounts.warning} warnings</span>
            </div>
          )}
          {errorCounts.info > 0 && (
            <div className="flex items-center space-x-1 text-blue-400">
              <Info className="w-3 h-3" />
              <span>{errorCounts.info} info</span>
            </div>
          )}
          {errorCounts.success > 0 && (
            <div className="flex items-center space-x-1 text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>{errorCounts.success} success</span>
            </div>
          )}
        </div>
      </div>

      {/* Error List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {errors.map(error => {
          const IconComponent = getErrorIcon(error.type);
          const isExpanded = expandedErrors.has(error.id);
          const colorClass = getErrorColor(error.type);

          return (
            <div
              key={error.id}
              className={`p-3 rounded-lg border ${colorClass} transition-all duration-200`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <IconComponent className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{error.title}</h4>
                      <span className="text-xs opacity-75">{formatTimestamp(error.timestamp)}</span>
                    </div>
                    <p className="text-xs opacity-90 mb-2">{error.message}</p>
                    <div className="text-xs opacity-75">
                      Source: <span className="font-mono">{error.source}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  {error.details && (
                    <button
                      onClick={() => toggleErrorExpansion(error.id)}
                      className="p-1 hover:bg-gray-700 rounded text-xs"
                      title={isExpanded ? 'Hide details' : 'Show details'}
                    >
                      {isExpanded ? '−' : '+'}
                    </button>
                  )}
                  
                  {error.recoverable && (
                    <button
                      onClick={() => handleRetry(error.id)}
                      className="p-1 hover:bg-gray-700 rounded text-xs"
                      title="Retry"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleReport(error.id)}
                    className="p-1 hover:bg-gray-700 rounded text-xs"
                    title="Report issue"
                  >
                    <Bug className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={() => handleDismiss(error.id)}
                    className="p-1 hover:bg-gray-700 rounded text-xs"
                    title="Dismiss"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && error.details && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                  <div className="text-xs font-mono whitespace-pre-wrap bg-black bg-opacity-20 p-2 rounded">
                    {error.details}
                  </div>
                  {error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer hover:underline">
                        Stack Trace
                      </summary>
                      <div className="text-xs font-mono whitespace-pre-wrap bg-black bg-opacity-20 p-2 rounded mt-1">
                        {error.stack}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {/* Action Button */}
              {error.action && (
                <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                  <button
                    onClick={error.action.handler}
                    className="text-xs px-3 py-1 bg-current bg-opacity-20 hover:bg-opacity-30 rounded"
                  >
                    {error.action.label}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global Actions */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>
            Total: {errors.length} issues
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                // Auto-retry all recoverable errors
                errors
                  .filter(error => error.recoverable)
                  .forEach(error => handleRetry(error.id));
              }}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white"
            >
              Retry All
            </button>
            <button
              onClick={() => {
                // Report all errors
                errors.forEach(error => handleReport(error.id));
              }}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-white"
            >
              Report All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingSystem;
