"use client";

import { useState, useEffect, useRef } from 'react';
import type { WheelEvent } from 'react';
import { motion } from 'framer-motion';
import { Package, Calendar, Tag, Trash2, Edit3, Plus, Lock, Globe, X } from 'lucide-react';
import type { Product } from '@/types/product';
import { ProductCard } from '@/components/email-generator/ProductCard';
import { Button } from '@/components/ui/button'; // Added Button import
import { useAuthorization } from '@/hooks/useAuthorization'; // Added useAuthorization import

// Define types based on product-search page
type ProductSwatchType = NonNullable<NonNullable<Product['properties']>['swatches']>[number];

interface Collection {
  id: string;
  name: string;
  products: Array<{
    product: Product;
    selectedSwatch: ProductSwatchType | null;
    imageUrl: string;
  }>;
  createdAt: Date;
  isPublic: boolean;
  userId?: string;
  lastModified?: string;
  lastModifiedBy?: string;
}

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmptyCollections, setShowEmptyCollections] = useState(false);

  const { userEmail } = useAuthorization(); // Use userEmail from useAuthorization hook

  useEffect(() => {
    const fetchCollections = async () => {
      console.log('🔍 fetchCollections called');
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/collections?userId=${userEmail}`);
        const data = await response.json();
        console.log('🔍 API response:', { success: data.success, collectionsCount: data.collections?.length });
        
        if (data.success) {
          const loadedCollections = data.collections
            .filter((c: any) => c && c.id && c.name) // Filter out invalid collections
            .map((c: any) => ({
              ...c,
              createdAt: new Date(c.createdAt || new Date()),
              products: Array.isArray(c.products) ? c.products.filter((p: any) => {
                // Handle both old and new product structures
                if (!p || !p.product) return false;
                
                // New structure: p.product.product.id
                if (p.product.product && p.product.product.id) return true;
                
                // Old structure: p.product.id (for backward compatibility)
                if (p.product.id) return true;
                
                return false;
              }) : [],
            }));
          
          console.log('🔍 Loaded collections:', loadedCollections.map((c: Collection) => ({ name: c.name, productsCount: c.products.length })));
          setCollections(loadedCollections);
          
          if (loadedCollections.length > 0) {
            // Sort by public first, then by name
            const sortedCollections = loadedCollections.sort((a: Collection, b: Collection) => {
              if (a.isPublic && !b.isPublic) return -1;
              if (!a.isPublic && b.isPublic) return 1;
              return a.name.localeCompare(b.name);
            });
            // Select the first collection by default
            setSelectedCollections(new Set([sortedCollections[0].id]));
            console.log('🔍 Selected first collection:', sortedCollections[0].id);
          }
        } else {
          setError(data.error || 'Failed to load collections');
        }
      } catch (error) {
        console.error('Failed to load collections:', error);
        setError(error instanceof Error ? error.message : 'Failed to load collections');
      } finally {
        setLoading(false);
        console.log('🔍 fetchCollections completed');
      }
    };

    fetchCollections();
  }, [userEmail]);

  const toggleCollection = (collectionId: string) => {
    const newSelected = new Set(selectedCollections);
    if (newSelected.has(collectionId)) {
      newSelected.delete(collectionId);
    } else {
      newSelected.add(collectionId);
    }
    setSelectedCollections(newSelected);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const handleHorizontalWheel = (e: WheelEvent<HTMLDivElement>) => {
    const el = scrollerRef.current;
    if (!el) return;
    // If user scrolls vertically more than horizontally, translate to horizontal scroll
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/collections`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          collectionId: collectionId,
          userId: userEmail
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      setCollections(prev => prev.filter(c => c.id !== collectionId));
      setSelectedCollections(prev => {
        const newSelected = new Set(prev);
        newSelected.delete(collectionId);
        return newSelected;
      });
      
      console.log(`Successfully deleted collection ${collectionId}`);
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert(`Failed to delete collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const deleteProductFromCollection = async (collectionId: string, productId: string) => {
    console.log('🔍 deleteProductFromCollection called:', { collectionId, productId });
    
    if (!collectionId || !productId) {
      console.error('Invalid collection or product ID:', { collectionId, productId });
      return;
    }

    try {
      const collection = collections.find(c => c.id === collectionId);
      if (!collection) {
        console.error('Collection not found:', collectionId);
        alert('Collection not found. Please refresh the page and try again.');
        return;
      }

      console.log('🔍 Original products count:', collection.products.length);
      
      const updatedProducts = collection.products.filter(item => {
        if (!item || !item.product) return false;
        
        // Get the actual product ID from the nested structure
        const actualProduct = (item.product as any).product || item.product;
        const itemProductId = actualProduct.id;
        
        const shouldKeep = itemProductId !== productId;
        if (!shouldKeep) {
          console.log('🔍 Removing product:', itemProductId);
        }
        
        return shouldKeep;
      });
      
      console.log('🔍 Updated products count:', updatedProducts.length);
      
      const response = await fetch(`/api/collections`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: collectionId,
          products: updatedProducts,
          userId: userEmail,
          appendProducts: false // Explicitly set to false since we're replacing the array
        }),
      });

      console.log('🔍 API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔍 API error data:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      setCollections(prev => prev.map(col => 
        col.id === collectionId ? { ...col, products: updatedProducts } : col
      ));
      
      // Show success message
      console.log(`Successfully removed product ${productId} from collection ${collectionId}`);
      
    } catch (error) {
      console.error('Error removing product:', error);
      alert(`Failed to remove product from collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const nonEmptyCollections = collections.filter(c => c.products.length > 0);
  const emptyCollections = collections.filter(c => c.products.length === 0);
  const emptyCollectionsCount = emptyCollections.length;

  console.log('🔍 Collection filtering debug:', {
    totalCollections: collections.length,
    nonEmptyCollections: nonEmptyCollections.length,
    emptyCollections: emptyCollections.length,
    selectedCollections: selectedCollections.size,
    collections: collections.map(c => ({ name: c.name, productsCount: c.products.length }))
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collections...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Collections</h1>
          <p className="text-gray-600">Manage and view your product collections</p>
        </div>

        {/* Collection Selector */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Select Collections</h2>
            <div className="flex items-center gap-4">
              {emptyCollectionsCount > 0 && (
                <button
                  onClick={() => setShowEmptyCollections(!showEmptyCollections)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  {showEmptyCollections ? 'Hide' : 'Show'} Empty ({emptyCollectionsCount})
                </button>
              )}
              <span className="text-sm text-gray-500">
                {selectedCollections.size} selected
              </span>
            </div>
          </div>

          {/* Collection Tabs */}
          <div className="flex flex-wrap gap-2">
            {nonEmptyCollections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => toggleCollection(collection.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  selectedCollections.has(collection.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium truncate max-w-32">{collection.name}</span>
                {collection.isPublic ? (
                  <Globe className="h-3 w-3 text-gray-400 flex-shrink-0" />
                ) : (
                  <Lock className="h-3 w-3 text-gray-400 flex-shrink-0" />
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedCollections.has(collection.id)
                    ? 'bg-blue-200 text-blue-700'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {collection.products.length}
                </span>
                {selectedCollections.has(collection.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollection(collection.id);
                    }}
                    className="ml-1 p-0.5 hover:bg-blue-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </button>
            ))}
            
            {showEmptyCollections && emptyCollections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => toggleCollection(collection.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  selectedCollections.has(collection.id)
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium truncate max-w-32">{collection.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">0</span>
                {selectedCollections.has(collection.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollection(collection.id);
                    }}
                    className="ml-1 p-0.5 hover:bg-red-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Collections Content */}
        {selectedCollections.size === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-md">
            <Tag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Collections Selected</h2>
            <p className="text-gray-500">
              Select one or more collections above to view their products.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(selectedCollections).map((collectionId) => {
              const collection = collections.find(c => c.id === collectionId);
              if (!collection) return null;

              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white rounded-xl shadow-md"
                >
                  {/* Collection Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-800">{collection.name}</h3>
                          {collection.isPublic ? (
                            <Globe className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Lock className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="flex items-center text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            <span>{collection.products.length} items</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Created {new Date(collection.createdAt).toLocaleDateString()}</span>
                          </div>
                          {collection.lastModified && (
                            <div className="flex items-center">
                              <Edit3 className="h-4 w-4 mr-2" />
                              <span>Modified {new Date(collection.lastModified).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-gray-400">
                          <span>💡 Stock information shows availability when added to collection</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleCollection(collection.id)}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition"
                          title="Remove from view"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteCollection(collection.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete collection"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Collection Products */}
                  <div className="p-6">
                    {collection.products.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Empty Collection</h3>
                        <p className="text-gray-500 mb-4">
                          This collection doesn't have any products yet.
                        </p>
                        <a 
                          href="/product-search" 
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Products
                        </a>
                      </div>
                    ) : (
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 scroll-smooth snap-x snap-mandatory collections-scroll"
                        ref={scrollerRef}
                        onWheel={handleHorizontalWheel}
                      >
                        {collection.products
                          .filter(item => {
                            // Handle both old and new product structures
                            if (!item || !item.product) return false;
                            
                            // New structure: item.product.product.id
                            if ((item.product as any).product && (item.product as any).product.id) return true;
                            
                            // Old structure: item.product.id (for backward compatibility)
                            if (item.product.id) return true;
                            
                            return false;
                          })
                          .map((item, index) => {
                            // Get the actual product data
                            const actualProduct = (item.product as any).product || item.product;
                            const productId = actualProduct.id;
                            
                            return (
                              <motion.div 
                                key={`${collection.id}-${productId}-${index}`} 
                                variants={itemVariants}
                                className="flex-none snap-start w-52"
                              >
                                <ProductCard
                                  product={actualProduct}
                                  onAddToEmail={() => {}}
                                  displayMode="canvasItem"
                                  isEditing={false}
                                  showTitle={true}
                                  showPrice={true}
                                  showSwatches={true}
                                  showButton={false}
                                  showRemoveButton={true}
                                  onRemove={() => deleteProductFromCollection(collection.id, productId)}
                                />
                              </motion.div>
                            );
                          })}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>


    </div>
  );
}