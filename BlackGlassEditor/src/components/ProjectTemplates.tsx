import React, { useState } from 'react';
import { FileText, Plus, Star, Download, Eye, Copy, Trash2, Search, Filter } from 'lucide-react';
import { sanitizeHtml } from '../utils/security';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  preview: string;
  canvasSize: { width: number; height: number };
  objects: any[];
  layers: any[];
  settings: {
    backgroundColor: string;
    gridEnabled: boolean;
    snapEnabled: boolean;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
    version: string;
    tags: string[];
    usageCount: number;
    rating: number;
  };
  isCustom: boolean;
  isDefault: boolean;
}

interface ProjectTemplatesProps {
  onTemplateSelect: (template: ProjectTemplate) => void;
  onClose: () => void;
  currentProject?: any;
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: FileText },
  { id: 'social', name: 'Social Media', icon: FileText },
  { id: 'print', name: 'Print Design', icon: FileText },
  { id: 'web', name: 'Web Graphics', icon: FileText },
  { id: 'presentation', name: 'Presentations', icon: FileText },
  { id: 'branding', name: 'Branding', icon: FileText },
  { id: 'custom', name: 'My Templates', icon: FileText }
];

const DEFAULT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'social-instagram-post',
    name: 'Instagram Post',
    description: 'Square format perfect for Instagram posts with modern layout',
    category: 'social',
    thumbnail: '/templates/instagram-post-thumb.jpg',
    preview: '/templates/instagram-post-preview.jpg',
    canvasSize: { width: 1080, height: 1080 },
    objects: [],
    layers: [],
    settings: {
      backgroundColor: '#ffffff',
      gridEnabled: true,
      snapEnabled: true
    },
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      author: 'Design Team',
      version: '1.0',
      tags: ['instagram', 'social', 'square', 'modern'],
      usageCount: 1250,
      rating: 4.8
    },
    isCustom: false,
    isDefault: true
  },
  {
    id: 'print-business-card',
    name: 'Business Card',
    description: 'Standard business card template with professional layout',
    category: 'print',
    thumbnail: '/templates/business-card-thumb.jpg',
    preview: '/templates/business-card-preview.jpg',
    canvasSize: { width: 1050, height: 600 },
    objects: [],
    layers: [],
    settings: {
      backgroundColor: '#ffffff',
      gridEnabled: true,
      snapEnabled: true
    },
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      author: 'Design Team',
      version: '1.0',
      tags: ['business', 'card', 'print', 'professional'],
      usageCount: 890,
      rating: 4.9
    },
    isCustom: false,
    isDefault: true
  },
  {
    id: 'web-banner',
    name: 'Web Banner',
    description: 'Responsive web banner template for websites and ads',
    category: 'web',
    thumbnail: '/templates/web-banner-thumb.jpg',
    preview: '/templates/web-banner-preview.jpg',
    canvasSize: { width: 1200, height: 400 },
    objects: [],
    layers: [],
    settings: {
      backgroundColor: '#f8f9fa',
      gridEnabled: true,
      snapEnabled: true
    },
    metadata: {
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      author: 'Design Team',
      version: '1.0',
      tags: ['web', 'banner', 'responsive', 'advertising'],
      usageCount: 650,
      rating: 4.6
    },
    isCustom: false,
    isDefault: true
  }
];

export const ProjectTemplates: React.FC<ProjectTemplatesProps> = ({
  onTemplateSelect,
  onClose,
  currentProject
}) => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>(DEFAULT_TEMPLATES);
  const [filteredTemplates, setFilteredTemplates] = useState<ProjectTemplate[]>(DEFAULT_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'popular' | 'rating'>('popular');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ProjectTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom',
    tags: ''
  });

  React.useEffect(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime();
        case 'popular':
          return b.metadata.usageCount - a.metadata.usageCount;
        case 'rating':
          return b.metadata.rating - a.metadata.rating;
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery, sortBy]);

  const createTemplateFromProject = () => {
    if (!currentProject || !newTemplate.name) return;

    const template: ProjectTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      category: newTemplate.category,
      thumbnail: '/templates/custom-thumb.jpg',
      preview: '/templates/custom-preview.jpg',
      canvasSize: currentProject.canvasSize || { width: 1920, height: 1080 },
      objects: [...(currentProject.objects || [])],
      layers: [...(currentProject.layers || [])],
      settings: {
        backgroundColor: currentProject.backgroundColor || '#ffffff',
        gridEnabled: currentProject.gridEnabled || false,
        snapEnabled: currentProject.snapEnabled || false
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'You',
        version: '1.0',
        tags: newTemplate.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        usageCount: 0,
        rating: 5.0
      },
      isCustom: true,
      isDefault: false
    };

    setTemplates(prev => [...prev, template]);
    setShowCreateDialog(false);
    setNewTemplate({ name: '', description: '', category: 'custom', tags: '' });
  };

  const duplicateTemplate = (template: ProjectTemplate) => {
    const duplicated: ProjectTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      name: `${template.name} (Copy)`,
      metadata: {
        ...template.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'You',
        usageCount: 0
      },
      isCustom: true,
      isDefault: false
    };

    setTemplates(prev => [...prev, duplicated]);
  };

  const deleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    // Update usage count
    setTemplates(prev => prev.map(t =>
      t.id === template.id
        ? { ...t, metadata: { ...t.metadata, usageCount: t.metadata.usageCount + 1 } }
        : t
    ));

    onTemplateSelect(template);
  };

  const exportTemplate = (template: ProjectTemplate) => {
    const data = JSON.stringify(template, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] max-w-7xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Project Templates
              </h2>
              <p className="text-sm text-gray-500">Start with a professional template or create your own</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateDialog(true)}
                disabled={!currentProject}
                className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Create Template
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">×</button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r bg-gray-50 p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Categories</h3>
                  <div className="space-y-1">
                    {TEMPLATE_CATEGORIES.map(category => {
                      const Icon = category.icon;
                      const count = category.id === 'all' 
                        ? templates.length 
                        : templates.filter(t => t.category === category.id).length;
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded text-left hover:bg-gray-200 ${
                            selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" />
                            {category.name}
                          </div>
                          <span className="text-xs text-gray-500">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="recent">Most Recent</option>
                    <option value="rating">Highest Rated</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Templates Grid */}
              <div className="flex-1 overflow-auto p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredTemplates.map(template => (
                    <div
                      key={template.id}
                      className="group bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-[4/3] bg-gray-100 relative">
                        <img
                          src={template.thumbnail}
                          alt={sanitizeHtml(template.name)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTggMTJIMTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                          }}
                        />
                        
                        {template.isDefault && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                            Default
                          </div>
                        )}
                        
                        {template.isCustom && (
                          <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs">
                            Custom
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setPreviewTemplate(template)}
                              className="p-2 bg-white rounded-full hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleTemplateSelect(template)}
                              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                            >
                              Use Template
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">{sanitizeHtml(template.name)}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sanitizeHtml(template.description)}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{template.metadata.rating}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {template.metadata.usageCount} uses
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {template.canvasSize.width}×{template.canvasSize.height}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => duplicateTemplate(template)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => exportTemplate(template)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                            {template.isCustom && (
                              <button
                                onClick={() => deleteTemplate(template.id)}
                                className="p-1 hover:bg-gray-100 rounded text-red-500"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No templates found</p>
                    <p className="text-sm">Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Template Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl w-[500px] p-6">
            <h3 className="text-lg font-semibold mb-4">Create Template from Current Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter template name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg h-20 resize-none"
                  placeholder="Describe your template"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="custom">My Templates</option>
                  <option value="social">Social Media</option>
                  <option value="print">Print Design</option>
                  <option value="web">Web Graphics</option>
                  <option value="presentation">Presentations</option>
                  <option value="branding">Branding</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTemplate.tags}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="modern, business, colorful"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createTemplateFromProject}
                disabled={!newTemplate.name}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{sanitizeHtml(previewTemplate.name)}</h3>
                <p className="text-sm text-gray-500">by {sanitizeHtml(previewTemplate.metadata.author)}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <img
                src={previewTemplate.preview}
                alt={previewTemplate.name}
                className="w-full max-h-96 object-contain rounded"
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{previewTemplate.metadata.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{previewTemplate.metadata.usageCount} uses</span>
                  <span className="text-sm text-gray-500">
                    {previewTemplate.canvasSize.width}×{previewTemplate.canvasSize.height}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleTemplateSelect(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};