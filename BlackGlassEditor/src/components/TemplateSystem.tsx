import React, { useState } from 'react';
import { Search, Grid, List, Star, Download, Eye, Bookmark, Clock, Zap } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  preview: string;
  tags: string[];
  dimensions: { width: number; height: number };
  objects: any[]; // Template objects data
  colors: string[];
  fonts: string[];
  rating: number;
  downloads: number;
  isPremium: boolean;
  createdAt: Date;
  author: string;
}

interface TemplateSystemProps {
  onTemplateSelect: (template: Template) => void;
  onClose: () => void;
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', count: 150 },
  { id: 'social', name: 'Social Media', count: 45 },
  { id: 'business', name: 'Business Cards', count: 25 },
  { id: 'flyers', name: 'Flyers & Posters', count: 30 },
  { id: 'logos', name: 'Logo Templates', count: 20 },
  { id: 'presentations', name: 'Presentations', count: 15 },
  { id: 'web', name: 'Web Graphics', count: 15 }
];

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Modern Instagram Post',
    category: 'social',
    description: 'Clean and modern Instagram post template with gradient background',
    thumbnail: '/templates/thumbs/instagram-modern.jpg',
    preview: '/templates/previews/instagram-modern.jpg',
    tags: ['instagram', 'social', 'modern', 'gradient'],
    dimensions: { width: 1080, height: 1080 },
    objects: [],
    colors: ['#667eea', '#764ba2', '#ffffff'],
    fonts: ['Inter', 'Poppins'],
    rating: 4.8,
    downloads: 1250,
    isPremium: false,
    createdAt: new Date('2024-01-15'),
    author: 'Design Studio'
  },
  {
    id: '2',
    name: 'Corporate Business Card',
    category: 'business',
    description: 'Professional business card template with clean typography',
    thumbnail: '/templates/thumbs/business-card.jpg',
    preview: '/templates/previews/business-card.jpg',
    tags: ['business', 'corporate', 'professional', 'card'],
    dimensions: { width: 1050, height: 600 },
    objects: [],
    colors: ['#2c3e50', '#3498db', '#ffffff'],
    fonts: ['Roboto', 'Open Sans'],
    rating: 4.9,
    downloads: 890,
    isPremium: true,
    createdAt: new Date('2024-01-10'),
    author: 'Pro Designer'
  },
  {
    id: '3',
    name: 'Event Flyer Template',
    category: 'flyers',
    description: 'Eye-catching event flyer with bold typography and vibrant colors',
    thumbnail: '/templates/thumbs/event-flyer.jpg',
    preview: '/templates/previews/event-flyer.jpg',
    tags: ['flyer', 'event', 'party', 'colorful'],
    dimensions: { width: 1200, height: 1600 },
    objects: [],
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffffff'],
    fonts: ['Montserrat', 'Roboto'],
    rating: 4.7,
    downloads: 2100,
    isPremium: false,
    createdAt: new Date('2024-01-20'),
    author: 'Creative Team'
  }
];

export const TemplateSystem: React.FC<TemplateSystemProps> = ({ onTemplateSelect, onClose }) => {
  const [templates, _setTemplates] = useState<Template[]>(SAMPLE_TEMPLATES);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(SAMPLE_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  React.useEffect(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by premium
    if (showPremiumOnly) {
      filtered = filtered.filter(template => template.isPremium);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'recent':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery, sortBy, showPremiumOnly]);

  const handleTemplateClick = (template: Template) => {
    onTemplateSelect(template);
  };

  const handlePreview = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewTemplate(template);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-6xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-semibold">Template Library</h2>
              <p className="text-sm text-gray-500">Choose from professional templates to get started quickly</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ×
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r bg-gray-50 p-4">
              <div className="space-y-2 mb-6">
                {TEMPLATE_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded text-left hover:bg-gray-200 ${
                      selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : ''
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-xs text-gray-500">{category.count}</span>
                  </button>
                ))}
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPremiumOnly}
                    onChange={(e) => setShowPremiumOnly(e.target.checked)}
                    className="rounded"
                  />
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Premium Only
                </label>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Search and Controls */}
              <div className="p-4 border-b flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                  />
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border rounded"
                >
                  <option value="popular">Most Popular</option>
                  <option value="recent">Most Recent</option>
                  <option value="rating">Highest Rated</option>
                </select>

                <div className="flex border rounded">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Templates Grid/List */}
              <div className="flex-1 overflow-auto p-4">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleTemplateClick(template)}
                      >
                        <div className="aspect-[4/3] bg-gray-100 relative">
                          <img
                            src={template.thumbnail}
                            alt={template.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA4VjE2TTggMTJIMTYiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                            }}
                          />
                          {template.isPremium && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              PRO
                            </div>
                          )}
                        </div>
                        
                        <div className="p-3">
                          <h3 className="font-medium text-sm truncate">{template.name}</h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">{template.rating}</span>
                            </div>
                            <span className="text-xs text-gray-500">{template.downloads} uses</span>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            {template.colors.slice(0, 4).map((color, index) => (
                              <div
                                key={index}
                                className="w-3 h-3 rounded-full border border-gray-200"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handlePreview(template, e)}
                              className="p-2 bg-white rounded-full hover:bg-gray-100"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTemplates.map(template => (
                      <div
                        key={template.id}
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleTemplateClick(template)}
                      >
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{template.name}</h3>
                            {template.isPremium && (
                              <span className="bg-yellow-500 text-white px-2 py-0.5 rounded text-xs flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                PRO
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">{template.rating}</span>
                            </div>
                            <span className="text-xs text-gray-500">{template.downloads} uses</span>
                            <span className="text-xs text-gray-500">{template.dimensions.width}×{template.dimensions.height}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handlePreview(template, e)}
                            className="p-2 hover:bg-gray-100 rounded"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded">
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-500">by {previewTemplate.author}</p>
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
                    <span className="text-sm">{previewTemplate.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{previewTemplate.downloads} uses</span>
                  <span className="text-sm text-gray-500">
                    {previewTemplate.dimensions.width}×{previewTemplate.dimensions.height}
                  </span>
                </div>
                <button
                  onClick={() => {
                    handleTemplateClick(previewTemplate);
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