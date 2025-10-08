import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  details?: string;
}

export const SecurityAudit: React.FC = () => {
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const runSecurityAudit = async () => {
    setIsRunning(true);
    const auditChecks: SecurityCheck[] = [];

    // Check for HTTPS
    auditChecks.push({
      id: 'https',
      name: 'HTTPS Connection',
      description: 'Ensure secure connection is used',
      status: location.protocol === 'https:' ? 'pass' : 'warning',
      details: location.protocol === 'https:' ? 'Connection is secure' : 'Consider using HTTPS in production'
    });

    // Check for Content Security Policy
    auditChecks.push({
      id: 'csp',
      name: 'Content Security Policy',
      description: 'Check for CSP headers',
      status: document.querySelector('meta[http-equiv="Content-Security-Policy"]') ? 'pass' : 'warning',
      details: 'CSP helps prevent XSS attacks'
    });

    // Check localStorage usage
    const localStorageSize = JSON.stringify(localStorage).length;
    auditChecks.push({
      id: 'localStorage',
      name: 'Local Storage Usage',
      description: 'Monitor local storage for sensitive data',
      status: localStorageSize > 1024 * 1024 ? 'warning' : 'pass',
      details: `Using ${(localStorageSize / 1024).toFixed(1)}KB of local storage`
    });

    // Check for inline scripts
    const inlineScripts = document.querySelectorAll('script:not([src])').length;
    auditChecks.push({
      id: 'inlineScripts',
      name: 'Inline Scripts',
      description: 'Minimize inline JavaScript',
      status: inlineScripts > 2 ? 'warning' : 'pass',
      details: `Found ${inlineScripts} inline scripts`
    });

    // Check for mixed content
    const mixedContent = Array.from(document.querySelectorAll('img, script, link')).some(
      el => el.getAttribute('src')?.startsWith('http:') || el.getAttribute('href')?.startsWith('http:')
    );
    auditChecks.push({
      id: 'mixedContent',
      name: 'Mixed Content',
      description: 'Check for insecure resources',
      status: mixedContent ? 'fail' : 'pass',
      details: mixedContent ? 'Found insecure HTTP resources' : 'All resources use secure connections'
    });

    // Check for sensitive data in URLs
    const sensitiveParams = ['password', 'token', 'key', 'secret'];
    const hasSensitiveParams = sensitiveParams.some(param => 
      location.search.toLowerCase().includes(param)
    );
    auditChecks.push({
      id: 'urlSecurity',
      name: 'URL Security',
      description: 'Check for sensitive data in URLs',
      status: hasSensitiveParams ? 'fail' : 'pass',
      details: hasSensitiveParams ? 'Sensitive parameters found in URL' : 'No sensitive data in URL'
    });

    // Check for console errors
    const originalError = console.error;
    let errorCount = 0;
    console.error = (...args) => {
      errorCount++;
      originalError(...args);
    };

    setTimeout(() => {
      console.error = originalError;
      auditChecks.push({
        id: 'consoleErrors',
        name: 'Console Errors',
        description: 'Monitor for JavaScript errors',
        status: errorCount > 5 ? 'warning' : 'pass',
        details: `${errorCount} console errors detected`
      });

      setChecks(auditChecks);
      setIsRunning(false);
    }, 1000);
  };

  useEffect(() => {
    if (showAudit && checks.length === 0) {
      runSecurityAudit();
    }
  }, [showAudit]);

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'fail':
        return <X className="text-red-500" size={16} />;
    }
  };

  const getStatusColor = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'fail':
        return 'border-red-200 bg-red-50';
    }
  };

  const passCount = checks.filter(c => c.status === 'pass').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const failCount = checks.filter(c => c.status === 'fail').length;

  if (!showAudit) {
    return (
      <motion.button
        onClick={() => setShowAudit(true)}
        className="fixed top-4 left-4 z-40 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Security Audit"
      >
        <Shield size={16} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-4 left-4 z-40 bg-white rounded-lg shadow-xl p-4 w-96 max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Shield size={16} />
          Security Audit
        </h3>
        <button
          onClick={() => setShowAudit(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>

      {isRunning ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3">Running security audit...</span>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-lg font-bold text-green-600">{passCount}</div>
              <div className="text-xs text-green-600">Passed</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded">
              <div className="text-lg font-bold text-yellow-600">{warningCount}</div>
              <div className="text-xs text-yellow-600">Warnings</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="text-lg font-bold text-red-600">{failCount}</div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
          </div>

          {/* Checks */}
          <div className="space-y-2">
            {checks.map(check => (
              <div
                key={check.id}
                className={`p-3 rounded-lg border ${getStatusColor(check.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{check.name}</h4>
                    <p className="text-xs text-gray-600 mb-1">{check.description}</p>
                    {check.details && (
                      <p className="text-xs text-gray-500">{check.details}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={runSecurityAudit}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 text-sm"
            >
              Run Audit Again
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};