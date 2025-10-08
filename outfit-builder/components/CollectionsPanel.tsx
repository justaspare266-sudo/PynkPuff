'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CollectionsPanelProps {
  collections: any[];
  selectedCollection: any;
  onSelectCollection: (collection: any) => void;
  onLoadOutfit: (collection: any) => void;
}

const CollectionsPanel = ({ 
  collections, 
  selectedCollection, 
  onSelectCollection, 
  onLoadOutfit 
}: CollectionsPanelProps) => {
  if (collections.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">📁</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Collections Yet</h3>
        <p className="text-sm text-gray-500">
          Create your first outfit collection to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Saved Collections</h3>
      
      {/* Collection Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Collection
        </label>
        <select
          value={selectedCollection?.id || ''}
          onChange={(e) => {
            const collection = collections.find(c => c.id === e.target.value);
            onSelectCollection(collection);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Select collection"
        >
          <option value="">Choose a collection...</option>
          {collections.map(collection => (
            <option key={collection.id} value={collection.id}>
              {collection.name || `Collection ${collection.id}`} ({collection.products?.length || 0} items)
            </option>
          ))}
        </select>
      </div>

      {/* Selected Collection Details */}
      {selectedCollection && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-lg p-4 border"
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-gray-800">
              {selectedCollection.name || `Collection ${selectedCollection.id}`}
            </h4>
            {selectedCollection.isPublic && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Public
              </span>
            )}
          </div>
          
          {selectedCollection.description && (
            <p className="text-sm text-gray-600 mb-3">
              {selectedCollection.description}
            </p>
          )}
          
          {/* Collection Products Preview */}
          {selectedCollection.products && selectedCollection.products.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Items in Collection ({selectedCollection.products.length})
              </h5>
              <div className="grid grid-cols-3 gap-2">
                {selectedCollection.products?.slice(0, 6).map((item: any, index: number) => {
                  if (!item || !item.product) return null;
                  
                  return (
                    <div key={index} className="text-center">
                                          <img 
                      src={item.product?.imageUrl || item.product?.media?.main_image?.url || item.product?.media?.default?.src || item.product?.properties?.swatches?.[0]?.images?.[0] || 'https://placehold.co/100x64/f0f0f0/a0a0a0?text=No+Image'} 
                      alt={item.product?.name || item.product?.titles?.default || 'Product'} 
                      className="w-full h-16 object-cover object-top rounded-md"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x64/f0f0f0/a0a0a0?text=Error'; 
                      }}
                    />
                      <p className="text-xs mt-1 text-gray-600 truncate">
                        {item.product?.name || item.product?.titles?.default || 'Unknown'}
                      </p>
                    </div>
                  );
                })}
                {selectedCollection.products && selectedCollection.products.length > 6 && (
                  <div className="text-center">
                    <div className="w-full h-16 bg-gray-200 rounded-md flex items-center justify-center">
                      <span className="text-xs text-gray-500">
                        +{selectedCollection.products.length - 6} more
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Collection Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => onLoadOutfit(selectedCollection)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Load for Editing
            </button>
            <button
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              title="Share collection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
          
          {/* Collection Metadata */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>
                Created: {new Date(selectedCollection.createdAt).toLocaleDateString()}
              </span>
              {selectedCollection.isPublic && (
                <div className="flex items-center space-x-2">
                  <span>👁️ {selectedCollection.views || 0}</span>
                  <span>❤️ {selectedCollection.likes || 0}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Collections List */}
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700">All Collections</h5>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {collections.map((collection) => (
            <motion.div
              key={collection.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                selectedCollection?.id === collection.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => onSelectCollection(collection)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h6 className="font-medium text-gray-800 truncate">
                    {collection.name || `Collection ${collection.id}`}
                  </h6>
                  <p className="text-xs text-gray-500">
                    {collection.products?.length || 0} items
                  </p>
                </div>
                {collection.isPublic && (
                  <span className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                    Public
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionsPanel;
