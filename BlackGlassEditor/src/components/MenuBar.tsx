'use client';

import React, { useState, useCallback } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { 
  FileText, 
  Eye, 
  Image, 
  Wrench, 
  Settings,
  Plus,
  FolderOpen,
  Save,
  Download,
  Upload,
  Crop,
  RotateCw,
  Filter,
  Palette,
  Layers,
  Grid3X3,
  Ruler,
  EyeOff,
  Zap,
  Link,
  History,
  AlertTriangle,
  FolderOpen as AssetManager,
  Palette as ColorTool,
  Clock,
  Star,
  Filter as FilterIcon,
  Type,
  Square,
  Image as ImageIcon,
  Download as ExportIcon,
  Activity,
  Brain,
  LayoutTemplate,
  Smartphone,
  Shield,
  TestTube,
  Link as ExternalLink,
  Rocket,
  MemoryStick,
  Layout,
  Cloud,
  Droplets,
  RotateCcw
} from 'lucide-react';
import { EnhancedContextMenu } from './EnhancedContextMenu';

export function MenuBar() {
  const { state, actions } = useEditor();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleMenuClick = useCallback((menuName: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left,
      y: rect.bottom + 5
    });
    setActiveMenu(activeMenu === menuName ? null : menuName);
  }, [activeMenu]);

  const handleMenuClose = useCallback(() => {
    setActiveMenu(null);
  }, []);

  const handleAction = useCallback((actionId: string, elementId?: string) => {
    console.log('Menu action:', actionId, elementId);
    // Handle menu actions here
    setActiveMenu(null);
  }, []);

  // File Menu Actions
  const getFileMenuActions = useCallback(() => [
    {
      id: 'new',
      label: 'New Project',
      icon: Plus,
      shortcut: 'Ctrl+N',
      action: () => {
        actions.newProject();
        handleAction('new');
      }
    },
    {
      id: 'open',
      label: 'Open Project',
      icon: FolderOpen,
      shortcut: 'Ctrl+O',
      action: () => {
        // Handle open project
        handleAction('open');
      }
    },
    {
      id: 'save',
      label: 'Save Project',
      icon: Save,
      shortcut: 'Ctrl+S',
      action: () => {
        // Handle save project
        handleAction('save');
      }
    },
    { id: 'separator1', label: '', icon: Square, separator: true, action: () => {} },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      submenu: [
        {
          id: 'export-png',
          label: 'Export as PNG',
          icon: ImageIcon,
          action: () => handleAction('export-png')
        },
        {
          id: 'export-svg',
          label: 'Export as SVG',
          icon: FileText,
          action: () => handleAction('export-svg')
        },
        {
          id: 'export-pdf',
          label: 'Export as PDF',
          icon: FileText,
          action: () => handleAction('export-pdf')
        },
        {
          id: 'export-json',
          label: 'Export as JSON',
          icon: FileText,
          action: () => handleAction('export-json')
        }
      ],
      action: () => {}
    },
    {
      id: 'import',
      label: 'Import Assets',
      icon: Upload,
      action: () => handleAction('import')
    },
    { id: 'separator2', label: '', icon: Square, separator: true, action: () => {} },
    {
      id: 'auto-save',
      label: 'Auto Save System',
      icon: Save,
      action: () => {
        actions.openToolPanel('auto-save-system', { x: 100, y: 100 });
        handleAction('auto-save');
      }
    },
    {
      id: 'cloud-sync',
      label: 'Cloud Sync',
      icon: Cloud,
      action: () => {
        actions.openToolPanel('cloud-sync', { x: 100, y: 100 });
        handleAction('cloud-sync');
      }
    }
  ], [actions, handleAction]);

  // View Menu Actions
  const getViewMenuActions = useCallback(() => [
    {
      id: 'toggle-toolbar',
      label: 'Toggle Toolbar',
      icon: Wrench,
      action: () => handleAction('toggle-toolbar')
    },
    {
      id: 'toggle-panels',
      label: 'Toggle Panels',
      icon: Eye,
      action: () => handleAction('toggle-panels')
    },
    { id: 'separator1', label: '', icon: Square, separator: true, action: () => {} },
    {
      id: 'toggle-grid',
      label: 'Toggle Grid',
      icon: Grid3X3,
      action: () => handleAction('toggle-grid')
    },
    {
      id: 'toggle-rulers',
      label: 'Toggle Rulers',
      icon: Ruler,
      action: () => handleAction('toggle-rulers')
    },
    {
      id: 'toggle-guides',
      label: 'Toggle Guides',
      icon: EyeOn,
      action: () => handleAction('toggle-guides')
    },
    {
      id: 'artboard-manager',
      label: 'Artboard Manager',
      icon: Layout,
      action: () => {
        actions.openToolPanel('artboard-manager', { x: 100, y: 100 });
        handleAction('artboard-manager');
      }
    }
  ], [handleAction]);

  // Image Menu Actions
  const getImageMenuActions = useCallback(() => [
    {
      id: 'crop',
      label: 'Crop Tool',
      icon: Crop,
      action: () => {
        actions.setSelectedTool('crop');
        handleAction('crop');
      }
    },
    {
      id: 'resize',
      label: 'Resize',
      icon: RotateCw,
      action: () => handleAction('resize')
    },
    { id: 'separator1', label: '', icon: Square, separator: true, action: () => {} },
    {
      id: 'filters',
      label: 'Filters',
      icon: Filter,
      action: () => {
        actions.openToolPanel('enhancedFilterTool', { x: 100, y: 100 });
        handleAction('filters');
      }
    },
    {
      id: 'adjustments',
      label: 'Adjustments',
      icon: Palette,
      action: () => {
        actions.openToolPanel('enhancedColorTool', { x: 100, y: 100 });
        handleAction('adjustments');
      }
    },
    {
      id: 'transform',
      label: 'Transform',
      icon: RotateCw,
      action: () => handleAction('transform')
    }
  ], [actions, handleAction]);

  // Icons Menu Actions
  const getIconsMenuActions = useCallback(() => [
    {
      id: 'icon-library',
      label: 'Icon Library',
      icon: ImageIcon,
      action: () => {
        actions.openToolPanel('icon-library', { x: 100, y: 100 });
        handleAction('icon-library');
      }
    }
  ], [actions, handleAction]);

  // Measurement Menu Actions
  const getMeasurementMenuActions = useCallback(() => [
    {
      id: 'measurement-tool',
      label: 'Measurement Tool',
      icon: Ruler,
      action: () => {
        actions.openToolPanel('measurement-tool', { x: 100, y: 100 });
        handleAction('measurement-tool');
      }
    },
    {
      id: 'measurement-system',
      label: 'Measurement System',
      icon: Settings,
      action: () => {
        actions.openToolPanel('measurement-system', { x: 100, y: 100 });
        handleAction('measurement-system');
      }
    }
  ], [actions, handleAction]);

  // Performance Menu Actions
  const getPerformanceMenuActions = useCallback(() => [
    {
      id: 'performance-monitor',
      label: 'Performance Monitor',
      icon: Activity,
      action: () => {
        actions.openToolPanel('performance-monitor', { x: 100, y: 100 });
        handleAction('performance-monitor');
      }
    }
  ], [actions, handleAction]);

  // Color Menu Actions
  const getColorMenuActions = useCallback(() => [
    {
      id: 'color-management',
      label: 'Color Management',
      icon: Palette,
      action: () => {
        actions.openToolPanel('color-management', { x: 100, y: 100 });
        handleAction('color-management');
      }
    },
    {
      id: 'color-palette',
      label: 'Color Palette',
      icon: Droplets,
      action: () => {
        actions.openToolPanel('color-palette', { x: 100, y: 100 });
        handleAction('color-palette');
      }
    },
    {
      id: 'color-harmony',
      label: 'Color Harmony',
      icon: RotateCcw,
      action: () => {
        actions.openToolPanel('color-harmony', { x: 100, y: 100 });
        handleAction('color-harmony');
      }
    },
    {
      id: 'enhanced-color-tool',
      label: 'Enhanced Color Tool',
      icon: Palette,
      action: () => {
        actions.openToolPanel('enhancedColorTool', { x: 100, y: 100 });
        handleAction('enhanced-color-tool');
      }
    },
    {
      id: 'advanced-font-selector',
      label: 'Advanced Font Selector',
      icon: Type,
      action: () => {
        actions.openToolPanel('advanced-font-selector', { x: 100, y: 100 });
        handleAction('advanced-font-selector');
      }
    },
    {
      id: 'font-preview',
      label: 'Font Preview',
      icon: Eye,
      action: () => {
        actions.openToolPanel('font-preview', { x: 100, y: 100 });
        handleAction('font-preview');
      }
    }
  ], [actions, handleAction]);

  // Tools Menu Actions
  const getToolsMenuActions = useCallback(() => [
    {
      id: 'enhanced-tools',
      label: 'Enhanced Tools',
      icon: Zap,
      submenu: [
        {
          id: 'enhanced-text',
          label: 'Enhanced Text Tool',
          icon: Type,
          action: () => {
            actions.openToolPanel('enhancedTextTool', { x: 100, y: 100 });
            handleAction('enhanced-text');
          }
        },
        {
          id: 'enhanced-shape',
          label: 'Enhanced Shape Tool',
          icon: Square,
          action: () => {
            actions.openToolPanel('enhancedShapeTool', { x: 100, y: 100 });
            handleAction('enhanced-shape');
          }
        },
        {
          id: 'enhanced-image',
          label: 'Enhanced Image Tool',
          icon: ImageIcon,
          action: () => {
            actions.openToolPanel('enhancedImageTool', { x: 100, y: 100 });
            handleAction('enhanced-image');
          }
        },
        {
          id: 'enhanced-filter',
          label: 'Enhanced Filter Tool',
          icon: FilterIcon,
          action: () => {
            actions.openToolPanel('enhancedFilterTool', { x: 100, y: 100 });
            handleAction('enhanced-filter');
          }
        }
      ],
      action: () => {}
    },
    {
      id: 'animation-tools',
      label: 'Animation Tools',
      icon: Clock,
      submenu: [
        {
          id: 'animation-timeline',
          label: 'Animation Timeline',
          icon: Clock,
          action: () => {
            actions.openToolPanel('animationTimeline', { x: 100, y: 100 });
            handleAction('animation-timeline');
          }
        },
        {
          id: 'animation-presets',
          label: 'Animation Presets',
          icon: Star,
          action: () => {
            actions.openToolPanel('animationPresets', { x: 100, y: 100 });
            handleAction('animation-presets');
          }
        }
      ],
      action: () => {}
    },
    {
      id: 'system-tools',
      label: 'System Tools',
      icon: Settings,
      submenu: [
        {
          id: 'asset-manager',
          label: 'Asset Manager',
          icon: AssetManager,
          action: () => {
            actions.openToolPanel('enhancedAssetManager', { x: 100, y: 100 });
            handleAction('asset-manager');
          }
        },
        {
          id: 'color-tool',
          label: 'Color Tool',
          icon: ColorTool,
          action: () => {
            actions.openToolPanel('enhancedColorTool', { x: 100, y: 100 });
            handleAction('color-tool');
          }
        },
        {
          id: 'layer-manager',
          label: 'Layer Manager',
          icon: Layers,
          action: () => {
            actions.openToolPanel('enhancedLayerManager', { x: 100, y: 100 });
            handleAction('layer-manager');
          }
        },
        {
          id: 'history-manager',
          label: 'History Manager',
          icon: History,
          action: () => {
            actions.openToolPanel('enhancedHistoryManager', { x: 100, y: 100 });
            handleAction('history-manager');
          }
        },
        {
          id: 'error-handling',
          label: 'Error Handling',
          icon: AlertTriangle,
          action: () => {
            actions.openToolPanel('enhancedErrorHandling', { x: 100, y: 100 });
            handleAction('error-handling');
          }
        }
      ],
      action: () => {}
    },
    {
      id: 'professional-tools',
      label: 'Professional Tools',
      icon: Star,
      submenu: [
        {
          id: 'performance-monitor',
          label: 'Performance Monitor',
          icon: Activity,
          action: () => {
            actions.openToolPanel('performanceMonitor', { x: 100, y: 100 });
            handleAction('performance-monitor');
          }
        },
        {
          id: 'ai-suggestions',
          label: 'AI Suggestions',
          icon: Brain,
          action: () => {
            actions.openToolPanel('aiDesignSuggestions', { x: 100, y: 100 });
            handleAction('ai-suggestions');
          }
        },
        {
          id: 'project-templates',
          label: 'Project Templates',
          icon: LayoutTemplate,
          action: () => {
            actions.openToolPanel('projectTemplates', { x: 100, y: 100 });
            handleAction('project-templates');
          }
        },
        {
          id: 'responsive-design',
          label: 'Responsive Design',
          icon: Smartphone,
          action: () => {
            actions.openToolPanel('responsiveDesign', { x: 100, y: 100 });
            handleAction('responsive-design');
          }
        },
        {
          id: 'security-audit',
          label: 'Security Audit',
          icon: Shield,
          action: () => {
            actions.openToolPanel('securityAudit', { x: 100, y: 100 });
            handleAction('security-audit');
          }
        },
        {
          id: 'testing-suite',
          label: 'Testing Suite',
          icon: TestTube,
          action: () => {
            actions.openToolPanel('testingSuite', { x: 100, y: 100 });
            handleAction('testing-suite');
          }
        },
        {
          id: 'external-integrations',
          label: 'External Integrations',
          icon: ExternalLink,
          action: () => {
            actions.openToolPanel('externalIntegrations', { x: 100, y: 100 });
            handleAction('external-integrations');
          }
        },
        {
          id: 'deployment-manager',
          label: 'Deployment Manager',
          icon: Rocket,
          action: () => {
            actions.openToolPanel('deployment-manager', { x: 100, y: 100 });
            handleAction('deployment-manager');
          }
        },
        {
          id: 'memory-manager',
          label: 'Memory Manager',
          icon: MemoryStick,
          action: () => {
            actions.openToolPanel('enhanced-memory-manager', { x: 100, y: 100 });
            handleAction('memory-manager');
          }
        },
        {
          id: 'batch-processing',
          label: 'Batch Processing',
          icon: Zap,
          action: () => {
            actions.openToolPanel('batch-processing', { x: 100, y: 100 });
            handleAction('batch-processing');
          }
        }
      ],
      action: () => {}
    }
  ], [actions, handleAction]);

  const getCurrentMenuActions = () => {
    switch (activeMenu) {
      case 'file': return getFileMenuActions();
      case 'view': return getViewMenuActions();
      case 'image': return getImageMenuActions();
      case 'icons': return getIconsMenuActions();
      case 'measurement': return getMeasurementMenuActions();
      case 'performance': return getPerformanceMenuActions();
      case 'color': return getColorMenuActions();
      case 'tools': return getToolsMenuActions();
      default: return [];
    }
  };

  const menuItems = [
    { id: 'file', label: 'File', icon: FileText },
    { id: 'view', label: 'View', icon: Eye },
    { id: 'image', label: 'Image', icon: Image },
    { id: 'icons', label: 'Icons', icon: ImageIcon },
    { id: 'measurement', label: 'Measurement', icon: Ruler },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'color', label: 'Color', icon: Palette },
    { id: 'tools', label: 'Tools', icon: Wrench }
  ];

  return (
    <>
      <div className="flex items-center bg-gray-800 border-b border-gray-700 px-4 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={(e) => handleMenuClick(item.id, e)}
              className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                activeMenu === item.id 
                  ? 'bg-gray-700 text-white' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <EnhancedContextMenu
        isOpen={activeMenu !== null}
        x={menuPosition.x}
        y={menuPosition.y}
        selectedElementIds={[]}
        onClose={handleMenuClose}
        onAction={handleAction}
        onCopy={() => {}}
        onCut={() => {}}
        onPaste={() => {}}
        onDelete={() => {}}
        onDuplicate={() => {}}
        onGroup={() => {}}
        onUngroup={() => {}}
        onBringToFront={() => {}}
        onSendToBack={() => {}}
        onBringForward={() => {}}
        onSendBackward={() => {}}
        onFlipHorizontal={() => {}}
        onFlipVertical={() => {}}
        onRotate90={() => {}}
        onRotate180={() => {}}
        onRotate270={() => {}}
        onToggleVisibility={() => {}}
        onToggleLock={() => {}}
        onAlignLeft={() => {}}
        onAlignCenter={() => {}}
        onAlignRight={() => {}}
        onAlignTop={() => {}}
        onAlignMiddle={() => {}}
        onAlignBottom={() => {}}
        onDistributeHorizontal={() => {}}
        onDistributeVertical={() => {}}
        onExport={() => {}}
        onProperties={() => {}}
      />
    </>
  );
}
