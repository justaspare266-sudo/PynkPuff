import React, { useState, useRef } from 'react';
import { Layout, Move, RotateCcw, Save, Eye, EyeOff, Lock, Unlock, Grid } from 'lucide-react';

interface Panel {
  id: string;
  name: string;
  component: React.ComponentType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  locked: boolean;
  docked: 'left' | 'right' | 'bottom' | 'floating';
  order: number;
}

interface WorkspaceLayout {
  id: string;
  name: string;
  panels: Panel[];
  isDefault: boolean;
}

interface CustomizableWorkspaceProps {
  onLayoutChange: (layout: WorkspaceLayout) => void;
  onClose: () => void;
}

const DEFAULT_PANELS: Panel[] = [
  {
    id: 'toolbar',
    name: 'Toolbar',
    component: () => <div>Toolbar</div>,
    position: { x: 0, y: 0 },
    size: { width: 60, height: 400 },
    visible: true,
    locked: false,
    docked: 'left',
    order: 1
  },
  {
    id: 'properties',
    name: 'Properties',
    component: () => <div>Properties</div>,
    position: { x: 0, y: 0 },
    size: { width: 280, height: 400 },
    visible: true,
    locked: false,
    docked: 'right',
    order: 1
  },
  {
    id: 'layers',
    name: 'Layers',
    component: () => <div>Layers</div>,
    position: { x: 0, y: 0 },
    size: { width: 280, height: 300 },
    visible: true,
    locked: false,
    docked: 'right',
    order: 2
  },
  {
    id: 'history',
    name: 'History',
    component: () => <div>History</div>,
    position: { x: 0, y: 0 },
    size: { width: 280, height: 200 },
    visible: true,
    locked: false,
    docked: 'right',
    order: 3
  }
];

const PRESET_LAYOUTS: WorkspaceLayout[] = [
  {
    id: 'default',
    name: 'Default Layout',
    panels: DEFAULT_PANELS,
    isDefault: true
  },
  {
    id: 'minimal',
    name: 'Minimal',
    panels: DEFAULT_PANELS.filter(p => ['toolbar', 'properties'].includes(p.id)),
    isDefault: false
  },
  {
    id: 'advanced',
    name: 'Advanced',
    panels: [...DEFAULT_PANELS, {
      id: 'performance',
      name: 'Performance',
      component: () => <div>Performance</div>,
      position: { x: 100, y: 100 },
      size: { width: 300, height: 200 },
      visible: true,
      locked: false,
      docked: 'floating',
      order: 1
    }],
    isDefault: false
  }
];

export const CustomizableWorkspace: React.FC<CustomizableWorkspaceProps> = ({ onLayoutChange, onClose }) => {
  const [currentLayout, setCurrentLayout] = useState<WorkspaceLayout>(PRESET_LAYOUTS[0]);
  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const handlePanelDragStart = (e: React.MouseEvent, panelId: string) => {
    const panel = currentLayout.panels.find(p => p.id === panelId);
    if (!panel || panel.locked) return;

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedPanel(panelId);
  };

  const handlePanelDrag = (e: React.MouseEvent) => {
    if (!draggedPanel || !workspaceRef.current) return;

    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const newX = e.clientX - workspaceRect.left - dragOffset.x;
    const newY = e.clientY - workspaceRect.top - dragOffset.y;

    setCurrentLayout(prev => ({
      ...prev,
      panels: prev.panels.map(panel =>
        panel.id === draggedPanel
          ? { ...panel, position: { x: Math.max(0, newX), y: Math.max(0, newY) }, docked: 'floating' }
          : panel
      )
    }));
  };

  const handlePanelDragEnd = () => {
    setDraggedPanel(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const togglePanelVisibility = (panelId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      panels: prev.panels.map(panel =>
        panel.id === panelId ? { ...panel, visible: !panel.visible } : panel
      )
    }));
  };

  const togglePanelLock = (panelId: string) => {
    setCurrentLayout(prev => ({
      ...prev,
      panels: prev.panels.map(panel =>
        panel.id === panelId ? { ...panel, locked: !panel.locked } : panel
      )
    }));
  };

  const dockPanel = (panelId: string, dock: Panel['docked']) => {
    setCurrentLayout(prev => ({
      ...prev,
      panels: prev.panels.map(panel =>
        panel.id === panelId ? { ...panel, docked: dock } : panel
      )
    }));
  };

  const resetLayout = () => {
    setCurrentLayout(PRESET_LAYOUTS[0]);
  };

  const saveLayout = () => {
    const layoutName = prompt('Enter layout name:');
    if (!layoutName) return;

    const newLayout: WorkspaceLayout = {
      id: `custom-${Date.now()}`,
      name: layoutName,
      panels: [...currentLayout.panels],
      isDefault: false
    };

    onLayoutChange(newLayout);
  };

  const loadPreset = (preset: WorkspaceLayout) => {
    setCurrentLayout(preset);
  };

  const resizePanel = (panelId: string, newSize: { width: number; height: number }) => {
    setCurrentLayout(prev => ({
      ...prev,
      panels: prev.panels.map(panel =>
        panel.id === panelId ? { ...panel, size: newSize } : panel
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Layout className="w-5 h-5" />
              Workspace Layout
            </h2>
            <p className="text-sm text-gray-500">Customize your workspace by dragging panels</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={resetLayout}
              className="px-3 py-1.5 border rounded hover:bg-gray-50 flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={saveLayout}
              className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              Save Layout
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">×</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Presets</h3>
                <div className="space-y-1">
                  {PRESET_LAYOUTS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => loadPreset(preset)}
                      className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-200 ${
                        currentLayout.id === preset.id ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Panels</h3>
                <div className="space-y-1">
                  {currentLayout.panels.map(panel => (
                    <div key={panel.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm truncate">{panel.name}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePanelVisibility(panel.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {panel.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => togglePanelLock(panel.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {panel.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Docking</h3>
                <div className="grid grid-cols-2 gap-1">
                  {['left', 'right', 'bottom', 'floating'].map(dock => (
                    <button
                      key={dock}
                      onClick={() => draggedPanel && dockPanel(draggedPanel, dock as Panel['docked'])}
                      className="px-2 py-1 text-xs border rounded hover:bg-gray-50 capitalize"
                      disabled={!draggedPanel}
                    >
                      {dock}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Workspace Preview */}
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={workspaceRef}
              className={`w-full h-full relative ${showGrid ? 'bg-grid' : 'bg-gray-100'}`}
              onMouseMove={handlePanelDrag}
              onMouseUp={handlePanelDragEnd}
              style={{
                backgroundImage: showGrid ? 'radial-gradient(circle, #ccc 1px, transparent 1px)' : 'none',
                backgroundSize: showGrid ? '20px 20px' : 'auto'
              }}
            >
              {/* Docked Panels */}
              <div className="absolute inset-0 flex">
                {/* Left Dock */}
                <div className="flex flex-col">
                  {currentLayout.panels
                    .filter(p => p.docked === 'left' && p.visible)
                    .sort((a, b) => a.order - b.order)
                    .map(panel => (
                      <div
                        key={panel.id}
                        className={`bg-white border-r border-gray-200 flex items-center justify-center text-sm ${
                          panel.locked ? 'opacity-75' : 'cursor-move'
                        }`}
                        style={{ width: panel.size.width, height: panel.size.height }}
                        onMouseDown={(e) => handlePanelDragStart(e, panel.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Move className="w-4 h-4 text-gray-400" />
                          {panel.name}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Center Area */}
                <div className="flex-1 flex flex-col">
                  <div className="flex-1 bg-white border border-gray-200 m-4 rounded flex items-center justify-center text-gray-500">
                    Canvas Area
                  </div>
                  
                  {/* Bottom Dock */}
                  <div className="flex">
                    {currentLayout.panels
                      .filter(p => p.docked === 'bottom' && p.visible)
                      .sort((a, b) => a.order - b.order)
                      .map(panel => (
                        <div
                          key={panel.id}
                          className={`bg-white border-t border-gray-200 flex items-center justify-center text-sm ${
                            panel.locked ? 'opacity-75' : 'cursor-move'
                          }`}
                          style={{ width: panel.size.width, height: panel.size.height }}
                          onMouseDown={(e) => handlePanelDragStart(e, panel.id)}
                        >
                          <div className="flex items-center gap-2">
                            <Move className="w-4 h-4 text-gray-400" />
                            {panel.name}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Right Dock */}
                <div className="flex flex-col">
                  {currentLayout.panels
                    .filter(p => p.docked === 'right' && p.visible)
                    .sort((a, b) => a.order - b.order)
                    .map(panel => (
                      <div
                        key={panel.id}
                        className={`bg-white border-l border-gray-200 flex items-center justify-center text-sm ${
                          panel.locked ? 'opacity-75' : 'cursor-move'
                        }`}
                        style={{ width: panel.size.width, height: panel.size.height }}
                        onMouseDown={(e) => handlePanelDragStart(e, panel.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Move className="w-4 h-4 text-gray-400" />
                          {panel.name}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Floating Panels */}
              {currentLayout.panels
                .filter(p => p.docked === 'floating' && p.visible)
                .map(panel => (
                  <div
                    key={panel.id}
                    className={`absolute bg-white border border-gray-300 rounded shadow-lg flex items-center justify-center text-sm ${
                      panel.locked ? 'opacity-75' : 'cursor-move'
                    } ${draggedPanel === panel.id ? 'shadow-xl z-10' : ''}`}
                    style={{
                      left: panel.position.x,
                      top: panel.position.y,
                      width: panel.size.width,
                      height: panel.size.height
                    }}
                    onMouseDown={(e) => handlePanelDragStart(e, panel.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Move className="w-4 h-4 text-gray-400" />
                      {panel.name}
                    </div>
                    
                    {/* Resize Handle */}
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 bg-gray-300 cursor-se-resize"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        // Handle resize logic here
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};