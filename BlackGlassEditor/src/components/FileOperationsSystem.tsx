'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  Save,
  FolderOpen,
  Download,
  Upload,
  FileText,
  Image,
  Archive,
  Trash2,
  Plus,
  Folder,
  Clock,
  Star,
  Search,
  Filter,
  MoreVertical,
  RefreshCw
} from 'lucide-react';

export interface ProjectFile {
  id: string;
  name: string;
  type: 'project' | 'image' | 'template' | 'backup';
  size: number;
  created: Date;
  modified: Date;
  thumbnail?: string;
  tags: string[];
  isFavorite: boolean;
  isRecent: boolean;
  path: string;
  metadata?: {
    canvasWidth: number;
    canvasHeight: number;
    elementCount: number;
    version: string;
    author?: string;
    description?: string;
  };
}

export interface FileOperationsSystemProps {
  currentProject?: ProjectFile;
  onProjectSave: (project: Omit<ProjectFile, 'id' | 'created' | 'modified'>) => void;
  onProjectLoad: (projectId: string) => void;
  onProjectNew: () => void;
  onProjectExport: (format: 'json' | 'png' | 'svg' | 'pdf') => void;
  onProjectImport: (file: File) => void;
  onProjectDelete: (projectId: string) => void;
  onProjectDuplicate: (projectId: string) => void;
  className?: string;
}

const FileOperationsSystem: React.FC<FileOperationsSystemProps> = ({
  currentProject,
  onProjectSave,
  onProjectLoad,
  onProjectNew,
  onProjectExport,
  onProjectImport,
  onProjectDelete,
  onProjectDuplicate,
  className = ''
}) => {
  const [showFileDialog, setShowFileDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [projects, setProjects] = useState<ProjectFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'project' | 'image' | 'template' | 'backup'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size' | 'created'>('modified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Load projects from localStorage on mount
  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = useCallback(() => {
    try {
      const savedProjects = localStorage.getItem('image-editor-projects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects).map((project: any) => ({
          ...project,
          created: new Date(project.created),
          modified: new Date(project.modified)
        }));
        setProjects(parsedProjects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }, []);

  const saveProjects = useCallback((updatedProjects: ProjectFile[]) => {
    try {
      localStorage.setItem('image-editor-projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
    } catch (error) {
      console.error('Failed to save projects:', error);
    }
  }, []);

  const handleNewProject = useCallback(() => {
    setNewProjectName('');
    setNewProjectDescription('');
    setShowSaveDialog(true);
  }, []);

  const handleSaveProject = useCallback(() => {
    if (!newProjectName.trim()) return;

    const project: Omit<ProjectFile, 'id' | 'created' | 'modified'> = {
      name: newProjectName.trim(),
      type: 'project',
      size: 0, // Will be calculated
      thumbnail: '', // Will be generated
      tags: [],
      isFavorite: false,
      isRecent: true,
      path: `projects/${newProjectName.trim().toLowerCase().replace(/\s+/g, '-')}.json`,
      metadata: {
        canvasWidth: 1200,
        canvasHeight: 800,
        elementCount: 0,
        version: '1.0.0',
        author: 'User',
        description: newProjectDescription.trim()
      }
    };

    onProjectSave(project);
    setShowSaveDialog(false);
    loadProjects();
  }, [newProjectName, newProjectDescription, onProjectSave, loadProjects]);

  const handleLoadProject = useCallback((projectId: string) => {
    onProjectLoad(projectId);
    setShowFileDialog(false);
  }, [onProjectLoad]);

  const handleDeleteProject = useCallback((projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      onProjectDelete(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    }
  }, [onProjectDelete]);

  const handleDuplicateProject = useCallback((projectId: string) => {
    onProjectDuplicate(projectId);
    loadProjects();
  }, [onProjectDuplicate, loadProjects]);

  const handleImportProject = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onProjectImport(file);
      setShowImportDialog(false);
    }
  }, [onProjectImport]);

  const handleExportProject = useCallback((format: 'json' | 'png' | 'svg' | 'pdf') => {
    onProjectExport(format);
  }, [onProjectExport]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || project.type === filterType;
    const matchesFavorites = !showFavoritesOnly || project.isFavorite;
    
    return matchesSearch && matchesFilter && matchesFavorites;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'modified':
        comparison = a.modified.getTime() - b.modified.getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'created':
        comparison = a.created.getTime() - b.created.getTime();
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFileIcon = (type: ProjectFile['type']) => {
    switch (type) {
      case 'project':
        return FileText;
      case 'image':
        return Image;
      case 'template':
        return Archive;
      case 'backup':
        return Clock;
      default:
        return FileText;
    }
  };

  return (
    <div className={`file-operations-system ${className}`}>
      {/* Main Actions */}
      <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded mb-4">
        <button
          onClick={handleNewProject}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white"
        >
          <Plus className="w-4 h-4" />
          <span>New</span>
        </button>
        
        <button
          onClick={() => setShowFileDialog(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white"
        >
          <FolderOpen className="w-4 h-4" />
          <span>Open</span>
        </button>
        
        <button
          onClick={() => setShowImportDialog(true)}
          className="flex items-center space-x-1 px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white"
        >
          <Upload className="w-4 h-4" />
          <span>Import</span>
        </button>
        
        <div className="w-px h-6 bg-gray-600" />
        
        <button
          onClick={() => handleExportProject('json')}
          className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm text-white"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Current Project Info */}
      {currentProject && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-300">Current Project</h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleExportProject('json')}
                className="p-1 hover:bg-gray-600 rounded text-gray-400"
                title="Export Project"
              >
                <Download className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleDuplicateProject(currentProject.id)}
                className="p-1 hover:bg-gray-600 rounded text-gray-400"
                title="Duplicate Project"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-300">{currentProject.name}</div>
          <div className="text-xs text-gray-400">
            {currentProject.metadata?.canvasWidth} × {currentProject.metadata?.canvasHeight} • 
            {currentProject.metadata?.elementCount} elements • 
            Modified {formatDate(currentProject.modified)}
          </div>
        </div>
      )}

      {/* File Dialog */}
      {showFileDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-600">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Open Project</h2>
                <button
                  onClick={() => setShowFileDialog(false)}
                  className="p-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {/* Search and Filters */}
              <div className="mb-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="project">Projects</option>
                    <option value="image">Images</option>
                    <option value="template">Templates</option>
                    <option value="backup">Backups</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={showFavoritesOnly}
                      onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">Favorites only</span>
                  </div>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                  >
                    <option value="modified">Modified</option>
                    <option value="name">Name</option>
                    <option value="size">Size</option>
                    <option value="created">Created</option>
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-1 hover:bg-gray-600 rounded text-gray-400"
                    title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Project List */}
              <div className="max-h-96 overflow-y-auto">
                {sortedProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <div>No projects found</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {sortedProjects.map(project => {
                      const IconComponent = getFileIcon(project.type);
                      return (
                        <div
                          key={project.id}
                          className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                          onClick={() => handleLoadProject(project.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-white truncate">
                                {project.name}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {project.isFavorite && (
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteProject(project.id);
                                }}
                                className="p-1 hover:bg-gray-500 rounded text-gray-400"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-400 space-y-1">
                            <div>{formatFileSize(project.size)}</div>
                            <div>Modified {formatDate(project.modified)}</div>
                            {project.metadata && (
                              <div>
                                {project.metadata.canvasWidth} × {project.metadata.canvasHeight}
                              </div>
                            )}
                          </div>
                          
                          {project.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {project.tags.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="px-1 py-0.5 bg-gray-600 text-xs text-gray-300 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-full max-w-md">
            <div className="p-4 border-b border-gray-600">
              <h2 className="text-xl font-semibold">Save Project</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                  placeholder="Enter project name..."
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white h-20 resize-none"
                  placeholder="Enter project description..."
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-600 flex justify-end space-x-2">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-600 w-full max-w-md">
            <div className="p-4 border-b border-gray-600">
              <h2 className="text-xl font-semibold">Import Project</h2>
            </div>
            
            <div className="p-4">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <div className="text-gray-300 mb-2">Drop your project file here</div>
                <div className="text-sm text-gray-400 mb-4">or click to browse</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.png,.svg"
                  onChange={handleImportProject}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white"
                >
                  Choose File
                </button>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-600 flex justify-end">
              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileOperationsSystem;
