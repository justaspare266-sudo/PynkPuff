'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductSelectorProps {
  products: Record<string, any[]>;
  activeSelector: string | null;
  onSelectProduct: (product: any) => void;
  onCloseSelector: () => void;
}

const ProductSelector = ({ 
  products, 
  activeSelector, 
  onSelectProduct, 
  onCloseSelector 
}: ProductSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get available categories
  const categories = useMemo(() => {
    const cats = ['All', ...Object.keys(products).filter(key => products[key]?.length > 0)];
    return cats;
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    if (!activeSelector) return [];
    
    let categoryProducts = products[activeSelector.toLowerCase()] || [];
    
    if (selectedCategory !== 'All') {
      categoryProducts = categoryProducts.filter(p => 
        p.category === selectedCategory || 
        p.name?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    if (searchTerm) {
      categoryProducts = categoryProducts.filter(p =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.titles?.default?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return categoryProducts;
  }, [products, activeSelector, selectedCategory, searchTerm]);

  if (!activeSelector) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Select a category to browse products</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">
          Select {activeSelector}
        </h3>
        <button
          onClick={onCloseSelector}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close product selector"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder={`Search ${activeSelector.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-4 py-2 text-sm rounded-full transition-colors ${
                selectedCategory === category 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              onClick={() => onSelectProduct(product)}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <div className="relative aspect-square">
                <img
                  src={product.imageUrl || product.media?.main_image?.url || product.media?.default?.src || product.properties?.swatches?.[0]?.images?.[0] || 'https://placehold.co/200x200/f0f0f0/a0a0a0?text=No+Image'}
                  alt={product.name || product.titles?.default || 'Product'}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/f0f0f0/a0a0a0?text=No+Image';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
              </div>
              <div className="p-3">
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  {product.name || product.titles?.default}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {product.category || 'Unknown'}
                </p>
                {product.price && (
                  <p className="text-sm font-semibold text-indigo-600 mt-1">
                    £{product.price}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>No {activeSelector.toLowerCase()} found</p>
          <p className="text-sm">Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Product Count */}
      <div className="text-sm text-gray-500 text-center">
        {filteredProducts.length} {activeSelector.toLowerCase()} found
      </div>
    </div>
  );
};

export default ProductSelector;
