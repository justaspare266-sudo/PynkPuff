/**
 * Navigation Component
 * Main navigation for the image editor
 */

import React from 'react';
import { 
  Home, 
  Image, 
  Star, 
  Settings, 
  HelpCircle,
  Palette,
  Download,
  Upload,
  History,
  Activity
} from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange,
  className = ''
}) => {
  const navigationItems = [
    {
      id: 'editor',
      label: 'Editor',
      icon: Image,
      description: 'Main image editor'
    },
    {
      id: 'icons',
      label: 'Icon Manager',
      icon: Star,
      description: 'Browse and manage icons'
    },
    {
      id: 'palette',
      label: 'Color Palette',
      icon: Palette,
      description: 'Color management tools'
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      description: 'View edit history'
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      description: 'Export your work'
    },
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      description: 'Import files and assets'
    },
    {
      id: 'performance',
      label: 'Performance',
      icon: Activity,
      description: 'Monitor performance'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Application settings'
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      description: 'Get help and support'
    }
  ];

  return (
    <nav className={`bg-white shadow-sm border-r ${className}`}>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Image className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Image Editor</h1>
            <p className="text-xs text-gray-500">Professional Tools</p>
          </div>
        </div>

        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={item.description}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500 hidden group-hover:block">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-2">Quick Stats</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Icons Available</span>
              <span className="font-medium">2,024</span>
            </div>
            <div className="flex justify-between">
              <span>Categories</span>
              <span className="font-medium">15</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated</span>
              <span className="font-medium">Now</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
