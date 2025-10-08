import React, { useState, useCallback } from 'react';
// Fix: Add .ts extension to resolve module path.
import { ArtboardConfig } from '../types.ts';

interface ArtboardOrderDebuggerProps {
    configs: ArtboardConfig[];
}

export const ArtboardOrderDebugger: React.FC<ArtboardOrderDebuggerProps> = ({ configs }) => {
    const [copyText, setCopyText] = useState('Copy');

    const orderString = configs.map(c => `${c.width}x${c.height}`).join(', ');

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(orderString).then(() => {
            setCopyText('Copied!');
            setTimeout(() => setCopyText('Copy'), 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            setCopyText('Failed');
            setTimeout(() => setCopyText('Copy'), 2000);
        });
    }, [orderString]);

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '8px',
            maxWidth: '330px',
            fontFamily: 'monospace',
            fontSize: '12px',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}>
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-sm">Artboard Order ({configs.length})</h4>
                <button
                    onClick={handleCopy}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1 px-3 rounded text-xs transition-colors"
                >
                    {copyText}
                </button>
            </div>
            <div 
                style={{
                    background: '#2d3748', 
                    padding: '8px', 
                    borderRadius: '4px', 
                    wordBreak: 'break-all',
                    maxHeight: '150px',
                    overflowY: 'auto'
                }}
            >
                {orderString}
            </div>
        </div>
    );
};