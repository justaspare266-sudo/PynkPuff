import React, { useState, useCallback, useMemo, useEffect } from 'react';

// --- Helper Components ---

// Icon for close button
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    <span className="ml-2 text-gray-600">Loading products...</span>
  </div>
);

// Error component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
    <p className="text-red-600 mb-2">{message}</p>
    <button onClick={onRetry} className="text-red-500 hover:text-red-700 underline">
      Try again
    </button>
  </div>
);

// --- Firebase Management ---

// Firebase initialization hook
const useFirebase = () => {
  const [firebase, setFirebase] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const { initializeApp } = await import('firebase/app');
        const { getFirestore } = await import('firebase/firestore');
        const { getAuth } = await import('firebase/auth');

        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);

        setFirebase({ app, db, auth });
      } catch (error) {
        console.error('Firebase initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initFirebase();
  }, []);

  return { firebase, loading };
};

// --- Product Data Management ---

// Enhanced product interface
const ProductInterface = {
  id: '',
  titles: { default: '' },
  media: { main_image: { url: '', alt: '' } },
  pricing: { current: { formatted: '', value: 0 } },
  stock: { available: true },
  properties: {},
  variants: [],
  price: 0,
  url: '',
  category: '',
  imageUrl: '',
  name: ''
};

// Product data fetching with real API integration
const useProductData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offlineData, setOfflineData] = useState([]);

  // Load offline fallback data
  useEffect(() => {
    const loadOfflineData = async () => {
      try {
        const response = await fetch('/api/export-stored-products?download=1');
        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            const formattedProducts = data.products.map(product => ({
              id: product.id,
              name: product.titles?.default || product.name || 'Unknown Product',
              category: product.properties?.category || 'Unknown',
              imageUrl: product.media?.main_image?.url || product.imageUrl || '',
              price: product.price || product.pricing?.current?.value || 0,
              url: product.url || '',
              titles: product.titles,
              media: product.media,
              pricing: product.pricing,
              stock: product.stock,
              properties: product.properties,
              variants: product.variants || []
            }));
            setOfflineData(formattedProducts);
          }
        }
      } catch (err) {
        console.warn('Failed to load offline data:', err);
      }
    };
    loadOfflineData();
  }, []);

  // Fetch real product data
  const fetchProducts = useCallback(async (searchTerm = 'dress') => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from real API first
      const response = await fetch(`/api/product-search?searchText=${encodeURIComponent(searchTerm)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.products && data.products.length > 0) {
          const formattedProducts = data.products.map(product => ({
            id: product.id,
            name: product.titles?.default || 'Unknown Product',
            category: product.properties?.category || 'Unknown',
            imageUrl: product.media?.main_image?.url || '',
            price: product.price || product.pricing?.current?.value || 0,
            url: product.url || '',
            titles: product.titles,
            media: product.media,
            pricing: product.pricing,
            stock: product.stock,
            properties: product.properties,
            variants: product.variants || []
          }));
          setProducts(formattedProducts);
          setLoading(false);
          return;
        }
      }
      
      // Fallback to offline data
      console.log('API failed, using offline data');
      setProducts(offlineData);
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Using offline data.');
      setProducts(offlineData);
      setLoading(false);
    }
  }, [offlineData]);

  // Load initial data
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, fetchProducts, retry: () => fetchProducts() };
};

// --- Firebase Collection Management ---

const useCollections = (userId, firebase) => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCollections = useCallback(async () => {
    if (!userId || !firebase) return;
    
    setLoading(true);
    try {
      const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
      const collectionsRef = collection(firebase.db, 'outfitCollections');
      const q = query(
        collectionsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const userCollections = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCollections(userCollections);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, firebase]);

  const saveCollection = useCallback(async (outfit, isPublic = false) => {
    if (!userId || !firebase) return null;
    
    try {
      const { collection, addDoc } = await import('firebase/firestore');
      const collectionData = {
        userId,
        outfit,
        isPublic,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: `Outfit ${collections.length + 1}`,
        description: '',
        likes: 0,
        views: 0
      };
      
      const docRef = await addDoc(collection(firebase.db, 'outfitCollections'), collectionData);
      await loadCollections(); // Refresh the list
      return docRef.id;
    } catch (error) {
      console.error('Error saving collection:', error);
      throw error;
    }
  }, [userId, collections.length, loadCollections, firebase]);

  const deleteCollection = useCallback(async (collectionId) => {
    if (!firebase) return;
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(firebase.db, 'outfitCollections', collectionId));
      await loadCollections(); // Refresh the list
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }, [loadCollections, firebase]);

  const updateCollection = useCallback(async (collectionId, updates) => {
    if (!firebase) return;
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(firebase.db, 'outfitCollections', collectionId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      await loadCollections(); // Refresh the list
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  }, [loadCollections, firebase]);

  // Load collections when userId or firebase changes
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  return {
    collections,
    loading,
    saveCollection,
    deleteCollection,
    updateCollection,
    refresh: loadCollections
  };
};

// --- Avatar System Foundation ---

// Avatar configuration for realistic models
const AvatarConfig = {
  type: 'realistic', // 'realistic', 'stylized', 'mannequin'
  bodyTypes: ['slim', 'athletic', 'curvy', 'plus'],
  poses: ['standing', 'walking', 'sitting'],
  skinTones: ['fair', 'medium', 'dark'],
  hairStyles: ['straight', 'wavy', 'curly', 'updo']
};

// Smart image processing for realistic layering
const processProductImage = (imageUrl, category, bodyType) => {
  // This will be enhanced with AI background removal and smart cropping
  return {
    processedUrl: imageUrl,
    cropMask: null,
    fitType: 'standard',
    layering: category === 'Top' ? 'over' : 'under'
  };
};

// --- Realistic Avatar System ---

// 3D Avatar Model Component
const RealisticAvatar = ({ outfit, bodyType = 'athletic', pose = 'standing', skinTone = 'medium' }) => {
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [clothingLayers, setClothingLayers] = useState([]);

  // Process clothing items for realistic layering
  useEffect(() => {
    const processOutfit = async () => {
      const layers = [];
      
      // Define layering order for realistic clothing
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
          const processed = processProductImage(item.imageUrl, category, bodyType);
          layers.push({
            ...item,
            ...processed,
            zIndex,
            category
          });
        }
      });

      setClothingLayers(layers);
    };

    processOutfit();
  }, [outfit, bodyType]);

  // Get avatar silhouette based on body type
  const getAvatarSilhouette = (bodyType) => {
    const silhouettes = {
      slim: {
        width: 'w-40',
        height: 'h-80',
        bodyWidth: 'w-28',
        bodyHeight: 'h-44',
        armWidth: 'w-6',
        legWidth: 'w-16'
      },
      athletic: {
        width: 'w-44',
        height: 'h-80',
        bodyWidth: 'w-32',
        bodyHeight: 'h-48',
        armWidth: 'w-8',
        legWidth: 'w-20'
      },
      curvy: {
        width: 'w-48',
        height: 'h-80',
        bodyWidth: 'w-36',
        bodyHeight: 'h-48',
        armWidth: 'w-8',
        legWidth: 'w-20'
      },
      plus: {
        width: 'w-52',
        height: 'h-80',
        bodyWidth: 'w-40',
        bodyHeight: 'h-48',
        armWidth: 'w-10',
        legWidth: 'w-24'
      }
    };
    return silhouettes[bodyType] || silhouettes.athletic;
  };

  const silhouette = getAvatarSilhouette(bodyType);

  return (
    <div className="relative w-full h-full">
      {/* 3D Avatar Container */}
      <div className="relative w-80 h-96 mx-auto">
        {/* Avatar Base Model */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-lg">
          {/* Placeholder for 3D model - will be replaced with actual Three.js/WebGL */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative">
              {/* Avatar silhouette */}
              <div className={`${silhouette.width} ${silhouette.height} bg-gradient-to-b from-gray-200 to-gray-300 rounded-full mx-auto relative shadow-inner`}>
                {/* Head */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gray-200 rounded-full shadow-md"></div>
                
                {/* Body */}
                <div className={`absolute top-20 left-1/2 transform -translate-x-1/2 ${silhouette.bodyWidth} ${silhouette.bodyHeight} bg-gray-200 rounded-t-full shadow-md`}></div>
                
                {/* Arms */}
                <div className={`absolute top-24 left-4 ${silhouette.armWidth} h-32 bg-gray-200 rounded-full shadow-md`}></div>
                <div className={`absolute top-24 right-4 ${silhouette.armWidth} h-32 bg-gray-200 rounded-full shadow-md`}></div>
                
                {/* Legs */}
                <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 ${silhouette.legWidth} h-32 bg-gray-200 rounded-t-full shadow-md`}></div>
              </div>

              {/* Clothing Layers with Enhanced Positioning */}
              {clothingLayers.map((layer, index) => {
                const position = getClothingPosition(layer.category, bodyType);
                return (
                  <div
                    key={`${layer.category}-${layer.id}`}
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: layer.zIndex }}
                  >
                    <img
                      src={layer.processedUrl}
                      alt={layer.name}
                      className="w-full h-full object-contain"
                      style={{
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
                        transform: `scale(${position.scale}) translate(${position.offsetX}, ${position.offsetY})`,
                        opacity: getClothingOpacity(layer.category)
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                );
              })}

              {/* Enhanced Lighting Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white opacity-20 pointer-events-none rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Avatar Controls Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white bg-opacity-95 rounded-lg p-2 flex justify-center space-x-2 shadow-lg">
            <button className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors">
              Rotate
            </button>
            <button className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors">
              Zoom
            </button>
            <button className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors">
              Pose
            </button>
          </div>
        </div>

        {/* Body Type Indicator */}
        <div className="absolute top-4 left-4">
          <div className="bg-white bg-opacity-90 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 shadow-md">
            {bodyType.charAt(0).toUpperCase() + bodyType.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions for clothing positioning
const getClothingScale = (category, bodyType) => {
  const scales = {
    'Top': { slim: 0.9, athletic: 1.0, curvy: 1.1, plus: 1.2 },
    'Dress': { slim: 0.9, athletic: 1.0, curvy: 1.1, plus: 1.2 },
    'Bottom': { slim: 0.9, athletic: 1.0, curvy: 1.1, plus: 1.2 },
    'Shoes': { slim: 0.8, athletic: 0.9, curvy: 1.0, plus: 1.1 },
    'Accessory': { slim: 0.8, athletic: 0.9, curvy: 1.0, plus: 1.1 },
    'Handbag': { slim: 0.8, athletic: 0.9, curvy: 1.0, plus: 1.1 },
    'Hat': { slim: 0.8, athletic: 0.9, curvy: 1.0, plus: 1.1 }
  };
  return scales[category]?.[bodyType] || 1.0;
};

const getClothingOffset = (category) => {
  const offsets = {
    'Top': '-20px',
    'Dress': '-10px',
    'Bottom': '20px',
    'Shoes': '60px',
    'Accessory': '0px',
    'Handbag': '40px',
    'Hat': '-40px'
  };
  return offsets[category] || '0px';
};

// Helper function for clothing opacity
const getClothingOpacity = (category) => {
  const opacities = {
    'Bottom': 0.9,
    'Dress': 0.9,
    'Top': 0.9,
    'Shoes': 0.9,
    'Accessory': 0.9,
    'Handbag': 0.9,
    'Hat': 0.9
  };
  return opacities[category] || 1.0;
};

// Enhanced clothing positioning for different body types
const getClothingPosition = (category, bodyType) => {
  const positions = {
    'Top': {
      slim: { scale: 0.85, offsetY: '-25px', offsetX: '0px' },
      athletic: { scale: 0.95, offsetY: '-20px', offsetX: '0px' },
      curvy: { scale: 1.05, offsetY: '-15px', offsetX: '0px' },
      plus: { scale: 1.15, offsetY: '-10px', offsetX: '0px' }
    },
    'Dress': {
      slim: { scale: 0.85, offsetY: '-15px', offsetX: '0px' },
      athletic: { scale: 0.95, offsetY: '-10px', offsetX: '0px' },
      curvy: { scale: 1.05, offsetY: '-5px', offsetX: '0px' },
      plus: { scale: 1.15, offsetY: '0px', offsetX: '0px' }
    },
    'Bottom': {
      slim: { scale: 0.85, offsetY: '15px', offsetX: '0px' },
      athletic: { scale: 0.95, offsetY: '20px', offsetX: '0px' },
      curvy: { scale: 1.05, offsetY: '25px', offsetX: '0px' },
      plus: { scale: 1.15, offsetY: '30px', offsetX: '0px' }
    },
    'Shoes': {
      slim: { scale: 0.75, offsetY: '55px', offsetX: '0px' },
      athletic: { scale: 0.85, offsetY: '60px', offsetX: '0px' },
      curvy: { scale: 0.95, offsetY: '65px', offsetX: '0px' },
      plus: { scale: 1.05, offsetY: '70px', offsetX: '0px' }
    },
    'Accessory': {
      slim: { scale: 0.75, offsetY: '-5px', offsetX: '0px' },
      athletic: { scale: 0.85, offsetY: '0px', offsetX: '0px' },
      curvy: { scale: 0.95, offsetY: '5px', offsetX: '0px' },
      plus: { scale: 1.05, offsetY: '10px', offsetX: '0px' }
    },
    'Handbag': {
      slim: { scale: 0.75, offsetY: '35px', offsetX: '20px' },
      athletic: { scale: 0.85, offsetY: '40px', offsetX: '25px' },
      curvy: { scale: 0.95, offsetY: '45px', offsetX: '30px' },
      plus: { scale: 1.05, offsetY: '50px', offsetX: '35px' }
    },
    'Hat': {
      slim: { scale: 0.75, offsetY: '-45px', offsetX: '0px' },
      athletic: { scale: 0.85, offsetY: '-40px', offsetX: '0px' },
      curvy: { scale: 0.95, offsetY: '-35px', offsetX: '0px' },
      plus: { scale: 1.05, offsetY: '-30px', offsetX: '0px' }
    }
  };
  
  return positions[category]?.[bodyType] || { scale: 1.0, offsetY: '0px', offsetX: '0px' };
};

// Avatar Customization Panel
const AvatarCustomizationPanel = ({ bodyType, setBodyType, pose, setPose, skinTone, setSkinTone }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <h3 className="font-semibold text-gray-800 mb-3">Customize Your Model</h3>
      
      {/* Body Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Body Type</label>
        <div className="grid grid-cols-2 gap-2">
          {AvatarConfig.bodyTypes.map(type => (
            <button
              key={type}
              onClick={() => setBodyType(type)}
              className={`p-2 text-sm rounded-md transition-colors ${
                bodyType === type 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Pose Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pose</label>
        <div className="grid grid-cols-3 gap-2">
          {AvatarConfig.poses.map(poseType => (
            <button
              key={poseType}
              onClick={() => setPose(poseType)}
              className={`p-2 text-sm rounded-md transition-colors ${
                pose === poseType 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {poseType.charAt(0).toUpperCase() + poseType.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Skin Tone Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Skin Tone</label>
        <div className="flex space-x-2">
          {AvatarConfig.skinTones.map(tone => (
            <button
              key={tone}
              onClick={() => setSkinTone(tone)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                skinTone === tone 
                  ? 'border-indigo-600 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{
                backgroundColor: getSkinToneColor(tone)
              }}
              title={tone.charAt(0).toUpperCase() + tone.slice(1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function for skin tone colors
const getSkinToneColor = (tone) => {
  const colors = {
    fair: '#FFDBB4',
    medium: '#C68642',
    dark: '#8D5524'
  };
  return colors[tone] || colors.medium;
};

// --- Enhanced Components ---

// Component to display a single product in the search list (horizontal layout)
const ProductCard = ({ product, onSelect }) => (
    <div 
        className="group relative w-full h-full border rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300 bg-white"
        onClick={() => onSelect(product)}
    >
        <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/160x224/f0f0f0/a0a0a0?text=Error'; }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-white bg-opacity-90">
            <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
            <p className="text-xs text-gray-500">{product.category}</p>
            {product.price > 0 && (
              <p className="text-xs font-medium text-indigo-600">£{product.price}</p>
            )}
        </div>
    </div>
);

// Component for the list of available products (horizontal layout)
const ProductList = ({ products, onSelectProduct, loading, error, onRetry }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const categories = useMemo(() => {
        const cats = ['All', ...new Set(products.map(p => p.category))];
        return cats.filter(cat => cat !== 'Unknown');
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, searchTerm, selectedCategory]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} onRetry={onRetry} />;

    return (
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <div className="flex justify-between items-center mb-3 gap-4">
                <h2 className="text-xl font-bold text-gray-800 flex-shrink-0">Choose Products</h2>
                <input
                    type="text"
                    placeholder="Search for an item..."
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-3 mb-3 border-b">
                {categories.map(category => (
                    <button key={category} onClick={() => setSelectedCategory(category)}
                        className={`flex-shrink-0 px-3 py-1 text-sm rounded-full transition-colors ${selectedCategory === category ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
                        {category}
                    </button>
                ))}
            </div>
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide py-2">
                {filteredProducts.map(product => (
                    <div key={product.id} className="w-40 h-56 flex-shrink-0">
                        <ProductCard product={product} onSelect={onSelectProduct} />
                    </div>
                ))}
            </div>
            {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No products found. Try adjusting your search or category filter.
                </div>
            )}
        </div>
    );
};

// Component for a single static slot in the outfit builder
const OutfitSlot = ({ category, item, onRemove }) => (
    <div className="relative border-2 border-dashed border-gray-300 rounded-lg h-40 w-32 flex items-center justify-center bg-white transition-all duration-300">
        {item ? (
            <>
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover object-top rounded-md"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/128x160/f0f0f0/a0a0a0?text=Image+Error'; }}/>
                <button onClick={() => onRemove(category)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors" aria-label={`Remove ${item.name}`}>
                    <XIcon />
                </button>
            </>
        ) : (
            <span className="text-gray-400 text-sm font-medium">{category}</span>
        )}
    </div>
);

// New component for the combined Top/Dress slot
const CombinedSlot = ({ topItem, dressItem, onRemove, onOpenSelector }) => {
    const item = topItem || dressItem;
    const category = topItem ? 'Top' : 'Dress';

    return (
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg h-40 w-32 flex items-center justify-center bg-white transition-all duration-300 cursor-pointer"
            onClick={!item ? onOpenSelector : undefined}>
            {item ? (
                <>
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover object-top rounded-md"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/128x160/f0f0f0/a0a0a0?text=Image+Error'; }}/>
                    <button onClick={() => onRemove(category)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors" aria-label={`Remove ${item.name}`}>
                        <XIcon />
                    </button>
                </>
            ) : (
                <span className="text-gray-400 text-sm font-medium text-center">Top / Dress</span>
            )}
        </div>
    );
};

// A generalized horizontal selector for products
const HorizontalProductSelector = ({ products, selectedItem, onSelectItem, categoryName }) => {
    if (!products || products.length === 0) return null;
    
    return (
        <div className="w-full my-2">
            <p className="text-gray-500 text-sm font-medium mb-2 text-center">{categoryName}</p>
            <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-36 h-full border-2 border-dashed border-indigo-300 rounded-lg pointer-events-none z-10"></div>
                <div className="w-full flex overflow-x-auto snap-x snap-mandatory py-4 space-x-4 scrollbar-hide">
                    <div className="flex-shrink-0 w-1/2 -ml-16"></div> {/* Spacer for centering */}
                    {products.map(product => (
                        <div key={product.id} onClick={() => onSelectItem(product)}
                            className={`snap-center flex-shrink-0 w-32 h-40 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-4 ${selectedItem?.id === product.id ? 'border-indigo-500 scale-105 shadow-lg' : 'border-transparent'}`}>
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover object-top"
                                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/128x160/f0f0f0/a0a0a0?text=Error'; }}/>
                        </div>
                    ))}
                    <div className="flex-shrink-0 w-1/2 -mr-16"></div> {/* Spacer for centering */}
                </div>
            </div>
        </div>
    );
};

// Modal to choose between Top and Dress
const CategoryChoiceModal = ({ onSelect, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Choose a category</h3>
            <div className="flex space-x-4">
                <button onClick={() => onSelect('Top')} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-transform duration-200 active:scale-95">Top</button>
                <button onClick={() => onSelect('Dress')} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-transform duration-200 active:scale-95">Dress</button>
            </div>
        </div>
    </div>
);

// Enhanced save collection modal
const SaveCollectionModal = ({ isOpen, onClose, onSave, outfit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    const handleSave = () => {
        onSave({ name, description, isPublic });
        setName('');
        setDescription('');
        setIsPublic(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white rounded-lg p-6 shadow-xl w-96" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4">Save Outfit Collection</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Collection Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                            placeholder="My Summer Collection"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                            placeholder="Describe your outfit..."
                            rows={3}
                        />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="isPublic" className="text-sm text-gray-700">
                            Make this collection public (others can view and collaborate)
                        </label>
                    </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Save Collection
                    </button>
                </div>
            </div>
        </div>
    );
};

// Enhanced Outfit Builder with Realistic Avatar
const OutfitBuilder = ({ outfit, productData, onRemoveItem, onSelectProduct, onSave, onClear, onOpenSelector }) => {
    const isOutfitEmpty = Object.values(outfit).every(item => item === null);
    const { shoeProducts, activeSelector, topProducts, dressProducts } = productData;
    
    // Avatar customization state
    const [bodyType, setBodyType] = useState('athletic');
    const [pose, setPose] = useState('standing');
    const [skinTone, setSkinTone] = useState('medium');
    const [showAvatarCustomization, setShowAvatarCustomization] = useState(false);

    const selectorProducts = activeSelector === 'Top' ? topProducts : dressProducts;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Outfit</h2>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setShowAvatarCustomization(!showAvatarCustomization)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        {showAvatarCustomization ? 'Hide' : 'Customize'} Model
                    </button>
                    <button onClick={onClear} disabled={isOutfitEmpty} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Clear</button>
                    <button onClick={onSave} disabled={isOutfitEmpty} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 active:scale-95">Save Collection</button>
                </div>
            </div>
            
            {/* Avatar Customization Panel */}
            {showAvatarCustomization && (
                <div className="flex-shrink-0 mb-6">
                    <AvatarCustomizationPanel
                        bodyType={bodyType}
                        setBodyType={setBodyType}
                        pose={pose}
                        setPose={setPose}
                        skinTone={skinTone}
                        setSkinTone={setSkinTone}
                    />
                </div>
            )}
            
            {/* Main Content Area */}
            <div className="flex-grow flex">
                {/* Left Side - Avatar Display */}
                <div className="flex-1 flex items-center justify-center">
                    <RealisticAvatar 
                        outfit={outfit}
                        bodyType={bodyType}
                        pose={pose}
                        skinTone={skinTone}
                    />
                </div>
                
                {/* Right Side - Product Selectors */}
                <div className="flex-1 flex flex-col space-y-4">
                    {/* Product Category Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <OutfitSlot category="Hat" item={outfit.Hat} onRemove={onRemoveItem} />
                        <OutfitSlot category="Accessory" item={outfit.Accessory} onRemove={onRemoveItem} />
                        <CombinedSlot topItem={outfit.Top} dressItem={outfit.Dress} onRemove={onRemoveItem} onOpenSelector={onOpenSelector} />
                        <OutfitSlot category="Bottom" item={outfit.Bottom} onRemove={onRemoveItem} />
                        <OutfitSlot category="Handbag" item={outfit.Handbag} onRemove={onRemoveItem} />
                        <OutfitSlot category="Shoes" item={outfit.Shoes} onRemove={onRemoveItem} />
                    </div>
                </div>
            </div>

            {/* Bottom Product Selectors */}
            <div className="flex-shrink-0 pt-4">
                <HorizontalProductSelector products={shoeProducts} selectedItem={outfit.Shoes} onSelectItem={onSelectProduct} categoryName="Shoes" />
                {activeSelector && (
                    <HorizontalProductSelector products={selectorProducts} selectedItem={outfit[activeSelector]} onSelectItem={onSelectProduct} categoryName={activeSelector} />
                )}
            </div>
        </div>
    );
};

// Enhanced component to display a saved collection
const SavedCollectionCard = ({ collection, onDelete, onEdit, onShare }) => (
    <div className="bg-white p-4 rounded-lg shadow-md border">
        <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-lg text-gray-700">{collection.name || `Collection #${collection.id}`}</h3>
            <div className="flex space-x-1">
                {collection.isPublic && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Public</span>
                )}
                <button onClick={() => onEdit(collection)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                <button onClick={() => onDelete(collection.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
            </div>
        </div>
        
        {collection.description && (
            <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {Object.values(collection.outfit).filter(Boolean).map(item => (
                <div key={item.id} className="text-center">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-20 object-cover object-top rounded-md"
                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/100x80/f0f0f0/a0a0a0?text=Error'; }}/>
                    <p className="text-xs mt-1 text-gray-600 truncate">{item.name}</p>
                </div>
            ))}
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Created: {new Date(collection.createdAt).toLocaleDateString()}</span>
            {collection.isPublic && (
                <div className="flex items-center space-x-2">
                    <span>👁️ {collection.views || 0}</span>
                    <span>❤️ {collection.likes || 0}</span>
                </div>
            )}
        </div>
    </div>
);

// Main App Component
function App() {
    const [outfit, setOutfit] = useState({ Hat: null, Top: null, Bottom: null, Shoes: null, Accessory: null, Handbag: null, Dress: null });
    const [notification, setNotification] = useState('');
    const [activeSelector, setActiveSelector] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [userId, setUserId] = useState(null);
    const [userEmail, setUserEmail] = useState(null);

    // Firebase initialization
    const { firebase, loading: firebaseLoading } = useFirebase();

    // Product data management
    const { products, loading, error, fetchProducts, retry } = useProductData();
    
    // Collections management
    const { collections, loading: collectionsLoading, saveCollection, deleteCollection, updateCollection } = useCollections(userId, firebase);

    // Filter products by category
    const shoeProducts = useMemo(() => products.filter(p => p.category === 'Shoes'), [products]);
    const topProducts = useMemo(() => products.filter(p => p.category === 'Top'), [products]);
    const dressProducts = useMemo(() => products.filter(p => p.category === 'Dress'), [products]);
    const accessoryProducts = useMemo(() => products.filter(p => p.category === 'Accessory'), [products]);
    const handbagProducts = useMemo(() => products.filter(p => p.category === 'Handbag'), [products]);
    const hatProducts = useMemo(() => products.filter(p => p.category === 'Hat'), [products]);
    const bottomProducts = useMemo(() => products.filter(p => p.category === 'Bottom'), [products]);

    // Auth state management
    useEffect(() => {
        if (firebase) {
            const { onAuthStateChanged } = require('firebase/auth');
            const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
                if (user) {
                    setUserId(user.uid);
                    setUserEmail(user.email);
                } else {
                    setUserId(null);
                    setUserEmail(null);
                }
            });

            return () => unsubscribe();
        }
    }, [firebase]);

    // Show loading while Firebase is initializing
    if (firebaseLoading) {
        return (
            <div className="bg-gray-100 min-h-screen font-sans text-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Initializing outfit builder...</p>
                </div>
            </div>
        );
    }

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 3000);
    };

    const handleSelectProduct = useCallback((product) => {
        setOutfit(prevOutfit => {
            let updatedOutfit = { ...prevOutfit };
            if (product.category === 'Dress') {
                showNotification(`Added ${product.name}. Tops and bottoms cleared.`);
                updatedOutfit = { ...updatedOutfit, Top: null, Bottom: null, Dress: product };
            } else if (product.category === 'Top' || product.category === 'Bottom') {
                if(prevOutfit.Dress) showNotification(`${product.name} replaced the dress.`);
                updatedOutfit = { ...updatedOutfit, [product.category]: product, Dress: null };
            } else {
                 showNotification(`Added ${product.name}.`);
                updatedOutfit = { ...updatedOutfit, [product.category]: product };
            }
            return updatedOutfit;
        });
        setActiveSelector(null);
    }, []);

    const handleRemoveItem = useCallback((category) => {
        setOutfit(prevOutfit => ({ ...prevOutfit, [category]: null }));
        showNotification(`${category} removed.`);
    }, []);
    
    const handleClearOutfit = useCallback(() => {
        setOutfit({ Hat: null, Top: null, Bottom: null, Shoes: null, Accessory: null, Handbag: null, Dress: null });
        setActiveSelector(null);
        showNotification("Outfit cleared.");
    }, []);

    const handleSaveCollection = useCallback(async (collectionData) => {
        if (!userId) {
            showNotification("Please sign in to save collections.");
            return;
        }
        try {
            await saveCollection(outfit, collectionData.isPublic);
            handleClearOutfit();
            showNotification("Outfit saved to collections!");
        } catch (error) {
            console.error('Error saving collection:', error);
            showNotification("Failed to save collection. Please try again.");
        }
    }, [outfit, userId, saveCollection, handleClearOutfit]);

    const handleDeleteCollection = useCallback(async (collectionId) => {
        try {
            await deleteCollection(collectionId);
            showNotification("Collection deleted successfully.");
        } catch (error) {
            console.error('Error deleting collection:', error);
            showNotification("Failed to delete collection. Please try again.");
        }
    }, [deleteCollection]);

    const handleOpenSelector = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const handleCategorySelect = (category) => {
        setActiveSelector(category);
        handleCloseModal();
    };

    const productData = { 
        shoeProducts, 
        topProducts, 
        dressProducts, 
        accessoryProducts,
        handbagProducts,
        hatProducts,
        bottomProducts,
        activeSelector 
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            {isModalOpen && <CategoryChoiceModal onSelect={handleCategorySelect} onClose={handleCloseModal} />}
            {isSaveModalOpen && (
                <SaveCollectionModal 
                    isOpen={isSaveModalOpen}
                    onClose={() => setIsSaveModalOpen(false)}
                    onSave={handleSaveCollection}
                    outfit={outfit}
                />
            )}
            
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Outfit Builder</h1>
                    <p className="text-gray-500 mt-1">Create and save your favorite product bundles with real LK Bennett products.</p>
                    {!userId && (
                        <p className="text-sm text-orange-600 mt-2">Sign in to save your collections and collaborate with others!</p>
                    )}
                </div>
            </header>
            
            <main className="container mx-auto p-4 flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
                <div className="flex-shrink-0 mb-8">
                    <ProductList 
                        products={products} 
                        onSelectProduct={handleSelectProduct}
                        loading={loading}
                        error={error}
                        onRetry={retry}
                    />
                </div>
                <div className="flex-grow min-h-0">
                    <OutfitBuilder 
                        outfit={outfit} 
                        productData={productData}
                        onRemoveItem={handleRemoveItem} 
                        onSelectProduct={handleSelectProduct}
                        onSave={() => setIsSaveModalOpen(true)}
                        onClear={handleClearOutfit}
                        onOpenSelector={handleOpenSelector}
                    />
                </div>

                {collections.length > 0 && (
                    <div className="mt-12 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Saved Collections</h2>
                        {collectionsLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {collections.map((collection) => (
                                    <SavedCollectionCard 
                                        key={collection.id} 
                                        collection={collection} 
                                        onDelete={handleDeleteCollection}
                                        onEdit={(collection) => {
                                            setOutfit(collection.outfit);
                                            showNotification("Collection loaded for editing!");
                                        }}
                                        onShare={(collection) => {
                                            // TODO: Implement sharing functionality
                                            showNotification("Sharing feature coming soon!");
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Notification system */}
            {notification && (
                <div className="fixed top-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-out z-50">
                    {notification}
                </div>
            )}

            <style>{`
                @keyframes fade-in-out {
                  0% { opacity: 0; transform: translateY(-20px); }
                  10% { opacity: 1; transform: translateY(0); }
                  90% { opacity: 1; transform: translateY(0); }
                  100% { opacity: 0; transform: translateY(-20px); }
                }
                .animate-fade-in-out { animation: fade-in-out 3s ease-in-out forwards; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

export default App;