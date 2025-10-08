import React, { useState, useCallback, useRef } from 'react';
import { 
  Save, 
  FolderOpen, 
  Download, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Archive, 
  Clock, 
  User, 
  Tag, 
  Star, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Share, 
  Settings, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  Folder, 
  File, 
  HardDrive, 
  Cloud, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: Date;
  modifiedAt: Date;
  author: string;
  tags: string[];
  isPublic: boolean;
  isStarred: boolean;
  version: string;
  fileSize: number;
  canvasData: any;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  zoomLevel: number;
  autoSave: boolean;
  autoSaveInterval: number;
  exportQuality: number;
  exportFormat: 'png' | 'jpg' | 'svg' | 'pdf';
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  tags: string[];
  canvasData: any;
  isOfficial: boolean;
  downloads: number;
  rating: number;
}

interface EnhancedProjectManagerProps {
  currentProject?: Project;
  onProjectLoad?: (project: Project) => void;
  onProjectSave?: (project: Project) => void;
  onProjectCreate?: (project: Project) => void;
  onProjectDelete?: (projectId: string) => void;
  onProjectExport?: (project: Project, format: string) => void;
  onProjectImport?: (file: File) => void;
  onSettingsChange?: (settings: ProjectSettings) => void;
  className?: string;
}

const defaultProjectSettings: ProjectSettings = {
  canvasWidth: 1080,
  canvasHeight: 1080,
  backgroundColor: '#ffffff',
  gridEnabled: true,
  snapToGrid: false,
  gridSize: 20,
  zoomLevel: 1,
  autoSave: true,
  autoSaveInterval: 30000,
  exportQuality: 100,
  exportFormat: 'png'
};

export const EnhancedProjectManager: React.FC<EnhancedProjectManagerProps> = ({
  currentProject,
  onProjectLoad,
  onProjectSave,
  onProjectCreate,
  onProjectDelete,
  onProjectExport,
  onProjectImport,
  onSettingsChange,
  className = ''
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    description: '',
    tags: [],
    isPublic: false,
    isStarred: false
  });
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg' | 'svg' | 'pdf'>('png');
  const [exportQuality, setExportQuality] = useState(100);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load projects from localStorage
  React.useEffect(() => {
    const savedProjects = localStorage.getItem('image-editor-projects');
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        setProjects(parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          modifiedAt: new Date(p.modifiedAt)
        })));
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    }
  }, []);

  // Save projects to localStorage
  const saveProjects = useCallback((updatedProjects: Project[]) => {
    localStorage.setItem('image-editor-projects', JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  }, []);

  // Filter and sort projects
  const filteredProjects = React.useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !filterTag || project.tags.includes(filterTag);
      return matchesSearch && matchesTag;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.modifiedAt.getTime() - b.modifiedAt.getTime();
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [projects, searchQuery, filterTag, sortBy, sortOrder]);

  // Get unique tags
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(project => {
      project.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [projects]);

  const handleCreateProject = useCallback(() => {
    if (!newProject.name) return;

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description || '',
      createdAt: new Date(),
      modifiedAt: new Date(),
      author: 'Current User',
      tags: newProject.tags || [],
      isPublic: newProject.isPublic || false,
      isStarred: newProject.isStarred || false,
      version: '1.0.0',
      fileSize: 0,
      canvasData: null,
      settings: defaultProjectSettings
    };

    const updatedProjects = [...projects, project];
    saveProjects(updatedProjects);
    onProjectCreate?.(project);
    setShowCreateModal(false);
    setNewProject({ name: '', description: '', tags: [], isPublic: false, isStarred: false });
  }, [newProject, projects, saveProjects, onProjectCreate]);

  const handleLoadProject = useCallback((project: Project) => {
    onProjectLoad?.(project);
    setShowLoadModal(false);
  }, [onProjectLoad]);

  const handleSaveProject = useCallback(() => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      modifiedAt: new Date()
    };

    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    saveProjects(updatedProjects);
    onProjectSave?.(updatedProject);
  }, [currentProject, projects, saveProjects, onProjectSave]);

  const handleDeleteProject = useCallback((projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      saveProjects(updatedProjects);
      onProjectDelete?.(projectId);
    }
  }, [projects, saveProjects, onProjectDelete]);

  const handleExportProject = useCallback((project: Project) => {
    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImportProject = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string);
        const project: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date(projectData.createdAt),
          modifiedAt: new Date()
        };
        
        const updatedProjects = [...projects, project];
        saveProjects(updatedProjects);
        onProjectImport?.(file);
      } catch (error) {
        console.error('Error importing project:', error);
        alert('Error importing project. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, [projects, saveProjects, onProjectImport]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Folder className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Project Manager</h3>
          <span className="text-sm text-gray-500">({filteredProjects.length} projects)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded hover:bg-gray-100"
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded hover:bg-gray-100"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
              className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 rounded hover:bg-gray-100"
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
            
            <button
              onClick={() => setShowLoadModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Load</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="p-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No projects found</p>
            <p className="text-sm">Create a new project to get started</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className={`border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${
                  currentProject?.id === project.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{project.description}</p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {project.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        {project.isPublic ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatDate(project.modifiedAt)}</span>
                      <span>{formatFileSize(project.fileSize)}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleLoadProject(project)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          title="Load Project"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportProject(project)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="Export Project"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        v{project.version}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <File className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
                        {project.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        {project.isPublic ? <Unlock className="w-4 h-4 text-green-500" /> : <Lock className="w-4 h-4 text-gray-400" />}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{project.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{formatDate(project.modifiedAt)}</span>
                        <span>{formatFileSize(project.fileSize)}</span>
                        <span>v{project.version}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleLoadProject(project)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                        title="Load Project"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportProject(project)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        title="Export Project"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportProject}
        className="hidden"
      />

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProject.description || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter project description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <input
                  type="text"
                  value={(newProject.tags || []).join(', ')}
                  onChange={(e) => setNewProject(prev => ({ 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newProject.isPublic || false}
                    onChange={(e) => setNewProject(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Public Project</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newProject.isStarred || false}
                    onChange={(e) => setNewProject(prev => ({ ...prev, isStarred: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Starred</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Project Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Load Project</h3>
              <button
                onClick={() => setShowLoadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  onClick={() => handleLoadProject(project)}
                  className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <File className="w-5 h-5 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900 truncate">{project.name}</h4>
                      {project.isStarred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{project.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{formatDate(project.modifiedAt)}</span>
                      <span>{formatFileSize(project.fileSize)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Hook for project management
export const useProjectManager = () => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const createProject = useCallback((projectData: Partial<Project>) => {
    const project: Project = {
      id: Date.now().toString(),
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      createdAt: new Date(),
      modifiedAt: new Date(),
      author: 'Current User',
      tags: projectData.tags || [],
      isPublic: projectData.isPublic || false,
      isStarred: projectData.isStarred || false,
      version: '1.0.0',
      fileSize: 0,
      canvasData: projectData.canvasData || null,
      settings: projectData.settings || defaultProjectSettings
    };

    setCurrentProject(project);
    setIsDirty(false);
    return project;
  }, []);

  const loadProject = useCallback((project: Project) => {
    setCurrentProject(project);
    setIsDirty(false);
  }, []);

  const saveProject = useCallback((canvasData: any) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      canvasData,
      modifiedAt: new Date(),
      fileSize: JSON.stringify(canvasData).length
    };

    setCurrentProject(updatedProject);
    setIsDirty(false);
    return updatedProject;
  }, [currentProject]);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  return {
    currentProject,
    isDirty,
    createProject,
    loadProject,
    saveProject,
    markDirty
  };
};
