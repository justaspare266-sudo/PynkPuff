/**
 * Icon Statistics Component
 * Shows real-time icon statistics
 */

import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Download, 
  Eye, 
  Heart, 
  TrendingUp, 
  BarChart3,
  Users,
  Calendar
} from 'lucide-react';

interface IconStatsProps {
  className?: string;
}

const IconStats: React.FC<IconStatsProps> = ({ className = '' }) => {
  const [stats, setStats] = useState({
    totalIcons: 2024,
    totalCategories: 15,
    totalVariants: 4,
    totalDownloads: 0,
    totalViews: 0,
    mostPopularCategory: 'household',
    lastUpdated: new Date()
  });

  useEffect(() => {
    // Load stats from generated data
    const loadStats = async () => {
      try {
        const response = await fetch('/src/data/icons/all-icons.json');
        if (response.ok) {
          const icons = await response.json();
          const totalDownloads = icons.reduce((sum: number, icon: any) => sum + (icon.downloads || 0), 0);
          const totalViews = icons.reduce((sum: number, icon: any) => sum + (icon.views || 0), 0);
          
          // Find most popular category
          const categoryCounts = icons.reduce((acc: any, icon: any) => {
            acc[icon.category] = (acc[icon.category] || 0) + 1;
            return acc;
          }, {});
          
          const mostPopularCategory = Object.keys(categoryCounts).reduce((a, b) => 
            categoryCounts[a] > categoryCounts[b] ? a : b
          );

          setStats({
            totalIcons: icons.length,
            totalCategories: Object.keys(categoryCounts).length,
            totalVariants: 4,
            totalDownloads,
            totalViews,
            mostPopularCategory,
            lastUpdated: new Date()
          });
        }
      } catch (error) {
        console.error('Error loading icon stats:', error);
      }
    };

    loadStats();
  }, []);

  const statItems = [
    {
      icon: Star,
      label: 'Total Icons',
      value: stats.totalIcons.toLocaleString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: BarChart3,
      label: 'Categories',
      value: stats.totalCategories.toString(),
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Download,
      label: 'Downloads',
      value: stats.totalDownloads.toLocaleString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: Eye,
      label: 'Views',
      value: stats.totalViews.toLocaleString(),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      icon: Heart,
      label: 'Most Popular',
      value: stats.mostPopularCategory,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      icon: TrendingUp,
      label: 'Variants',
      value: stats.totalVariants.toString(),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Icon Statistics</h3>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            Updated {stats.lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                  <div className={`text-lg font-semibold ${item.color}`}>
                    {item.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Collection Progress</span>
            <span>100% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: '100%' }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            All {stats.totalIcons.toLocaleString()} icons loaded and ready to use
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Category Breakdown</h4>
          <div className="space-y-2">
            {[
              { name: 'Household', count: 192, color: 'bg-blue-500' },
              { name: 'People', count: 148, color: 'bg-green-500' },
              { name: 'Emotions', count: 140, color: 'bg-red-500' },
              { name: 'Media', count: 136, color: 'bg-purple-500' },
              { name: 'System', count: 152, color: 'bg-orange-500' },
              { name: 'Others', count: 1256, color: 'bg-gray-500' }
            ].map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                  <span className="text-sm text-gray-700">{category.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {category.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IconStats;
