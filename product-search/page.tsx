"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, Plus, FolderOpen, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Product } from '@/types/product';
import { CollectionModal } from '@/components/ui/collection-modal';
import { SearchTabs } from '@/components/ui/search-tabs';
import { useAuthorization } from '@/hooks/useAuthorization';

type ProductSwatchType = NonNullable<NonNullable<Product['properties']>['swatches']>[number];

interface Collection {
  id: string;
  name: string;
  products: Array<{
    product: Product;
    selectedSwatch: ProductSwatchType | null;
    imageUrl: string;
  }>;
  createdAt: string;
  isPublic: boolean;
}

// Advanced Performance Monitoring Interface
interface PerformanceMetrics {
  renderCount: number;
  apiCallCount: number;
  errorCount: number;
  lastReset: number;
  status: 'normal' | 'throttled' | 'critical';
}

// Independent State Management Interfaces
interface ImageState {
  status: 'loading' | 'loaded' | 'error' | 'no-image';
  retryCount: number;
  lastAttempt: number;
}

interface ApiState {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
  timestamp: number;
  retryCount: number;
}

export default function ProductSearchPage() {
  // Performance Monitoring State
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    apiCallCount: 0,
    errorCount: 0,
    lastReset: Date.now(),
    status: 'normal'
  });

  // Independent State Management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('name');
  const [showFilters, setShowFilters] = useState(false);
  
  // Collections with Independent State
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isDockingStationCollapsed, setIsDockingStationCollapsed] = useState(false);
  
  // Image State Management - Independent per image
  const [imageStates, setImageStates] = useState<Record<string, ImageState>>({});
  
  // API State Management - Independent per endpoint
  const [apiStates, setApiStates] = useState<Record<string, ApiState>>({});
  
  // Performance Monitoring Refs
  const renderCountRef = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const lastResetRef = useRef(Date.now());
  
  const { userEmail } = useAuthorization();
  const userId = userEmail || "public";

  // Performance Monitoring Effect - COMPLETELY DISABLED to prevent API abuse
  // This was causing infinite loops and hammering the third-party API
  // Re-enabled only when needed for debugging
  /*
  useEffect(() => {
    const now = Date.now();
    const timeSinceReset = now - performanceMetrics.lastReset;
    
    // Reset counters every second
    if (timeSinceReset > 1000) {
      setPerformanceMetrics(prev => ({
        ...prev,
        renderCount: 0,
        apiCallCount: 0,
        errorCount: 0,
        lastReset: now
      }));
    }
    
    // Performance thresholds and cutoffs - Much more realistic levels
    if (performanceMetrics.renderCount > 10000 || 
        performanceMetrics.apiCallCount > 1000 || 
        performanceMetrics.errorCount > 100) {
      
      console.warn('⚠️ PERFORMANCE THRESHOLDS APPROACHING - Monitoring closely');
      // FIXED: Don't update status in the same effect that depends on it
      if (performanceMetrics.status !== 'throttled') {
        setPerformanceMetrics(prev => ({ ...prev, status: 'throttled' }));
      }
      
      // Only implement emergency stop for truly critical issues
      if (performanceMetrics.status === 'throttled' && 
          (performanceMetrics.renderCount > 50000 || 
           performanceMetrics.apiCallCount > 5000 || 
           performanceMetrics.errorCount > 500)) {
        console.error('🚨 CRITICAL PERFORMANCE ISSUE - IMPLEMENTING EMERGENCY STOP');
        setPerformanceMetrics(prev => ({ ...prev, status: 'critical' }));
        return;
      }
    }
  }, [performanceMetrics.lastReset, performanceMetrics.renderCount, performanceMetrics.apiCallCount, performanceMetrics.errorCount, performanceMetrics.status]);
  */

  // Render Performance Monitoring - removed to prevent infinite loops

  // Independent Image State Management
  const updateImageState = useCallback((imageId: string, newState: Partial<ImageState>) => {
    setImageStates(prev => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        ...newState,
        lastAttempt: Date.now()
      }
    }));
  }, []);

  // Independent API State Management
  const updateApiState = useCallback((endpoint: string, newState: Partial<ApiState>) => {
    setApiStates(prev => ({
      ...prev,
      [endpoint]: {
        ...prev[endpoint],
        ...newState,
        timestamp: Date.now()
      }
    }));
  }, []);

  // Auto-correct search terms to bypass redirects
  const autoCorrectSearchTerm = useCallback((searchTerm: string): string => {
    const redirectWords: Record<string, string> = {
      'dresses': 'dre sses',
      'shoes': 's hoes', 
      'tops': 't ops',
      'bags': 'b ags',
      'accessories': 'a ccessories',
      'jewelry': 'j ewelry',
      'handbags': 'h andbags',
      'sandals': 's andals',
      'boots': 'b oots',
      'heels': 'h eels',
      'flats': 'f lats',
      'sneakers': 's neakers',
      'blouses': 'b louses',
      'skirts': 's kirts',
      'pants': 'p ants',
      'jeans': 'j eans',
      'jackets': 'j ackets',
      'coats': 'c oats',
      'sweaters': 's weaters',
      'cardigans': 'c ardigans'
    };
    
    const lowerTerm = searchTerm.toLowerCase().trim();
    if (lowerTerm in redirectWords) {
      console.log(`🔄 Auto-correcting "${searchTerm}" to "${redirectWords[lowerTerm]}" to bypass redirect`);
      return redirectWords[lowerTerm];
    }
    
    return searchTerm;
  }, []);

  // Optimized Image URL Function
  const optimizeImageUrl = useCallback((url: string | undefined | null): string => {
    if (!url) return '';
    
    // Avoid double-adding params if they somehow already exist
    if (url.includes('?fmt=jpg')) return url;
    // Check if URL already has query params
    return url.includes('?') ? `${url}&fmt=jpg&qlt=90&w=1200` : `${url}?fmt=jpg&qlt=90&w=1200`;
  }, []);

  // Collections API with Independent State Management
  const fetchCollections = useCallback(async () => {
    const endpoint = 'collections';
    
    // Check if we're throttled
    if (performanceMetrics.status === 'throttled') {
      console.warn('⚠️ API calls throttled due to performance issues');
      return;
    }
    
    // Update API state
    updateApiState(endpoint, { status: 'loading' });
    
    try {
      const response = await fetch(`/api/collections?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.collections) {
          setCollections(data.collections);
          localStorage.setItem(`collections_${userId}`, JSON.stringify(data.collections));
          
          // Update API state on success
          updateApiState(endpoint, { 
            status: 'success', 
            data: data.collections,
            retryCount: 0 
          });
          return;
        }
      }
      
      // Fallback to localStorage
      const storedCollections = localStorage.getItem(`collections_${userId}`);
      if (storedCollections) {
        setCollections(JSON.parse(storedCollections));
        updateApiState(endpoint, { 
          status: 'success', 
          data: JSON.parse(storedCollections),
          retryCount: 0 
        });
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      
      // Update API state on error
      updateApiState(endpoint, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: (apiStates[endpoint]?.retryCount || 0) + 1
      });
      
      // Update performance metrics
      setPerformanceMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
      
      try {
        const storedCollections = localStorage.getItem(`collections_${userId}`);
        if (storedCollections) {
          setCollections(JSON.parse(storedCollections));
        }
      } catch (localStorageError) {
        console.error('Error reading from localStorage:', localStorageError);
      }
    }
  }, [userId, performanceMetrics.status]);

  // Add to Collection with Performance Monitoring
  const addToCollection = useCallback(async (product: Product) => {
    if (!activeCollection) {
      setSelectedProduct(product);
      setShowCollectionModal(true);
      return;
    }

    const endpoint = 'add-to-collection';
    
    try {
      const collection = collections.find(c => c.id === activeCollection);
      if (!collection) return;

      const newProduct = {
        product,
        selectedSwatch: null,
        imageUrl: optimizeImageUrl(product.media?.main_image?.url)
      };

      const updatedCollection = {
        ...collection,
        products: [...collection.products, newProduct]
      };

      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'public',
          collection: updatedCollection
        })
      });

      if (response.ok) {
        const updatedCollections = collections.map(c => 
          c.id === activeCollection ? updatedCollection : c
        );
        console.log('✅ Collection updated successfully:', {
          activeCollection,
          updatedCollection,
          updatedCollections
        });
        setCollections(updatedCollections);
        localStorage.setItem(`collections_${userId}`, JSON.stringify(updatedCollections));
        
        // Force a re-render by updating the collections state
        setTimeout(() => {
          setCollections(prev => [...prev]);
        }, 100);
        
        updateApiState(endpoint, { status: 'success', data: updatedCollection });
        
        // Show success feedback
        const collection = collections.find(c => c.id === activeCollection);
        if (collection) {
          console.log(`✅ Added "${product.titles?.default || 'Product'}" to "${collection.name}"`);
        }
      } else {
        console.error('❌ Failed to update collection:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error adding to collection:', error);
      updateApiState(endpoint, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      setPerformanceMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    }
  }, [activeCollection, collections, userId, optimizeImageUrl, updateApiState]);

  const removeFromCollection = useCallback(async (productId: string, collectionId: string) => {
    const endpoint = 'remove-from-collection';
    
    try {
      const collection = collections.find(c => c.id === collectionId);
      if (!collection) return;

      const updatedCollection = {
        ...collection,
        products: collection.products.filter((item: any) => item.product.id !== productId)
      };

      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'public',
          collection: updatedCollection
        })
      });

      if (response.ok) {
        const updatedCollections = collections.map(c => 
          c.id === collectionId ? updatedCollection : c
        );
        console.log('✅ Product removed from collection successfully');
        setCollections(updatedCollections);
        localStorage.setItem(`collections_${userId}`, JSON.stringify(updatedCollections));
        
        // Force a re-render
        setTimeout(() => {
          setCollections(prev => [...prev]);
        }, 100);
        
        updateApiState(endpoint, { status: 'success' });
      } else {
        console.error('❌ Failed to remove from collection:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error removing from collection:', error);
      updateApiState(endpoint, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, [collections, userId, updateApiState]);

  // Create Collection with Performance Monitoring
  const createCollection = useCallback(async (name: string): Promise<string> => {
    const endpoint = 'create-collection';
    
    const newCollection: Collection = {
      id: `collection_${Date.now()}`,
      name,
      products: [],
      createdAt: new Date().toISOString(),
      isPublic: true
    };

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId || 'public',
          collection: newCollection
        })
      });

      if (response.ok) {
        const updatedCollections = [...collections, newCollection];
        setCollections(updatedCollections);
        localStorage.setItem(`collections_${userId}`, JSON.stringify(updatedCollections));
        
        updateApiState(endpoint, { status: 'success', data: newCollection });
        return newCollection.id;
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      updateApiState(endpoint, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      setPerformanceMetrics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1
      }));
    }
    return '';
  }, [collections, userId, updateApiState]);

  // Memoized Collections Data
  const activeCollectionData = useMemo(() => 
    collections.find(c => c.id === activeCollection), 
    [collections, activeCollection]
  );

  // Effect for Initial Load with Dependency Management
  useEffect(() => {
    fetchCollections();
  }, []); // Only run once on mount

  // Performance Status Display
  const getPerformanceStatus = () => {
    if (performanceMetrics.status === 'critical') return '🚨 CRITICAL';
    if (performanceMetrics.status === 'throttled') return '⚠️ THROTTLED';
    return '✅ NORMAL';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Performance Monitor (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50">
          <div>Status: {getPerformanceStatus()}</div>
          <div>Renders: {performanceMetrics.renderCount}</div>
          <div>API Calls: {performanceMetrics.apiCallCount}</div>
          <div>Errors: {performanceMetrics.errorCount}</div>
        </div>
      )}

      {/* Page Title */}
      <div className="text-center py-8">
        <h1 className="text-5xl font-light text-gray-900" style={{ fontFamily: 'Austin, serif' }}>
          Product Search
        </h1>
      </div>

      {/* Search Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 pb-32">
        <SearchTabs
          onAddToCollection={addToCollection}
          onAddAmplienceAssetToCollection={(asset) => addToCollection({
            id: asset.id,
            titles: { default: asset.name },
            media: {
              main_image: {
                url: asset.imageUrl || '',
                alt: asset.name
              }
            },
            pricing: {
              current: {
                value: 0,
                formatted: '$0.00',
                currency: 'USD'
              },
              on_sale: false
            },
            stock: {
              available: true
            },
            properties: { swatches: [] },
            variants: []
          } as Product)}
        />
      </div>

      {/* Collections Management Bottom Panel */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Collection Management
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDockingStationCollapsed(!isDockingStationCollapsed)}
                className="h-6 w-6 p-0"
              >
                {isDockingStationCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCollectionModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Collection
              </Button>
              <span className="text-sm text-gray-500">
                {collections.length} collection{collections.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {/* Collapsible Collection Content */}
          {!isDockingStationCollapsed && (
            <>
              {/* Collection Toggle Buttons */}
              {collections.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {collections.map((collection) => (
                    <Button
                      key={collection.id}
                      variant={selectedCollectionId === collection.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCollectionId(
                        selectedCollectionId === collection.id ? null : collection.id
                      )}
                      className="flex items-center gap-2"
                    >
                      <FolderOpen className="h-4 w-4" />
                      {collection.name}
                      <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs">
                        {collection.products.length}
                      </span>
                    </Button>
                  ))}
                </div>
              )}

              {/* Selected Collection Items */}
              {selectedCollectionId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                      {collections.find(c => c.id === selectedCollectionId)?.name} Items
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCollectionId(null)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {collections.find(c => c.id === selectedCollectionId)?.products.map((item: any) => {
                      // Add null checks for item and item.product
                      if (!item || !item.product) {
                        return null;
                      }
                      
                      const product = item.product;
                      const imageUrl = item.imageUrl || product.media?.main_image?.url;
                      const productName = product.name || product.titles?.default || 'Product';
                      
                      return (
                        <div key={product.id} className="flex-shrink-0 w-20 group relative">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            {imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={productName}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-500">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="mt-1">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {productName}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFromCollection(product.id, selectedCollectionId)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No collections message */}
              {collections.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FolderOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h4>
                  <p className="text-gray-500">Create your first collection to start organizing products</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCollectionModal(true)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Collection
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>



      {/* Collection Modal */}
      <CollectionModal
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
        collections={collections}
        onAddToCollection={async (collectionId) => {
          if (selectedProduct) {
            await addToCollection(selectedProduct);
          }
          setShowCollectionModal(false);
          setSelectedProduct(null);
        }}
        itemName={selectedProduct?.titles?.default || 'Product'}
        onCreateCollection={createCollection}
      />
    </div>
  );
}