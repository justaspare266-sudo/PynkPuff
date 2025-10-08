import { useState, useCallback } from 'react';
import { Artboard } from '../components/ArtboardManager';

export function useArtboards() {
  const [artboards, setArtboards] = useState<Artboard[]>([
    {
      id: 'artboard-1',
      name: 'Main Artboard',
      width: 800,
      height: 600,
      visible: true,
      locked: false,
      layers: [
        {
          id: 'layer-1',
          name: 'Layer 1',
          visible: true,
          locked: false,
          shapes: []
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  
  const [activeArtboardId, setActiveArtboardId] = useState('artboard-1');

  const createArtboard = useCallback((artboardData: Omit<Artboard, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newArtboard: Artboard = {
      ...artboardData,
      id: `artboard-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      layers: artboardData.layers && artboardData.layers.length > 0 ? artboardData.layers : [
        {
          id: `layer-${Date.now()}`,
          name: 'Layer 1',
          visible: true,
          locked: false,
          shapes: []
        }
      ]
    };
    
    setArtboards(prev => [...prev, newArtboard]);
    setActiveArtboardId(newArtboard.id);
    return newArtboard.id;
  }, []);

  const updateArtboard = useCallback((id: string, updates: Partial<Artboard>) => {
    setArtboards(prev => prev.map(artboard => 
      artboard.id === id 
        ? { ...artboard, ...updates, updatedAt: new Date() }
        : artboard
    ));
  }, []);

  const deleteArtboard = useCallback((id: string) => {
    setArtboards(prev => {
      const filtered = prev.filter(artboard => artboard.id !== id);
      if (filtered.length === 0) {
        // Always keep at least one artboard
        return prev;
      }
      return filtered;
    });
    
    // Switch to another artboard if deleting active one
    if (activeArtboardId === id) {
      setArtboards(prev => {
        const remaining = prev.filter(artboard => artboard.id !== id);
        if (remaining.length > 0) {
          setActiveArtboardId(remaining[0].id);
        }
        return remaining;
      });
    }
  }, [activeArtboardId]);

  const duplicateArtboard = useCallback((id: string) => {
    const artboard = artboards.find(a => a.id === id);
    if (!artboard) return;
    
    const duplicated: Artboard = {
      ...artboard,
      id: `artboard-${Date.now()}`,
      name: `${artboard.name} Copy`,
      createdAt: new Date(),
      updatedAt: new Date(),
      layers: artboard.layers && artboard.layers.length > 0 ? [...artboard.layers] : [
        {
          id: `layer-${Date.now()}`,
          name: 'Layer 1',
          visible: true,
          locked: false,
          shapes: []
        }
      ]
    };
    
    setArtboards(prev => [...prev, duplicated]);
    setActiveArtboardId(duplicated.id);
    return duplicated.id;
  }, [artboards]);

  const getActiveArtboard = useCallback(() => {
    return artboards.find(artboard => artboard.id === activeArtboardId);
  }, [artboards, activeArtboardId]);

  const updateArtboardLayers = useCallback((id: string, layers: any[]) => {
    updateArtboard(id, { layers });
  }, [updateArtboard]);

  return {
    artboards,
    activeArtboardId,
    setActiveArtboardId,
    createArtboard,
    updateArtboard,
    deleteArtboard,
    duplicateArtboard,
    getActiveArtboard,
    updateArtboardLayers
  };
}