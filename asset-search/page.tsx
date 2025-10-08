'use client';

import { useEffect, useState } from 'react';
import ApiStatusCheck from '@/components/ApiStatusCheck';
import { useAuthorization } from '@/hooks/useAuthorization';
import { CollectionPreview } from '@/components/CollectionPreview';

interface Asset {
  id: string;
  name: string;
  label: string;
  mimeType: string;
  createdDate: string;
  imageUrl: string | null;
  isMediaSet?: boolean;
  contents?: string[];
  debug?: {
    name: string;
    filename: string;
    thumbFile: string;
    file: string;
  };
}

export default function AssetSearch() {
  // Authorization hook
  const { isAuthorized, userEmail } = useAuthorization();
  const userId = userEmail || "public";
  
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [total, setTotal] = useState(0);
  const [fileType, setFileType] = useState('all');
  const [hideMediaSets, setHideMediaSets] = useState(true);
  const [showPublishedOnly, setShowPublishedOnly] = useState(false);
  const [repositories, setRepositories] = useState<{id: string, label: string}[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<string>('');
  const [loadingRepositories, setLoadingRepositories] = useState(false);
  const [collections, setCollections] = useState<{id: string, name: string}[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [updatingAsset, setUpdatingAsset] = useState<string | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<string | null>(null);
  const [showCollections, setShowCollections] = useState(false); // Hidden by default
  
  // Cache for search results
  const [searchCache, setSearchCache] = useState<Record<string, {
    assets: Asset[],
    total: number,
    pageInfo: { hasNextPage: boolean, endCursor: string | null }
  }>>({});

  // Fetch repositories
  async function fetchRepositories() {
    console.log('🔍 fetchRepositories called');
    setLoadingRepositories(true);
    try {
      const response = await fetch('/api/amplience-asset-search?action=getRepositories');
      const data = await response.json();
      
      console.log('🔍 Repositories response:', data);
      
      // Check for API errors
      if (data.error) {
        console.warn('Repository fetch warning:', data.error);
      }
      
      // Ensure we have the expected data structure
      if (!data.repositories || !Array.isArray(data.repositories)) {
        data.repositories = [];
      }
      
      setRepositories(data.repositories);
      console.log('🔍 Repositories set:', data.repositories.length);
    } catch (err: any) {
      console.error('Error fetching repositories:', err);
      setRepositories([]); // Set empty array on error
    } finally {
      setLoadingRepositories(false);
      console.log('🔍 fetchRepositories completed');
    }
  }

  // Fetch collections
  async function fetchCollections() {
    setLoadingCollections(true);
    try {
      // For now, fetch all public collections (no userId required)
      const response = await fetch(`/api/collections?userId=${userId}`);
      const data = await response.json();
      
      if (data.collections && Array.isArray(data.collections)) {
        setCollections(data.collections.map((col: any) => ({
          id: col.id,
          name: col.name
        })));
      } else {
        setCollections([]);
      }
    } catch (err: any) {
      console.error('Error fetching collections:', err);
      setCollections([]);
    } finally {
      setLoadingCollections(false);
    }
  }

  // Load repositories and collections on component mount
  useEffect(() => {
    fetchRepositories();
    fetchCollections();
  }, []);

  // Trigger initial search to show assets by default after repositories are loaded
  useEffect(() => {
    console.log('🔍 Initial search useEffect triggered');
    // Just trigger the search directly without waiting for repositories
    console.log('🔍 About to call searchAssets("*")');
    const doInitialSearch = async () => {
      await searchAssets('*');
      console.log('🔍 Initial search completed');
    };
    doInitialSearch();
    console.log('🔍 searchAssets("*") called');
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only trigger search if we have a search term or if it's explicitly '*'
      if (searchTerm.trim() && searchTerm !== '*') {
        searchAssets(searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, fileType, selectedRepository, showPublishedOnly]);

  async function searchAssets(term: string, cursor: string | null = null) {
    console.log('🔍 searchAssets called with:', { term, cursor, selectedRepository, fileType });
    setLoading(true);
    setError(null);
    
    // Create a cache key based on search parameters
    const cacheKey = `${term}|${fileType}|${selectedRepository}|${cursor || 'initial'}`;
    console.log('🔍 Cache key:', cacheKey);
    
    try {
      // Check if we have cached results
      if (searchCache[cacheKey]) {
        console.log('🔍 Using cached results');
        const cachedData = searchCache[cacheKey];
        
        if (cursor) {
          setAssets(prev => [...prev, ...cachedData.assets]);
        } else {
          setAssets(cachedData.assets);
        }
        
        setTotal(cachedData.total);
        setEndCursor(cachedData.pageInfo.endCursor);
        setHasNextPage(cachedData.pageInfo.hasNextPage);
        setLoading(false);
        return;
      }
      
      // If not in cache, fetch from API
      const params = new URLSearchParams();
      if (term && term !== '*') params.append('keyword', term);
      if (cursor) params.append('page', cursor);
      if (selectedRepository) params.append('repositoryId', selectedRepository);
      if (fileType && fileType !== 'all') params.append('fileType', fileType);
      if (showPublishedOnly) params.append('publishedOnly', 'true');
      
      const apiUrl = `/api/amplience-asset-search?${params.toString()}`;
      console.log('🔍 Fetching from API:', apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      console.log('🔍 API response:', { total: data.total, assetsCount: data.assets?.length, error: data.error });
      
      // Check for API errors
      if (data.error) {
        throw new Error(data.error + (data.details ? `: ${data.details}` : ''));
      }
      
      // Ensure we have the expected data structure
      if (!data.assets || !Array.isArray(data.assets)) {
        data.assets = [];
        data.total = 0;
        data.pageInfo = { hasNextPage: false, endCursor: null };
      }
      
      // Store in cache
      setSearchCache(prev => ({
        ...prev,
        [cacheKey]: {
          assets: data.assets,
          total: data.total || 0,
          pageInfo: data.pageInfo || { hasNextPage: false, endCursor: null }
        }
      }));
      
      if (cursor) {
        setAssets(prev => [...prev, ...data.assets]);
      } else {
        setAssets(data.assets);
      }
      
      setTotal(data.total || 0);
      setEndCursor(data.pageInfo?.endCursor || null);
      setHasNextPage(data.pageInfo?.hasNextPage || false);
      
      console.log('🔍 Search completed successfully:', { total: data.total, assetsSet: data.assets.length });
    } catch (err: any) {
      console.error('Error searching assets:', err);
      setError(err.message || 'Failed to search assets');
      setAssets([]);
      setTotal(0);
      setEndCursor(null);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = () => {
    searchAssets(searchTerm || '*');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const loadMore = () => {
    if (hasNextPage && endCursor) {
      searchAssets(searchTerm || '*', endCursor);
    }
  };

  // Add asset to collection
  async function addAssetToCollection(asset: Asset, collectionId: string) {
    try {
      const response = await fetch('/api/collections/add-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail || ''
        },
        body: JSON.stringify({
          collectionId,
          assetData: asset
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully added "${asset.name}" to collection!`);
        setShowCollectionModal(false);
        setSelectedAsset(null);
        setSelectedCollection('');
      } else {
        alert(`Failed to add asset: ${data.error || data.message}`);
      }
    } catch (error) {
      console.error('Error adding asset to collection:', error);
      alert('Failed to add asset to collection. Please try again.');
    }
  }

  // Create collection function
  const createCollection = async (name: string): Promise<string> => {
    const newCollection = {
      id: `collection_${Date.now()}`,
      name: name,
      products: [],
      createdAt: new Date().toISOString(),
      isPublic: false
    };
    
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userEmail || 'public',
          collection: newCollection
        })
      });
      
      if (response.ok) {
        const updatedCollections = [...collections, newCollection];
        setCollections(updatedCollections);
        return newCollection.id;
      } else {
        console.error('Failed to create collection via API');
        const updatedCollections = [...collections, newCollection];
        setCollections(updatedCollections);
        return newCollection.id;
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      const updatedCollections = [...collections, newCollection];
      setCollections(updatedCollections);
      return newCollection.id;
    }
  };

  // Update asset
  async function updateAsset(assetId: string, updates: { name?: string; label?: string; description?: string; tags?: string }) {
    setUpdatingAsset(assetId);
    try {
      const response = await fetch('/api/amplience-asset-update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail || ''
        },
        body: JSON.stringify({
          assetId,
          ...updates
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully updated asset!`);
        // Refresh the search to show updated data
        await searchAssets(searchTerm);
      } else {
        alert(`Failed to update asset: ${data.error || data.message}`);
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      alert('Failed to update asset. Please try again.');
    } finally {
      setUpdatingAsset(null);
    }
  }

  // Delete asset
  async function deleteAsset(assetId: string, assetName: string) {
    if (!confirm(`Are you sure you want to delete "${assetName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingAsset(assetId);
    try {
      const response = await fetch('/api/amplience-asset-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': userEmail || ''
        },
        body: JSON.stringify({
          assetId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Successfully deleted asset "${assetName}"!`);
        // Refresh the search to show updated data
        await searchAssets(searchTerm);
      } else {
        alert(`Failed to delete asset: ${data.error || data.message}`);
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset. Please try again.');
    } finally {
      setDeletingAsset(null);
    }
  }

  const isImage = (mimeType: string) => mimeType?.startsWith('image/');
  const isMediaSet = (mimeType: string) => mimeType === 'application/x-amplience-media-set';

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Amplience Asset Search</h1>
            <p className="text-lg text-gray-600 mt-1">Search for assets in your Amplience repository</p>
            <ApiStatusCheck />
          </div>
          <button 
            onClick={() => {
              setSearchCache({});
              searchAssets(searchTerm || '*');
            }}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition"
          >
            Clear Cache
          </button>
          <button 
            onClick={() => {
              console.log('🔍 Manual search button clicked');
              searchAssets('*');
            }}
            className="px-3 py-1 bg-blue-200 text-blue-700 rounded text-sm hover:bg-blue-300 transition ml-2"
          >
            Test Search
          </button>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 sticky top-4 z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 flex gap-2">
              <input
                type="text"
                placeholder="Search assets by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            <select
              value={selectedRepository}
              onChange={(e) => {
                setSelectedRepository(e.target.value);
                setSearchCache({}); // Clear cache when repository changes
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              disabled={loadingRepositories}
              aria-label="Select repository"
            >
              <option value="">All Repositories</option>
              {repositories.map(repo => (
                <option key={repo.id} value={repo.id}>{repo.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              aria-label="Select file type"
            >
              <option value="all">All Types</option>
              <option value="image/gif">GIFs</option>
              <option value="image/jpeg">JPEGs</option>
              <option value="image/png">PNGs</option>
              <option value="application/x-amplience-media-set">Media Sets</option>
            </select>
          </div>
          <div className="mt-4 flex items-center gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hideMediaSets}
                onChange={(e) => setHideMediaSets(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-sm text-gray-700">Hide Media Sets</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showPublishedOnly}
                onChange={(e) => setShowPublishedOnly(e.target.checked)}
                className="form-checkbox h-4 w-4 text-green-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-sm text-gray-700">Show Published Only</span>
            </label>
          </div>
        </div>

        {/* Collection Preview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Collections</h3>
            <button
              onClick={() => setShowCollections(!showCollections)}
              className="text-sm text-blue-600 hover:text-blue-800 transition"
            >
              {showCollections ? 'Hide' : 'Show'} Collections
            </button>
          </div>
          
          {showCollections && (
            <CollectionPreview 
              userId="public" 
              onCollectionUpdate={() => {
                // Refresh collections when they're updated
                fetchCollections();
              }}
            />
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-700">{error}</p>
            {error.includes('API token') && (
              <p className="text-sm mt-2">
                Please make sure the <code>AMPLIENCE_API_TOKEN</code> is set in your environment variables.
              </p>
            )}
          </div>
        )}

        <div className="mb-4">
          <p className="text-gray-600">Found {total} assets</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {assets
            .filter(asset => 
              (fileType === 'all' || asset.mimeType === fileType) && 
              !(hideMediaSets && asset.isMediaSet)
            )
            .map((asset) => (
            <div key={asset.id} className="group relative border bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-square w-full bg-gray-50 flex items-center justify-center">
                {asset.imageUrl ? (
                  <img
                    src={asset.imageUrl}
                    alt={asset.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full text-gray-400 p-2">
                    <span className="text-xs mb-1">{asset.mimeType}</span>
                    {asset.isMediaSet && asset.debug && (
                      <div className="text-xs text-left w-full overflow-auto">
                        <p className="text-red-500">Debug Info:</p>
                        <p>name: {asset.debug.name || 'none'}</p>
                        <p>filename: {asset.debug.filename || 'none'}</p>
                        <p>thumbFile: {asset.debug.thumbFile || 'none'}</p>
                        <p>file: {asset.debug.file || 'none'}</p>
                      </div>
                    )}
                  </div>
                )}
                {asset.isMediaSet && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-bl">
                    Media Set
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800 truncate" title={asset.name}>
                  {asset.name}
                </p>
                <p className="text-xs text-gray-500">{new Date(asset.createdDate).toLocaleDateString()}</p>
                {asset.isMediaSet && asset.contents && asset.contents.length > 0 && (
                  <p className="text-xs text-blue-500 mt-1">{asset.contents.length} items</p>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {/* Add to Collection Button */}
                  <button 
                    onClick={() => {
                      setSelectedAsset(asset);
                      setShowCollectionModal(true);
                    }}
                    className="text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600 transition"
                    title="Add to Collection"
                  >
                    Add to Collection
                  </button>
                  
                  {/* Admin-only buttons */}
                  {isAuthorized && (
                    <>
                      <button 
                        onClick={() => {
                          const newName = prompt('Enter new name:', asset.name);
                          if (newName && newName !== asset.name) {
                            updateAsset(asset.id, { name: newName });
                          }
                        }}
                        disabled={updatingAsset === asset.id}
                        className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition disabled:opacity-50"
                        title="Update Asset"
                      >
                        {updatingAsset === asset.id ? 'Updating...' : 'Update'}
                      </button>
                      
                      <button 
                        onClick={() => deleteAsset(asset.id, asset.name)}
                        disabled={deletingAsset === asset.id}
                        className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition disabled:opacity-50"
                        title="Delete Asset"
                      >
                        {deletingAsset === asset.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </>
                  )}
                  
                  {/* Existing buttons */}
                  {asset.debug && (
                    <button 
                      onClick={() => {
                        const debugText = JSON.stringify(asset.debug, null, 2);
                        navigator.clipboard.writeText(debugText);
                        alert('Debug info copied to clipboard!');
                      }}
                      className="text-xs text-gray-500 underline"
                      title="Copy Debug Info"
                    >
                      Debug
                    </button>
                  )}
                  {asset.imageUrl && (
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(asset.imageUrl || '');
                        alert('Image URL copied to clipboard!');
                      }}
                      className="text-xs text-blue-500 underline"
                      title="Copy Image URL"
                    >
                      URL
                    </button>
                  )}
                  {asset.imageUrl && (
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch(asset.imageUrl!);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${asset.name || 'asset'}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error('Download failed:', error);
                          alert('Download failed. Please try right-clicking and "Save as".');
                        }
                      }}
                      className="text-xs text-green-600 underline"
                      title="Download Asset"
                    >
                      Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && <div className="text-center mt-8 text-gray-500">Loading...</div>}

        {hasNextPage && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Load More
            </button>
          </div>
        )}

        {/* Collection Modal */}
        {showCollectionModal && selectedAsset && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Add "{selectedAsset.name}" to Collection
              </h3>
              
              {collections.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">No collections available.</p>
                  <a 
                    href="/collections" 
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    Create a collection first
                  </a>
                </div>
              ) : (
                <>
                  <select
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                    disabled={loadingCollections}
                    aria-label="Select collection"
                  >
                    <option value="">Select a collection...</option>
                    {collections.map(collection => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (selectedCollection) {
                          addAssetToCollection(selectedAsset, selectedCollection);
                        } else {
                          alert('Please select a collection first.');
                        }
                      }}
                      disabled={!selectedCollection}
                      className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                    >
                      Add to Collection
                    </button>
                    <button
                      onClick={() => {
                        setShowCollectionModal(false);
                        setSelectedAsset(null);
                        setSelectedCollection('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}