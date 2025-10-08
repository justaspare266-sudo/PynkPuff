import React, { useState, useEffect } from 'react';
import { Layers, Link, Unlink, RotateCcw, Copy, Eye, EyeOff, Lock, Unlock, Zap } from 'lucide-react';

interface SmartObject {
  id: string;
  name: string;
  type: 'image' | 'text' | 'shape' | 'group' | 'filter' | 'adjustment';
  originalData: any;
  transformations: Transformation[];
  filters: Filter[];
  adjustments: Adjustment[];
  isLinked: boolean;
  linkedObjects: string[];
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  maskData?: ImageData;
  smartFeatures: {
    autoEnhance: boolean;
    contentAware: boolean;
    adaptiveFilters: boolean;
    intelligentCrop: boolean;
  };
}

interface Transformation {
  id: string;
  type: 'scale' | 'rotate' | 'translate' | 'skew' | 'perspective';
  values: Record<string, number>;
  timestamp: Date;
  reversible: boolean;
}

interface Filter {
  id: string;
  name: string;
  type: 'blur' | 'sharpen' | 'noise' | 'artistic' | 'color' | 'distort';
  parameters: Record<string, any>;
  enabled: boolean;
  intensity: number;
}

interface Adjustment {
  id: string;
  name: string;
  type: 'brightness' | 'contrast' | 'saturation' | 'hue' | 'levels' | 'curves';
  values: Record<string, number>;
  enabled: boolean;
}

interface SmartObjectsProps {
  objects: any[];
  onObjectUpdate: (objectId: string, updates: Partial<SmartObject>) => void;
  onClose: () => void;
}

export const SmartObjects: React.FC<SmartObjectsProps> = ({
  objects,
  onObjectUpdate,
  onClose
}) => {
  const [smartObjects, setSmartObjects] = useState<SmartObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<SmartObject | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState<'original' | 'current' | 'split'>('current');

  useEffect(() => {
    // Convert regular objects to smart objects
    const converted = objects.map(obj => convertToSmartObject(obj));
    setSmartObjects(converted);
  }, [objects]);

  const convertToSmartObject = (obj: any): SmartObject => {
    return {
      id: obj.id || `smart-${Date.now()}`,
      name: obj.name || `Smart Object ${smartObjects.length + 1}`,
      type: obj.type || 'image',
      originalData: { ...obj },
      transformations: [],
      filters: [],
      adjustments: [],
      isLinked: false,
      linkedObjects: [],
      visible: obj.visible !== false,
      locked: obj.locked || false,
      opacity: obj.opacity || 1,
      blendMode: obj.blendMode || 'normal',
      smartFeatures: {
        autoEnhance: false,
        contentAware: true,
        adaptiveFilters: false,
        intelligentCrop: false
      }
    };
  };

  const _addTransformation = (objectId: string, transformation: Omit<Transformation, 'id' | 'timestamp'>) => {
    const newTransformation: Transformation = {
      ...transformation,
      id: `transform-${Date.now()}`,
      timestamp: new Date()
    };

    setSmartObjects(prev => prev.map(obj =>
      obj.id === objectId
        ? { ...obj, transformations: [...obj.transformations, newTransformation] }
        : obj
    ));
  };

  const addFilter = (objectId: string, filter: Omit<Filter, 'id'>) => {
    const newFilter: Filter = {
      ...filter,
      id: `filter-${Date.now()}`
    };

    setSmartObjects(prev => prev.map(obj =>
      obj.id === objectId
        ? { ...obj, filters: [...obj.filters, newFilter] }
        : obj
    ));
  };

  const addAdjustment = (objectId: string, adjustment: Omit<Adjustment, 'id'>) => {
    const newAdjustment: Adjustment = {
      ...adjustment,
      id: `adjustment-${Date.now()}`
    };

    setSmartObjects(prev => prev.map(obj =>
      obj.id === objectId
        ? { ...obj, adjustments: [...obj.adjustments, newAdjustment] }
        : obj
    ));
  };

  const linkObjects = (objectIds: string[]) => {
    setSmartObjects(prev => prev.map(obj =>
      objectIds.includes(obj.id)
        ? { ...obj, isLinked: true, linkedObjects: objectIds.filter(id => id !== obj.id) }
        : obj
    ));
  };

  const unlinkObject = (objectId: string) => {
    setSmartObjects(prev => prev.map(obj =>
      obj.id === objectId || obj.linkedObjects.includes(objectId)
        ? { ...obj, isLinked: false, linkedObjects: [] }
        : obj
    ));
  };

  const resetToOriginal = (objectId: string) => {
    setSmartObjects(prev => prev.map(obj =>
      obj.id === objectId
        ? {
            ...obj,
            transformations: [],
            filters: [],
            adjustments: [],
            opacity: 1,
            blendMode: 'normal'
          }
        : obj
    ));
  };

  const duplicateSmartObject = (objectId: string) => {
    const original = smartObjects.find(obj => obj.id === objectId);
    if (!original) return;

    const duplicate: SmartObject = {
      ...original,
      id: `smart-${Date.now()}`,
      name: `${original.name} Copy`,
      isLinked: false,
      linkedObjects: []
    };

    setSmartObjects(prev => [...prev, duplicate]);
  };

  const toggleSmartFeature = (objectId: string, feature: keyof SmartObject['smartFeatures']) => {
    setSmartObjects(prev => prev.map(obj =>
      obj.id === objectId
        ? {
            ...obj,
            smartFeatures: {
              ...obj.smartFeatures,
              [feature]: !obj.smartFeatures[feature]
            }
          }
        : obj
    ));
  };

  const getObjectIcon = (type: SmartObject['type']) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'text': return '📝';
      case 'shape': return '🔷';
      case 'group': return '📁';
      case 'filter': return '🎨';
      case 'adjustment': return '⚙️';
      default: return '📄';
    }
  };

  const getBlendModes = () => [
    'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light',
    'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion'
  ];

  const getFilterPresets = () => [
    { name: 'Blur', type: 'blur', parameters: { radius: 5 } },
    { name: 'Sharpen', type: 'sharpen', parameters: { amount: 1.5 } },
    { name: 'Noise Reduction', type: 'noise', parameters: { strength: 0.5 } },
    { name: 'Vintage', type: 'artistic', parameters: { sepia: 0.3, vignette: 0.2 } },
    { name: 'Black & White', type: 'color', parameters: { saturation: 0 } }
  ];

  const getAdjustmentPresets = () => [
    { name: 'Brightness', type: 'brightness', values: { brightness: 0 } },
    { name: 'Contrast', type: 'contrast', values: { contrast: 0 } },
    { name: 'Saturation', type: 'saturation', values: { saturation: 0 } },
    { name: 'Hue Shift', type: 'hue', values: { hue: 0 } }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-600" />
              Smart Objects
            </h2>
            <p className="text-sm text-gray-500">Non-destructive editing with intelligent features</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={previewMode}
              onChange={(e) => setPreviewMode(e.target.value as any)}
              className="px-3 py-1.5 border rounded text-sm"
            >
              <option value="current">Current</option>
              <option value="original">Original</option>
              <option value="split">Split View</option>
            </select>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">×</button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Objects List */}
          <div className="w-80 border-r bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Smart Objects ({smartObjects.length})</h3>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
              >
                Advanced
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {smartObjects.map(obj => (
                <div
                  key={obj.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedObject?.id === obj.id ? 'border-green-500 bg-green-50' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedObject(obj)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getObjectIcon(obj.type)}</span>
                      <span className="font-medium text-sm truncate">{obj.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {obj.isLinked && <Link className="w-3 h-3 text-blue-500" />}
                      {!obj.visible && <EyeOff className="w-3 h-3 text-gray-400" />}
                      {obj.locked && <Lock className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Type: {obj.type}</div>
                    <div>Opacity: {Math.round(obj.opacity * 100)}%</div>
                    <div>
                      Effects: {obj.transformations.length + obj.filters.length + obj.adjustments.length}
                    </div>
                  </div>

                  {obj.smartFeatures.autoEnhance && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                      <Zap className="w-3 h-3" />
                      Auto-enhanced
                    </div>
                  )}
                </div>
              ))}

              {smartObjects.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No smart objects</p>
                </div>
              )}
            </div>
          </div>

          {/* Object Editor */}
          <div className="flex-1 p-4">
            {selectedObject ? (
              <div className="space-y-6">
                {/* Object Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-lg">{selectedObject.name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicateSmartObject(selectedObject.id)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => resetToOriginal(selectedObject.id)}
                        className="p-2 hover:bg-gray-200 rounded"
                        title="Reset to Original"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Opacity</label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={selectedObject.opacity}
                        onChange={(e) => {
                          const updated = { ...selectedObject, opacity: Number(e.target.value) };
                          setSelectedObject(updated);
                          onObjectUpdate(selectedObject.id, { opacity: Number(e.target.value) });
                        }}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{Math.round(selectedObject.opacity * 100)}%</span>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Blend Mode</label>
                      <select
                        value={selectedObject.blendMode}
                        onChange={(e) => {
                          const updated = { ...selectedObject, blendMode: e.target.value };
                          setSelectedObject(updated);
                          onObjectUpdate(selectedObject.id, { blendMode: e.target.value });
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        {getBlendModes().map(mode => (
                          <option key={mode} value={mode} className="capitalize">
                            {mode.replace('-', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const updated = { ...selectedObject, visible: !selectedObject.visible };
                          setSelectedObject(updated);
                          onObjectUpdate(selectedObject.id, { visible: !selectedObject.visible });
                        }}
                        className={`p-2 rounded ${selectedObject.visible ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}
                      >
                        {selectedObject.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          const updated = { ...selectedObject, locked: !selectedObject.locked };
                          setSelectedObject(updated);
                          onObjectUpdate(selectedObject.id, { locked: !selectedObject.locked });
                        }}
                        className={`p-2 rounded ${selectedObject.locked ? 'bg-red-100 text-red-600' : 'bg-gray-100'}`}
                      >
                        {selectedObject.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedObject.isLinked ? (
                        <button
                          onClick={() => unlinkObject(selectedObject.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm flex items-center gap-1"
                        >
                          <Unlink className="w-3 h-3" />
                          Unlink
                        </button>
                      ) : (
                        <button
                          onClick={() => linkObjects([selectedObject.id])}
                          className="px-3 py-1 border rounded text-sm flex items-center gap-1"
                        >
                          <Link className="w-3 h-3" />
                          Link
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Smart Features */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    Smart Features
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedObject.smartFeatures).map(([feature, enabled]) => (
                      <label key={feature} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleSmartFeature(selectedObject.id, feature as any)}
                          className="rounded"
                        />
                        <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Filters ({selectedObject.filters.length})</h4>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const preset = getFilterPresets().find(p => p.name === e.target.value);
                          if (preset) {
                            addFilter(selectedObject.id, {
                              name: preset.name,
                              type: preset.type as any,
                              parameters: preset.parameters,
                              enabled: true,
                              intensity: 1
                            });
                          }
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      <option value="">Add Filter...</option>
                      {getFilterPresets().map(preset => (
                        <option key={preset.name} value={preset.name}>{preset.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    {selectedObject.filters.map(filter => (
                      <div key={filter.id} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{filter.name}</span>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filter.enabled}
                              onChange={(e) => {
                                const updated = {
                                  ...selectedObject,
                                  filters: selectedObject.filters.map(f =>
                                    f.id === filter.id ? { ...f, enabled: e.target.checked } : f
                                  )
                                };
                                setSelectedObject(updated);
                              }}
                              className="rounded"
                            />
                            <span className="text-xs">Enabled</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Intensity</label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={filter.intensity}
                            onChange={(e) => {
                              const updated = {
                                ...selectedObject,
                                filters: selectedObject.filters.map(f =>
                                  f.id === filter.id ? { ...f, intensity: Number(e.target.value) } : f
                                )
                              };
                              setSelectedObject(updated);
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adjustments */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Adjustments ({selectedObject.adjustments.length})</h4>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          const preset = getAdjustmentPresets().find(p => p.name === e.target.value);
                          if (preset) {
                            addAdjustment(selectedObject.id, {
                              name: preset.name,
                              type: preset.type as any,
                              values: preset.values,
                              enabled: true
                            });
                          }
                          e.target.value = '';
                        }
                      }}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      <option value="">Add Adjustment...</option>
                      {getAdjustmentPresets().map(preset => (
                        <option key={preset.name} value={preset.name}>{preset.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    {selectedObject.adjustments.map(adjustment => (
                      <div key={adjustment.id} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{adjustment.name}</span>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={adjustment.enabled}
                              onChange={(e) => {
                                const updated = {
                                  ...selectedObject,
                                  adjustments: selectedObject.adjustments.map(a =>
                                    a.id === adjustment.id ? { ...a, enabled: e.target.checked } : a
                                  )
                                };
                                setSelectedObject(updated);
                              }}
                              className="rounded"
                            />
                            <span className="text-xs">Enabled</span>
                          </label>
                        </div>
                        {Object.entries(adjustment.values).map(([key, value]) => (
                          <div key={key} className="mb-2">
                            <label className="block text-xs text-gray-600 mb-1 capitalize">{key}</label>
                            <input
                              type="range"
                              min="-100"
                              max="100"
                              value={value}
                              onChange={(e) => {
                                const updated = {
                                  ...selectedObject,
                                  adjustments: selectedObject.adjustments.map(a =>
                                    a.id === adjustment.id
                                      ? { ...a, values: { ...a.values, [key]: Number(e.target.value) } }
                                      : a
                                  )
                                };
                                setSelectedObject(updated);
                              }}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-500">{value}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Smart Objects</p>
                  <p>Select an object to edit with non-destructive tools</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};