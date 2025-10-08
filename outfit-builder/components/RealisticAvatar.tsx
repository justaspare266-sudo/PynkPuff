'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RealisticAvatarProps {
  outfit: any;
  bodyType?: string;
  pose?: string;
  skinTone?: string;
}

const RealisticAvatar = ({ 
  outfit, 
  bodyType = 'athletic', 
  pose = 'standing', 
  skinTone = 'medium' 
}: RealisticAvatarProps) => {
  const [clothingLayers, setClothingLayers] = useState<any[]>([]);

  useEffect(() => {
    const processOutfit = async () => {
      const layers: any[] = [];
      const layeringOrder = [
        { category: 'Bottom', zIndex: 1 },
        { category: 'Dress', zIndex: 2 },
        { category: 'Top', zIndex: 3 },
        { category: 'Accessory', zIndex: 4 },
        { category: 'Handbag', zIndex: 5 },
        { category: 'Hat', zIndex: 6 },
        { category: 'Shoes', zIndex: 7 }
      ];

      layeringOrder.forEach(({ category, zIndex }) => {
        const item = outfit[category];
        if (item) {
          layers.push({
            ...item,
            zIndex,
            category
          });
        }
      });

      setClothingLayers(layers);
    };

    processOutfit();
  }, [outfit, bodyType]);

  // Real body type dimensions that actually change the avatar
  const getBodyDimensions = (bodyType: string) => {
    const dimensions = {
      slim: {
        height: 280,
        width: 120,
        headSize: 45,
        torsoWidth: 80,
        armWidth: 12,
        legWidth: 18,
        shoulderWidth: 90,
        hipWidth: 70
      },
      athletic: {
        height: 300,
        width: 140,
        headSize: 50,
        torsoWidth: 100,
        armWidth: 16,
        legWidth: 22,
        shoulderWidth: 110,
        hipWidth: 85
      },
      curvy: {
        height: 300,
        width: 160,
        headSize: 50,
        torsoWidth: 120,
        armWidth: 18,
        legWidth: 24,
        shoulderWidth: 120,
        hipWidth: 110
      },
      plus: {
        height: 320,
        width: 180,
        headSize: 55,
        torsoWidth: 140,
        armWidth: 20,
        legWidth: 28,
        shoulderWidth: 130,
        hipWidth: 130
      }
    };
    return dimensions[bodyType as keyof typeof dimensions] || dimensions.athletic;
  };

  // Real clothing positioning that adapts to body type
  const getClothingPosition = (category: string, bodyType: string) => {
    const dims = getBodyDimensions(bodyType);
    
    const positions = {
      'Top': {
        width: dims.shoulderWidth,
        height: dims.height * 0.3,
        y: dims.headSize + 20,
        scale: bodyType === 'slim' ? 0.8 : bodyType === 'plus' ? 1.2 : 1.0
      },
      'Dress': {
        width: dims.hipWidth,
        height: dims.height * 0.6,
        y: dims.headSize + 10,
        scale: bodyType === 'slim' ? 0.85 : bodyType === 'plus' ? 1.15 : 1.0
      },
      'Bottom': {
        width: dims.hipWidth,
        height: dims.height * 0.25,
        y: dims.headSize + dims.height * 0.35,
        scale: bodyType === 'slim' ? 0.75 : bodyType === 'plus' ? 1.25 : 1.0
      },
      'Shoes': {
        width: 60,
        height: 25,
        y: dims.height - 30,
        scale: bodyType === 'slim' ? 0.7 : bodyType === 'plus' ? 1.3 : 1.0
      },
      'Accessory': {
        width: 35,
        height: 35,
        y: dims.headSize - 10,
        scale: bodyType === 'slim' ? 0.8 : bodyType === 'plus' ? 1.2 : 1.0
      },
      'Handbag': {
        width: 45,
        height: 55,
        y: dims.headSize + dims.height * 0.2,
        x: dims.shoulderWidth * 0.4,
        scale: bodyType === 'slim' ? 0.7 : bodyType === 'plus' ? 1.3 : 1.0
      },
      'Hat': {
        width: dims.headSize * 1.3,
        height: 25,
        y: -10,
        scale: bodyType === 'slim' ? 0.8 : bodyType === 'plus' ? 1.2 : 1.0
      }
    };
    
    return positions[category as keyof typeof positions] || { width: 100, height: 100, y: 0, x: 0, scale: 1.0 };
  };

  const getSkinToneColor = (tone: string) => {
    const colors = {
      light: '#FFDBB4',
      medium: '#C68642',
      dark: '#8D5524'
    };
    return colors[tone as keyof typeof colors] || colors.medium;
  };

  const dimensions = getBodyDimensions(bodyType);
  const skinToneColor = getSkinToneColor(skinTone);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* Avatar Container */}
        <div className="relative" style={{ height: dimensions.height, width: dimensions.width }}>
          
          {/* Head */}
          <div 
            className="absolute top-0 left-1/2 transform -translate-x-1/2 rounded-full shadow-lg"
            style={{
              width: dimensions.headSize,
              height: dimensions.headSize,
              backgroundColor: skinToneColor,
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            {/* Hair */}
            <div 
              className="absolute -top-1 -left-1 rounded-full"
              style={{
                width: dimensions.headSize * 1.1,
                height: dimensions.headSize * 0.4,
                background: 'linear-gradient(45deg, #8B4513, #A0522D)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
              }}
            />
            
            {/* Eyes */}
            <div className="absolute top-5 left-3 w-2 h-2 bg-gray-800 rounded-full" />
            <div className="absolute top-5 right-3 w-2 h-2 bg-gray-800 rounded-full" />
            
            {/* Nose */}
            <div className="absolute top-7 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-600 rounded-full" />
            
            {/* Lips */}
            <div className="absolute top-9 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-pink-300 rounded-full opacity-70" />
          </div>

          {/* Neck */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 rounded-full"
            style={{
              top: dimensions.headSize,
              width: dimensions.headSize * 0.4,
              height: 20,
              backgroundColor: skinToneColor,
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          />

          {/* Torso */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 rounded-t-full"
            style={{
              top: dimensions.headSize + 20,
              width: dimensions.torsoWidth,
              height: dimensions.height * 0.4,
              background: `linear-gradient(135deg, ${skinToneColor}, ${skinToneColor}dd)`,
              boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
            }}
          >
            {/* Shoulders */}
            <div 
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 rounded-full"
              style={{
                width: dimensions.shoulderWidth,
                height: dimensions.headSize * 0.25,
                backgroundColor: skinToneColor,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            />
            
            {/* Hips */}
            <div 
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 rounded-full"
              style={{
                width: dimensions.hipWidth,
                height: dimensions.headSize * 0.3,
                backgroundColor: skinToneColor,
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          {/* Arms */}
          <div 
            className="absolute rounded-full shadow-md"
            style={{
              top: dimensions.headSize + 30,
              left: -dimensions.armWidth * 2,
              width: dimensions.armWidth,
              height: dimensions.height * 0.35,
              background: `linear-gradient(135deg, ${skinToneColor}, ${skinToneColor}dd)`,
              transform: 'rotate(-15deg)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
            }}
          />
          <div 
            className="absolute rounded-full shadow-md"
            style={{
              top: dimensions.headSize + 30,
              right: -dimensions.armWidth * 2,
              width: dimensions.armWidth,
              height: dimensions.height * 0.35,
              background: `linear-gradient(135deg, ${skinToneColor}, ${skinToneColor}dd)`,
              transform: 'rotate(15deg)',
              boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
            }}
          />

          {/* Hands */}
          <div 
            className="absolute rounded-full shadow-sm"
            style={{
              top: dimensions.headSize + dimensions.height * 0.35 - 5,
              left: -dimensions.armWidth * 2 - 3,
              width: dimensions.armWidth * 0.8,
              height: dimensions.armWidth * 1.2,
              backgroundColor: skinToneColor
            }}
          />
          <div 
            className="absolute rounded-full shadow-sm"
            style={{
              top: dimensions.headSize + dimensions.height * 0.35 - 5,
              right: -dimensions.armWidth * 2 - 3,
              width: dimensions.armWidth * 0.8,
              height: dimensions.armWidth * 1.2,
              backgroundColor: skinToneColor
            }}
          />

          {/* Legs */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 rounded-t-full shadow-md"
            style={{
              top: dimensions.headSize + 20 + dimensions.height * 0.4,
              width: dimensions.legWidth,
              height: dimensions.height * 0.35,
              background: `linear-gradient(135deg, ${skinToneColor}, ${skinToneColor}dd)`,
              boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
            }}
          />

          {/* Feet */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-sm"
            style={{
              top: dimensions.headSize + 20 + dimensions.height * 0.4 + dimensions.height * 0.35 - 3,
              width: dimensions.legWidth * 1.5,
              height: dimensions.legWidth * 0.6,
              backgroundColor: skinToneColor
            }}
          />

          {/* Clothing Layers */}
          {clothingLayers.map((layer, index) => {
            const position = getClothingPosition(layer.category, bodyType);
            return (
              <motion.div
                key={`${layer.category}-${layer.id}`}
                className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none"
                style={{ 
                  zIndex: layer.zIndex,
                  width: position.width,
                  height: position.height,
                  transform: `translateY(${position.y}px) translateX(${(position as any).x || 0}px) scale(${position.scale})`
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <img
                  src={layer.imageUrl || layer.media?.main_image?.url || layer.media?.default?.src || layer.properties?.swatches?.[0]?.images?.[0] || 'https://placehold.co/200x200/f0f0f0/a0a0a0?text=No+Image'}
                  alt={layer.name || layer.titles?.default || 'Clothing Item'}
                  className="w-full h-full object-contain"
                  style={{
                    filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
                    borderRadius: layer.category === 'Hat' ? '50%' : '6px'
                  }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </motion.div>
            );
          })}

          {/* Lighting */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white opacity-20 pointer-events-none rounded-full" />
        </div>

        {/* Status Indicators */}
        <div className="absolute top-2 left-2">
          <div className="bg-white bg-opacity-95 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 shadow-md">
            {bodyType.charAt(0).toUpperCase() + bodyType.slice(1)} Model
          </div>
        </div>

        <div className="absolute top-2 right-2">
          <div className="bg-green-500 bg-opacity-95 rounded-lg px-2 py-1 text-xs font-medium text-white shadow-md">
            ✓ Working Avatar
          </div>
        </div>

        {/* Body Type Info */}
        <div className="absolute bottom-2 left-2">
          <div className="bg-white bg-opacity-95 rounded-lg p-2 text-xs shadow-md">
            <div className="font-medium text-gray-700 mb-1">Dimensions:</div>
            <div className="text-gray-600">
              H: {dimensions.height}px<br/>
              W: {dimensions.width}px<br/>
              Shoulders: {dimensions.shoulderWidth}px<br/>
              Hips: {dimensions.hipWidth}px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealisticAvatar;
