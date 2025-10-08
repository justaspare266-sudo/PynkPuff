/**
 *Iconsax Icon Library Demo
 * Demonstrates the icon library functionality
 */

import React, { useState } from 'react';
import IconLibrary from './IconLibrary';
import { Star, Download, Search, Grid, List } from 'lucide-react';

const IconLibraryDemo: React.FC = () => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<any>(null);
  const [recentIcons, setRecentIcons] = useState<any[]>([]);

  const handleIconSelect = (icon: any) => {
    setSelectedIcon(icon);
    setRecentIcons(prev => [icon, ...prev.filter(i => i.id !== icon.id)].slice(0, 5));
    setShowLibrary(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Iconsax Icon Library Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Beautiful, searchable icon library inspired by Iconsax
          </p>
          
          <button
            onClick={() => setShowLibrary(true)}
            className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
          >
            <Star className="inline w-6 h-6 mr-2" />
            Open Icon Library
          </button>
        </div>

        {/* Selected Icon Display */}
        {selectedIcon && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Selected Icon</h2>
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <div 
                  className="w-12 h-12 text-gray-700"
                  dangerouslySetInnerHTML={{ __html: selectedIcon.svg }}
                />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900">{selectedIcon.name}</h3>
                <p className="text-gray-600 capitalize">{selectedIcon.category}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedIcon.keywords.map((keyword: string) => (
                    <span 
                      key={keyword}
                      className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Icons */}
        {recentIcons.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Icons</h2>
            <div className="grid grid-cols-5 gap-4">
              {recentIcons.map((icon) => (
                <div
                  key={icon.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedIcon(icon)}
                >
                  <div className="w-8 h-8 mx-auto mb-2 text-gray-600">
                    <div dangerouslySetInnerHTML={{ __html: icon.svg }} />
                  </div>
                  <div className="text-sm text-center text-gray-600 truncate">
                    {icon.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Search className="w-8 h-8 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Search</h3>
            <p className="text-gray-600">
              Search icons by name, keywords, or tags. Find exactly what you need quickly.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Grid className="w-8 h-8 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiple Views</h3>
            <p className="text-gray-600">
              Switch between grid and list views. Choose what works best for you.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Download className="w-8 h-8 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Integration</h3>
            <p className="text-gray-600">
              One-click to add icons to your canvas. Seamless workflow integration.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">300+ Icons Available</h2>
          <p className="text-xl mb-6">
            Beautiful, consistent icons across 15 categories
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold">15</div>
              <div className="text-purple-200">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold">300+</div>
              <div className="text-purple-200">Icons</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4</div>
              <div className="text-purple-200">Variants</div>
            </div>
            <div>
              <div className="text-3xl font-bold">∞</div>
              <div className="text-purple-200">Possibilities</div>
            </div>
          </div>
        </div>
      </div>

      {/* Icon Library Modal */}
      {showLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-4/5 h-4/5 max-w-6xl">
            <IconLibrary
              onIconSelect={handleIconSelect}
              onClose={() => setShowLibrary(false)}
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default IconLibraryDemo;
