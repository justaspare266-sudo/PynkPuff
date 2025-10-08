'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface OutfitSlotsProps {
  outfit: Record<string, any>;
  onRemoveItem: (category: string) => void;
  onOpenSelector: (category: string) => void;
}

const OutfitSlots = ({ outfit, onRemoveItem, onOpenSelector }: OutfitSlotsProps) => {
  const categories = ['Hat', 'Top', 'Dress', 'Bottom', 'Shoes', 'Accessory', 'Handbag'];

  // Icon for close button
  const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  // Component for a single outfit slot
  const OutfitSlot = ({ category, item }: { category: string; item: any }) => (
    <motion.div
      className="relative border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-white transition-all duration-300 hover:border-indigo-400 hover:shadow-md cursor-pointer"
      onClick={() => !item && onOpenSelector(category)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {item ? (
        <>
                      <img 
              src={item.imageUrl || item.media?.main_image?.url || item.media?.default?.src || item.properties?.swatches?.[0]?.images?.[0] || 'https://placehold.co/128x128/f0f0f0/a0a0a0?text=No+Image'} 
              alt={item.name || item.titles?.default || 'Product'} 
              className="h-full w-full object-cover object-top rounded-md"
              onError={(e) => { 
                (e.target as HTMLImageElement).src = 'https://placehold.co/128x128/f0f0f0/a0a0a0?text=Image+Error'; 
              }}
            />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemoveItem(category);
            }} 
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            aria-label={`Remove ${item.name || category}`}
          >
            <XIcon />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
            {item.name || item.titles?.default}
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="text-gray-400 text-2xl mb-1">
            {category === 'Hat' && '👒'}
            {category === 'Top' && '👕'}
            {category === 'Dress' && '👗'}
            {category === 'Bottom' && '👖'}
            {category === 'Shoes' && '👠'}
            {category === 'Accessory' && '💍'}
            {category === 'Handbag' && '👜'}
          </div>
          <span className="text-gray-400 text-sm font-medium">{category}</span>
        </div>
      )}
    </motion.div>
  );

  // Special component for the combined Top/Dress slot
  const CombinedSlot = () => {
    const topItem = outfit.Top;
    const dressItem = outfit.Dress;
    const item = topItem || dressItem;
    const category = topItem ? 'Top' : 'Dress';

    return (
      <motion.div
        className="relative border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center bg-white transition-all duration-300 hover:border-indigo-400 hover:shadow-md cursor-pointer"
        onClick={() => !item && onOpenSelector('Top')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {item ? (
          <>
            <img 
              src={item.imageUrl || item.media?.main_image?.url || item.media?.default?.src || item.properties?.swatches?.[0]?.images?.[0] || 'https://placehold.co/128x128/f0f0f0/a0a0a0?text=No+Image'} 
              alt={item.name || item.titles?.default || 'Product'} 
              className="h-full w-full object-cover object-top rounded-md"
              onError={(e) => { 
                (e.target as HTMLImageElement).src = 'https://placehold.co/128x128/f0f0f0/a0a0a0?text=Image+Error'; 
              }}
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveItem(category);
              }} 
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
              aria-label={`Remove ${item.name || category}`}
            >
              <XIcon />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
              {item.name || item.titles?.default}
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="text-gray-400 text-2xl mb-1">👕👗</div>
            <span className="text-gray-400 text-sm font-medium text-center">Top / Dress</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map(category => {
          if (category === 'Top' || category === 'Dress') {
            // Skip individual Top and Dress slots, we'll handle them in CombinedSlot
            return null;
          }
          
          return (
            <OutfitSlot 
              key={category} 
              category={category} 
              item={outfit[category]} 
            />
          );
        })}
        
        {/* Combined Top/Dress slot */}
        <CombinedSlot />
      </div>
      
      {/* Instructions */}
      <div className="text-center text-sm text-gray-500">
        <p>Click on any empty slot to add items to your outfit</p>
      </div>
    </div>
  );
};

export default OutfitSlots;
