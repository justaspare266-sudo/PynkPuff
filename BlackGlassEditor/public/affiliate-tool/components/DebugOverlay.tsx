import React from 'react';
// Fix: Add .ts extension to resolve module path.
import { ElementName, ArtboardLayout } from '../types.ts';

interface DebugOverlayProps {
    info: {
        element: ElementName | null;
        layout: Partial<ArtboardLayout> | null;
    };
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ info }) => {
    const formatValue = (value: number | undefined) => value !== undefined ? Math.round(value) : 'N/A';

    return (
        <div 
            style={{
                position: 'fixed',
                top: '10px',
                left: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: '#FFFFFF',
                padding: '8px 12px',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '14px',
                zIndex: 9999,
                pointerEvents: 'none',
                lineHeight: '1.6',
                boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                minWidth: '200px',
            }}
        >
            <h3 style={{ margin: '0 0 4px 0', padding: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #555' }}>
                Debug Info
            </h3>
            {info.element && info.layout ? (
                <>
                    <div><strong>Selected:</strong> <span style={{ color: '#76D7C4' }}>{info.element}</span></div>
                    <div><strong>X:</strong> <span style={{ color: '#F7DC6F', minWidth: '50px', display: 'inline-block' }}>{formatValue(info.layout.x)}</span></div>
                    <div><strong>Y:</strong> <span style={{ color: '#F7DC6F', minWidth: '50px', display: 'inline-block' }}>{formatValue(info.layout.y)}</span></div>
                    <div><strong>W:</strong> <span style={{ color: '#85C1E9', minWidth: '50px', display: 'inline-block' }}>{formatValue(info.layout.width)}</span></div>
                    <div><strong>H:</strong> <span style={{ color: '#85C1E9', minWidth: '50px', display: 'inline-block' }}>{formatValue(info.layout.height)}</span></div>
                </>
            ) : (
                <div><strong>Selected:</strong> <span style={{ color: '#E57373' }}>None</span></div>
            )}
        </div>
    );
};