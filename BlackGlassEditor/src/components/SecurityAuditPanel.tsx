'use client';

import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { ToolPanel } from './ToolPanel';
import { SecurityAudit } from './SecurityAudit';
import { Shield } from 'lucide-react';

export function SecurityAuditPanel() {
  const { state, actions } = useEditor();

  const openPanel = () => {
    actions.openToolPanel('security-audit', { x: 1300, y: 100 });
  };

  const handleSecurityFix = (fix: any) => {
    console.log('Security fix applied:', fix);
    // Apply security fixes
  };

  const handleClose = () => {
    actions.closeToolPanel('security-audit');
  };

  return (
    <>
      <button
        onClick={openPanel}
        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all text-gray-300 hover:bg-gray-700"
        title="Security Audit"
      >
        <Shield className="w-5 h-5" />
      </button>

      {state.toolPanels['security-audit']?.isOpen && (
        <ToolPanel toolId="security-audit" title="Security Audit">
          <SecurityAudit 
            onSecurityFix={handleSecurityFix}
            onClose={handleClose}
          />
        </ToolPanel>
      )}
    </>
  );
}
