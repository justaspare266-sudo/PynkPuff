import React, { useState } from 'react';
import { Play, Square, Settings, Download, Upload, Trash2, Copy, Eye, Filter, Zap } from 'lucide-react';

interface BatchOperation {
  id: string;
  name: string;
  type: 'transform' | 'style' | 'filter' | 'export';
  parameters: Record<string, any>;
  enabled: boolean;
}

interface BatchJob {
  id: string;
  name: string;
  operations: BatchOperation[];
  targetObjects: string[];
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  results?: any[];
  error?: string;
}

interface BatchProcessingProps {
  objects: any[];
  selectedObjects: string[];
  onClose: () => void;
  onApplyBatch: (job: BatchJob) => void;
}

const OPERATION_TEMPLATES = {
  transform: [
    { name: 'Resize', parameters: { width: 100, height: 100, maintainAspect: true } },
    { name: 'Move', parameters: { x: 0, y: 0, relative: true } },
    { name: 'Rotate', parameters: { angle: 0, center: 'object' } },
    { name: 'Scale', parameters: { scaleX: 1, scaleY: 1, center: 'object' } },
    { name: 'Flip', parameters: { horizontal: false, vertical: false } }
  ],
  style: [
    { name: 'Change Color', parameters: { property: 'fill', color: '#000000' } },
    { name: 'Set Opacity', parameters: { opacity: 1 } },
    { name: 'Add Shadow', parameters: { offsetX: 5, offsetY: 5, blur: 10, color: '#000000' } },
    { name: 'Add Stroke', parameters: { width: 2, color: '#000000', style: 'solid' } },
    { name: 'Set Font', parameters: { fontFamily: 'Arial', fontSize: 16, fontWeight: 'normal' } }
  ],
  filter: [
    { name: 'Blur', parameters: { radius: 5 } },
    { name: 'Brightness', parameters: { value: 1.2 } },
    { name: 'Contrast', parameters: { value: 1.2 } },
    { name: 'Saturation', parameters: { value: 1.2 } },
    { name: 'Grayscale', parameters: { amount: 1 } }
  ],
  export: [
    { name: 'Export PNG', parameters: { quality: 1, scale: 1, background: 'transparent' } },
    { name: 'Export JPG', parameters: { quality: 0.9, scale: 1, background: '#ffffff' } },
    { name: 'Export SVG', parameters: { includeStyles: true, minify: false } },
    { name: 'Export PDF', parameters: { format: 'A4', orientation: 'portrait' } }
  ]
};

export const BatchProcessing: React.FC<BatchProcessingProps> = ({
  objects,
  selectedObjects,
  onClose,
  onApplyBatch
}) => {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [currentJob, setCurrentJob] = useState<BatchJob | null>(null);
  const [showJobEditor, setShowJobEditor] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<string>('');

  const createNewJob = () => {
    const newJob: BatchJob = {
      id: `job-${Date.now()}`,
      name: 'New Batch Job',
      operations: [],
      targetObjects: selectedObjects,
      status: 'pending',
      progress: 0
    };
    setCurrentJob(newJob);
    setShowJobEditor(true);
  };

  const addOperation = (type: keyof typeof OPERATION_TEMPLATES, templateName: string) => {
    if (!currentJob) return;

    const template = OPERATION_TEMPLATES[type].find(t => t.name === templateName);
    if (!template) return;

    const newOperation: BatchOperation = {
      id: `op-${Date.now()}`,
      name: template.name,
      type,
      parameters: { ...template.parameters },
      enabled: true
    };

    setCurrentJob({
      ...currentJob,
      operations: [...currentJob.operations, newOperation]
    });
  };

  const updateOperation = (operationId: string, updates: Partial<BatchOperation>) => {
    if (!currentJob) return;

    setCurrentJob({
      ...currentJob,
      operations: currentJob.operations.map(op =>
        op.id === operationId ? { ...op, ...updates } : op
      )
    });
  };

  const removeOperation = (operationId: string) => {
    if (!currentJob) return;

    setCurrentJob({
      ...currentJob,
      operations: currentJob.operations.filter(op => op.id !== operationId)
    });
  };

  const saveJob = () => {
    if (!currentJob) return;

    setJobs(prev => {
      const existing = prev.find(job => job.id === currentJob.id);
      if (existing) {
        return prev.map(job => job.id === currentJob.id ? currentJob : job);
      }
      return [...prev, currentJob];
    });

    setShowJobEditor(false);
    setCurrentJob(null);
  };

  const runJob = async (job: BatchJob) => {
    setJobs(prev => prev.map(j =>
      j.id === job.id ? { ...j, status: 'running' as const, progress: 0 } : j
    ));

    try {
      // Simulate batch processing
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setJobs(prev => prev.map(j =>
          j.id === job.id ? { ...j, progress: i } : j
        ));
      }

      setJobs(prev => prev.map(j =>
        j.id === job.id ? { ...j, status: 'completed' as const, progress: 100 } : j
      ));

      onApplyBatch(job);
    } catch (error) {
      setJobs(prev => prev.map(j =>
        j.id === job.id ? {
          ...j,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        } : j
      ));
    }
  };

  const duplicateJob = (job: BatchJob) => {
    const duplicated: BatchJob = {
      ...job,
      id: `job-${Date.now()}`,
      name: `${job.name} (Copy)`,
      status: 'pending',
      progress: 0,
      results: undefined,
      error: undefined
    };
    setJobs(prev => [...prev, duplicated]);
  };

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId));
  };

  const renderParameterInput = (operation: BatchOperation, paramKey: string, paramValue: any) => {
    const updateParam = (value: any) => {
      updateOperation(operation.id, {
        parameters: { ...operation.parameters, [paramKey]: value }
      });
    };

    if (typeof paramValue === 'boolean') {
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={paramValue}
            onChange={(e) => updateParam(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm capitalize">{paramKey.replace(/([A-Z])/g, ' $1')}</span>
        </label>
      );
    }

    if (typeof paramValue === 'number') {
      return (
        <div>
          <label className="block text-xs text-gray-600 mb-1 capitalize">
            {paramKey.replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            type="number"
            value={paramValue}
            onChange={(e) => updateParam(Number(e.target.value))}
            className="w-full px-2 py-1 border rounded text-sm"
            step={paramKey.includes('opacity') || paramKey.includes('scale') ? '0.1' : '1'}
          />
        </div>
      );
    }

    if (typeof paramValue === 'string') {
      if (paramKey.includes('color') || paramKey.includes('Color')) {
        return (
          <div>
            <label className="block text-xs text-gray-600 mb-1 capitalize">
              {paramKey.replace(/([A-Z])/g, ' $1')}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={paramValue}
                onChange={(e) => updateParam(e.target.value)}
                className="w-8 h-8 border rounded"
              />
              <input
                type="text"
                value={paramValue}
                onChange={(e) => updateParam(e.target.value)}
                className="flex-1 px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        );
      }

      return (
        <div>
          <label className="block text-xs text-gray-600 mb-1 capitalize">
            {paramKey.replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            type="text"
            value={paramValue}
            onChange={(e) => updateParam(e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">Batch Processing</h2>
            <p className="text-sm text-gray-500">
              Apply operations to multiple objects at once
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={createNewJob}
              className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              New Job
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Jobs List */}
          <div className="w-1/3 border-r bg-gray-50 p-4">
            <h3 className="font-medium mb-3">Batch Jobs</h3>
            <div className="space-y-2">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="bg-white border rounded-lg p-3 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm truncate">{job.name}</h4>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setCurrentJob(job);
                          setShowJobEditor(true);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => duplicateJob(job)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="p-1 hover:bg-gray-100 rounded text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {job.operations.length} operations • {job.targetObjects.length} objects
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`px-2 py-1 rounded text-xs ${
                      job.status === 'completed' ? 'bg-green-100 text-green-700' :
                      job.status === 'running' ? 'bg-blue-100 text-blue-700' :
                      job.status === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status}
                    </div>
                    
                    {job.status === 'pending' && (
                      <button
                        onClick={() => runJob(job)}
                        className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  {job.status === 'running' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-500 h-1 rounded-full transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {job.error && (
                    <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                      {job.error}
                    </div>
                  )}
                </div>
              ))}
              
              {jobs.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No batch jobs yet</p>
                  <p className="text-xs">Create a job to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Job Editor */}
          <div className="flex-1 p-4">
            {showJobEditor && currentJob ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={currentJob.name}
                    onChange={(e) => setCurrentJob({ ...currentJob, name: e.target.value })}
                    className="text-lg font-medium bg-transparent border-none outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveJob}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save Job
                    </button>
                    <button
                      onClick={() => {
                        setShowJobEditor(false);
                        setCurrentJob(null);
                      }}
                      className="px-3 py-1.5 border rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  {Object.entries(OPERATION_TEMPLATES).map(([type, templates]) => (
                    <div key={type} className="space-y-2">
                      <h4 className="font-medium text-sm capitalize">{type}</h4>
                      {templates.map(template => (
                        <button
                          key={template.name}
                          onClick={() => addOperation(type as any, template.name)}
                          className="w-full text-left px-2 py-1 text-xs border rounded hover:bg-gray-50"
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Operations ({currentJob.operations.length})</h4>
                  {currentJob.operations.map((operation, index) => (
                    <div key={operation.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {index + 1}. {operation.name}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                            {operation.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={operation.enabled}
                              onChange={(e) => updateOperation(operation.id, { enabled: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-xs">Enabled</span>
                          </label>
                          <button
                            onClick={() => removeOperation(operation.id)}
                            className="p-1 hover:bg-gray-100 rounded text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(operation.parameters).map(([key, value]) => (
                          <div key={key}>
                            {renderParameterInput(operation, key, value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {currentJob.operations.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No operations added</p>
                      <p className="text-xs">Add operations from the categories above</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a job to edit or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};