'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuthorization } from '@/hooks/useAuthorization';

// --- Helper Components ---

// Icon for close button
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// --- Type Definitions ---
interface Product {
  id: number | string;
  name?: string;
  category?: string;
  imageUrl?: string;
  // Amplience product structure
  titles?: {
    default?: string;
  };
  media?: {
    main_image?: {
      url?: string;
    };
    default?: {
      src?: string;
    };
  };
  properties?: {
    category?: string;
    swatches?: Array<{
      images?: string[];
    }>;
  };
  pricing?: {
    current?: {
      value?: number;
      formatted?: string;
    };
  };
  price?: number;
  url?: string;
}

interface OutfitItem {
  Hat: Product | null;
  Top: Product | null;
  Bottom: Product | null;
  Shoes: Product | null;
  Accessory: Product | null;
  Accessory2: Product | null;
  Handbag: Product | null;
  Dress: Product | null;
}

interface ProductData {
  shoeProducts: Product[];
  topProducts: Product[];
  dressProducts: Product[];
  activeSelector: string | null;
}

interface Collection {
  id: string;
  name: string;
  products: Array<{
    product: Product;
    selectedSwatch: any;
    imageUrl: string;
  }>;
  createdAt: string;
  isPublic: boolean;
}

// --- Main Application Components ---

// Placeholder data for products (including Amplience-style products)
const initialProducts: Product[] = [
    // Simple products with basic structure
    { id: 1, name: 'Athena Tank Top', category: 'Top', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_TJ_ATHENA_BLACK_VISCOSEMIXf' },
    { id: 2, name: 'Loura Necklace', category: 'Accessory', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_NL_NL_LOURA_CLEAR_CRYSTALRHODIUMPLATINGa' },
    { id: 3, name: 'Lou Lou Handbag', category: 'Handbag', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_SH_LOU_LOU_STONE_SUEDEa' },
    { id: 4, name: 'Hardy Skirt', category: 'Bottom', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_SS25_SK_HARDY_CONKER_POLYESTERg' },
    { id: 5, name: 'Elowen Hat', category: 'Hat', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_SS24_HT_ELOWEN_METALLIC_FABRICa' },
    { id: 6, name: 'Julia Dress', category: 'Dress', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_DR_JULIA_CAMELIVORY_POLYESTERMIXe' },
    { id: 7, name: 'Sonya Blouse', category: 'Top', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_TW_SONYA_WHITE_COTTONe' },
    { id: 8, name: 'Allie Trousers', category: 'Bottom', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_SS24_TR_ALLIE_ECRU_COTTONMIXd' },
    { id: 9, name: 'Alina Neckscarf', category: 'Accessory', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_SC_SC%20ALINA_MULTIBLACK_SILKa' },
    { id: 10, name: 'Lou Lou Earrings', category: 'Accessory', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_JW_EA_LOU_LOU_GOLD_METALb' },
    { id: 11, name: 'Perry Belt', category: 'Accessory', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_BT_PERRY_CHOCOLATE_SUEDEa' },
    { id: 12, name: 'Gina Gloves', category: 'Accessory', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW24_GINA_CHOCOLATE_LEATHERa' },
    { id: 13, name: 'Floret Suede Shoes', category: 'Shoes', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_CC_FLORET_NEW_BURGUNDY_SUEDEb' },
    { id: 14, name: 'Fern Nappa Shoes', category: 'Shoes', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_CC_FERN_NEW_ECRU_NAPPALEATHERb' },
    { id: 15, name: 'Florena Trench Shoes', category: 'Shoes', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_CC_FLORENA_TRENCH_NAPPALEATHERb' },
    { id: 16, name: 'Floret Snake Effect Shoes', category: 'Shoes', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_CC_FLORET_NEW_BLACKWHITE_SNAKEEFFECTb' },
    { id: 17, name: 'Vivi Fabric Shoes', category: 'Shoes', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_CC_VIVI_BLACK_FABRICb' },
    { id: 18, name: 'Thelma Velvet Shoes', category: 'Shoes', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_CC_THELMA_IMPERIALBLUE_VELVETb' },
    { id: 19, name: 'Loretta Nappa Shoes', category: 'Shoes', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_KB_LORETTA_BURGUNDY_NAPPALEATHERb' },
    { id: 20, name: 'Amber Satin Shoes', category: 'Shoes', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_FL_AMBER_TEA_SATINb' },
    { id: 21, name: 'Astrid Suede Shoes', category: 'Shoes', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_KB_ASTRID_CHOCOLATE_SUEDEb' },
    { id: 22, name: 'Juno Rope Print Dress', category: 'Dress', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_DR_JUNO_SPRINGNAVYCASHMEREBLUE_VISCOSEe' },
    { id: 23, name: 'Claire Button Detail Dress', category: 'Dress', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_DR_CLAIRE_BLACK_POLYESTERMIXe' },
    { id: 24, name: 'Rosa Sculptured Shift Dress', category: 'Dress', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_DR_ROSA_BLACK_POLYESTERMIXe' },
    { id: 25, name: 'Mimi Floral Print Dress', category: 'Dress', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_DR_MIMI_BIRCHBLACK_VISCOSEMIXe' },
    { id: 26, name: 'Sonya Cream Crepe Blouse', category: 'Top', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_TW_SONYA_CREAM_VISCOSEe' },
    { id: 27, name: 'Athena Cream Jersey Vest Top', category: 'Top', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_TJ_ATHENA_IVORY_VISCOSEMIXe' },
    { id: 28, name: 'Athena Black Jersey Vest Top', category: 'Top', imageUrl: 'https://cdn.media.amplience.net/i/lkbennett/UK_AW25_TJ_ATHENA_BLACK%20_VISCOSEMIXe' },
];

// Component for a single product card
const ProductCard = ({ product, onSelect }: { product: Product; onSelect: (product: Product) => void }) => {
    const getProductName = (product: Product) => {
        return product.name || product.titles?.default || 'Unknown Product';
    };

    const getProductImageUrl = (product: Product) => {
        return product.imageUrl || 
               product.media?.main_image?.url || 
               product.media?.default?.src || 
               product.properties?.swatches?.[0]?.images?.[0] || 
               'https://placehold.co/128x160/f0f0f0/a0a0a0?text=No+Image';
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => onSelect(product)}>
            <div className="h-40 bg-gray-200">
                <img src={getProductImageUrl(product)} alt={getProductName(product)} className="w-full h-full object-cover object-top"
                    onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src='https://placehold.co/128x160/f0f0f0/a0a0a0?text=Error'; }}/>
            </div>
            <div className="p-3">
                <h3 className="font-medium text-gray-800 text-sm truncate">{getProductName(product)}</h3>
                <p className="text-gray-500 text-xs">{product.category}</p>
            </div>
        </div>
    );
};

// Component for the product list with search and filtering
const ProductList = ({ products, onSelectProduct }: { products: Product[]; onSelectProduct: (product: Product) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const categories = ['All', 'Top', 'Bottom', 'Dress', 'Shoes', 'Accessory', 'Handbag', 'Hat'];
    
    // Helper function to get product name - moved before useMemo
    const getProductName = (product: Product) => {
        return product.name || product.titles?.default || 'Unknown Product';
    };
    
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const productCategory = product.category || 'Unknown';
            const productName = getProductName(product);
            const matchesCategory = selectedCategory === 'All' || productCategory === selectedCategory;
            const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, searchTerm, selectedCategory]);

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
        </div>
    );
};

// Component for a single static slot in the outfit builder
const OutfitSlot = ({ category, item, onRemove }: { category: string; item: Product | null; onRemove: (category: string) => void }) => {
    const getCategoryLabel = (cat: string): string => {
        switch(cat) {
            case 'Accessory2':
                return 'Accessory';
            default:
                return cat;
        }
    };

    // Helper function to get product name
    const getProductName = (product: Product) => {
        return product.name || product.titles?.default || 'Unknown Product';
    };

    // Helper function to get product image URL
    const getProductImageUrl = (product: Product) => {
        return product.imageUrl || 
               product.media?.main_image?.url || 
               product.media?.default?.src || 
               product.properties?.swatches?.[0]?.images?.[0] || 
               'https://placehold.co/128x160/f0f0f0/a0a0a0?text=No+Image';
    };

    return (
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg h-40 w-32 flex items-center justify-center bg-white transition-all duration-300">
            {item ? (
                <>
                    <img src={getProductImageUrl(item)} alt={getProductName(item)} className="h-full w-full object-cover object-top rounded-md"
                        onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src='https://placehold.co/128x160/f0f0f0/a0a0a0?text=Image+Error'; }}/>
                    <button onClick={() => onRemove(category)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors" aria-label={`Remove ${getProductName(item)}`}>
                        <XIcon />
                    </button>
                </>
            ) : (
                <span className="text-gray-400 text-sm font-medium">{getCategoryLabel(category)}</span>
            )}
        </div>
    );
};

// New component for the combined Top/Dress slot
const CombinedSlot = ({ topItem, dressItem, onRemove, onOpenSelector }: { topItem: Product | null; dressItem: Product | null; onRemove: (category: string) => void; onOpenSelector: () => void }) => {
    const item = topItem || dressItem;
    const category = topItem ? 'Top' : 'Dress';
    const isDress = !!dressItem;
    const slotHeight = isDress ? 'h-80' : 'h-40'; // Double height for dress

    // Helper function to get product name
    const getProductName = (product: Product) => {
        return product.name || product.titles?.default || 'Unknown Product';
    };

    // Helper function to get product image URL
    const getProductImageUrl = (product: Product) => {
        return product.imageUrl || 
               product.media?.main_image?.url || 
               product.media?.default?.src || 
               product.properties?.swatches?.[0]?.images?.[0] || 
               'https://placehold.co/128x160/f0f0f0/a0a0a0?text=No+Image';
    };

    return (
        <div className={`relative border-2 border-dashed border-gray-300 rounded-lg ${slotHeight} w-32 flex items-center justify-center bg-white transition-all duration-300 cursor-pointer`}
            onClick={!item ? onOpenSelector : undefined}>
            {item ? (
                <>
                    <img src={getProductImageUrl(item)} alt={getProductName(item)} className="h-full w-full object-cover object-top rounded-md"
                        onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src='https://placehold.co/128x160/f0f0f0/a0a0a0?text=Image+Error'; }}/>
                    <button onClick={() => onRemove(category)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors" aria-label={`Remove ${getProductName(item)}`}>
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
const HorizontalProductSelector = ({ products, selectedItem, onSelectItem, categoryName, collections, onToggleCollection }: { products: Product[]; selectedItem: Product | null; onSelectItem: (product: Product) => void; categoryName: string; collections: Collection[]; onToggleCollection: (collectionId: string) => void }) => {
    if (!products || products.length === 0) return null;
    
    // Helper function to get product name
    const getProductName = (product: Product) => {
        return product.name || product.titles?.default || 'Unknown Product';
    };

    // Helper function to get product image URL
    const getProductImageUrl = (product: Product) => {
        return product.imageUrl || 
               product.media?.main_image?.url || 
               product.media?.default?.src || 
               product.properties?.swatches?.[0]?.images?.[0] || 
               'https://placehold.co/128x160/f0f0f0/a0a0a0?text=No+Image';
    };
    
    return (
        <div className="w-full my-2">
            <p className="text-gray-500 text-sm font-medium mb-2 text-center">{categoryName}</p>
            <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-36 h-full border-2 border-dashed border-indigo-300 rounded-lg pointer-events-none z-10"></div>
                <div className="w-full flex overflow-x-auto snap-x snap-mandatory py-4 space-x-4 scrollbar-hide">
                    <div className="flex-shrink-0 w-1/2 -ml-16"></div> {/* Spacer for centering */}
                    {products.map((product: Product) => (
                        <div key={product.id} onClick={() => onSelectItem(product)}
                            className={`snap-center flex-shrink-0 w-32 h-40 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 border-4 ${selectedItem?.id === product.id ? 'border-indigo-500 scale-105 shadow-lg' : 'border-transparent'}`}>
                            <img src={getProductImageUrl(product)} alt={getProductName(product)} className="w-full h-full object-cover object-top"
                                onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src='https://placehold.co/128x160/f0f0f0/a0a0a0?text=Error'; }}/>
                        </div>
                    ))}
                    <div className="flex-shrink-0 w-1/2 -mr-16"></div> {/* Spacer for centering */}
                </div>
            </div>
        </div>
    );
};

// Modal to choose between Top and Dress
const CategoryChoiceModal = ({ onSelect, onClose }: { onSelect: (category: string) => void; onClose: () => void }) => (
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

// Component for the main outfit builder canvas
const OutfitBuilder = ({ 
    outfit, 
    productData, 
    onRemoveItem, 
    onSelectProduct, 
    onSave, 
    onClear, 
    onOpenSelector, 
    outfitId,
    collections, 
    onToggleCollection 
}: { 
    outfit: OutfitItem; 
    productData: ProductData; 
    onRemoveItem: (category: string) => void; 
    onSelectProduct: (product: Product) => void; 
    onSave: () => void; 
    onClear: () => void; 
    onOpenSelector: () => void; 
    outfitId: string;
    collections: Collection[]; 
    onToggleCollection: (collectionId: string) => void; 
}) => {
    const isOutfitEmpty = Object.values(outfit).every(item => item === null);
    const { shoeProducts, activeSelector, topProducts, dressProducts } = productData;

    const selectorProducts = activeSelector === 'Top' ? topProducts : dressProducts;

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Outfit {outfitId}</h2>
                <div>
                    <button onClick={onClear} disabled={isOutfitEmpty} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Clear</button>
                    <button onClick={onSave} disabled={isOutfitEmpty} className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-200 active:scale-95">Save Collection</button>
                </div>
            </div>
            
            {/* Extended mannequin area with new layout */}
            <div className="flex-grow flex items-start justify-center pt-8">
                <div className="grid grid-cols-3 grid-rows-3 gap-4">
                    {/* Row 1: Empty - Hat - Empty */}
                    <div></div>
                    <div className="flex justify-center items-center">
                        <OutfitSlot category="Hat" item={outfit.Hat} onRemove={onRemoveItem} />
                    </div>
                    <div></div>
                    
                    {/* Row 2: Accessory - Top/Dress - Accessory */}
                    <div className="flex justify-center items-center">
                        <OutfitSlot category="Accessory" item={outfit.Accessory} onRemove={onRemoveItem} />
                    </div>
                    <div className={`flex justify-center items-center ${outfit.Dress ? 'row-span-2' : ''}`}>
                        <CombinedSlot topItem={outfit.Top} dressItem={outfit.Dress} onRemove={onRemoveItem} onOpenSelector={onOpenSelector} />
                    </div>
                    <div className="flex justify-center items-center">
                        <OutfitSlot category="Accessory2" item={outfit.Accessory2} onRemove={onRemoveItem} />
                    </div>
                    
                    {/* Row 3: Empty - Bottom (only show if no dress) - Handbag */}
                    <div></div>
                    {!outfit.Dress && (
                        <div className="flex justify-center items-center">
                            <OutfitSlot category="Bottom" item={outfit.Bottom} onRemove={onRemoveItem} />
                        </div>
                    )}
                    {!outfit.Dress && <div></div>}
                    <div className="flex justify-center items-center">
                        <OutfitSlot category="Handbag" item={outfit.Handbag} onRemove={onRemoveItem} />
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 pt-4">
                 <HorizontalProductSelector 
                    products={shoeProducts} 
                    selectedItem={outfit.Shoes} 
                    onSelectItem={onSelectProduct} 
                    categoryName="Shoes" 
                    collections={collections}
                    onToggleCollection={onToggleCollection}
                />
                {activeSelector && (
                    <HorizontalProductSelector 
                        products={selectorProducts} 
                        selectedItem={outfit[activeSelector as keyof OutfitItem] as Product} 
                        onSelectItem={onSelectProduct} 
                        categoryName={activeSelector} 
                        collections={collections}
                        onToggleCollection={onToggleCollection}
                    />
                )}
            </div>
        </div>
    );
};

// Component for saved collection card
const SavedCollectionCard = ({ collection, id, onDelete }: { collection: OutfitItem; id: number; onDelete: (index: number) => void }) => {
    const getProductName = (product: Product) => {
        return product.name || product.titles?.default || 'Unknown Product';
    };

    const getProductImageUrl = (product: Product) => {
        return product.imageUrl || 
               product.media?.main_image?.url || 
               product.media?.default?.src || 
               product.properties?.swatches?.[0]?.images?.[0] || 
               'https://placehold.co/128x160/f0f0f0/a0a0a0?text=No+Image';
    };

    const items = Object.entries(collection).filter(([_, item]) => item !== null);
    
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Collection #{id + 1}</h3>
                <button onClick={() => onDelete(id)} className="text-red-500 hover:text-red-700">
                    <XIcon />
                </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {items.slice(0, 4).map(([category, item]) => (
                    <div key={category} className="text-center">
                        <div className="w-16 h-20 mx-auto bg-gray-100 rounded overflow-hidden">
                            <img src={getProductImageUrl(item!)} alt={getProductName(item!)} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{category}</p>
                    </div>
                ))}
            </div>
            {items.length > 4 && (
                <p className="text-xs text-gray-500 text-center mt-2">+{items.length - 4} more items</p>
            )}
        </div>
    );
};

// Main App component
function App() {
    const { userEmail } = useAuthorization();
    const userId = userEmail || "public";
    
    const [outfits, setOutfits] = useState<{ [key: string]: OutfitItem }>({
        'A': { Hat: null, Top: null, Bottom: null, Shoes: null, Accessory: null, Accessory2: null, Handbag: null, Dress: null },
        'B': { Hat: null, Top: null, Bottom: null, Shoes: null, Accessory: null, Accessory2: null, Handbag: null, Dress: null },
        'C': { Hat: null, Top: null, Bottom: null, Shoes: null, Accessory: null, Accessory2: null, Handbag: null, Dress: null },
        'D': { Hat: null, Top: null, Bottom: null, Shoes: null, Accessory: null, Accessory2: null, Handbag: null, Dress: null }
    });
    const [collections, setCollections] = useState<OutfitItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSelector, setActiveSelector] = useState<string | null>(null);
    const [activeOutfitId, setActiveOutfitId] = useState<string>('A');
    const [realCollections, setRealCollections] = useState<Collection[]>([]);
    const [notification, setNotification] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

    // Fetch real collections from API
    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const response = await fetch(`/api/collections?userId=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.collections) {
                        setRealCollections(data.collections);
                    }
                }
            } catch (error) {
                console.error('Error fetching collections:', error);
            }
        };
        
        fetchCollections();
    }, []);

    const showNotification = (message: string) => {
        setNotification({ message, visible: true });
        setTimeout(() => setNotification({ message: '', visible: false }), 3000);
    };

    // Filter products by category
    const shoeProducts = useMemo(() => initialProducts.filter(p => p.category === 'Shoes'), []);
    const topProducts = useMemo(() => initialProducts.filter(p => p.category === 'Top'), []);
    const dressProducts = useMemo(() => initialProducts.filter(p => p.category === 'Dress'), []);

    const handleSelectProduct = useCallback((product: Product) => {
        setOutfits(prevOutfits => {
            const updatedOutfits = { ...prevOutfits };
            const currentOutfit = updatedOutfits[activeOutfitId];
            
            const productCategory = getProductCategory(product);
            const productName = getProductName(product);
            
            if (productCategory === 'Dress') {
                showNotification(`Added ${productName} to Outfit ${activeOutfitId}. Tops and bottoms cleared.`);
                updatedOutfits[activeOutfitId] = { ...currentOutfit, Top: null, Bottom: null, Dress: product };
            } else if (productCategory === 'Top' || productCategory === 'Bottom') {
                if(currentOutfit.Dress) showNotification(`${productName} replaced the dress in Outfit ${activeOutfitId}.`);
                updatedOutfits[activeOutfitId] = { ...currentOutfit, [productCategory]: product, Dress: null };
            } else {
                 showNotification(`Added ${productName} to Outfit ${activeOutfitId}.`);
                updatedOutfits[activeOutfitId] = { ...currentOutfit, [productCategory]: product };
            }
            return updatedOutfits;
        });
        setActiveSelector(null);
    }, [activeOutfitId]);

    const handleRemoveItem = useCallback((category: string) => {
        setOutfits(prevOutfits => {
            const updatedOutfits = { ...prevOutfits };
            updatedOutfits[activeOutfitId] = { ...updatedOutfits[activeOutfitId], [category]: null };
            return updatedOutfits;
        });
        showNotification(`${category} removed from Outfit ${activeOutfitId}.`);
    }, [activeOutfitId]);
    
    const handleClearOutfit = useCallback((outfitId: string) => {
        setOutfits(prevOutfits => ({
            ...prevOutfits,
            [outfitId]: { Hat: null, Top: null, Bottom: null, Shoes: null, Accessory: null, Accessory2: null, Handbag: null, Dress: null }
        }));
        setActiveSelector(null);
        showNotification(`Outfit ${outfitId} cleared.`);
    }, []);

    const handleSaveCollection = useCallback((outfitId: string) => {
        const outfitToSave = outfits[outfitId];
        setCollections(prev => [...prev, outfitToSave]);
        handleClearOutfit(outfitId);
        showNotification(`Outfit ${outfitId} saved to collections!`);
    }, [outfits, handleClearOutfit]);

    const handleDeleteCollection = useCallback((indexToDelete: number) => {
        setCollections(prev => prev.filter((_, index) => index !== indexToDelete));
        showNotification(`Collection #${indexToDelete + 1} deleted.`);
    }, []);

    const handleToggleCollection = useCallback((collectionId: string) => {
        setRealCollections(prev => prev.map(col => 
            col.id === collectionId ? { ...col, isPublic: !col.isPublic } : col
        ));
        const collection = realCollections.find(col => col.id === collectionId);
        if (collection) {
            showNotification(`Collection "${collection.name}" is now ${collection.isPublic ? 'public' : 'private'}.`);
        }
    }, [realCollections]);
    
    const handleOpenSelector = (outfitId: string) => {
        setActiveOutfitId(outfitId);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => setIsModalOpen(false);
    const handleCategorySelect = (category: string) => {
        setActiveSelector(category);
        handleCloseModal();
    };

    const productData: ProductData = { shoeProducts, topProducts, dressProducts, activeSelector };

    // Helper functions
    const getProductCategory = (product: Product): string => {
        return product.category || 'Unknown';
    };

    const getProductName = (product: Product): string => {
        return product.name || product.titles?.default || 'Unknown Product';
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-900">
            {isModalOpen && <CategoryChoiceModal onSelect={handleCategorySelect} onClose={handleCloseModal} />}
            
            {/* Notification */}
            {notification.visible && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
                    {notification.message}
                </div>
            )}
            
            <header className="bg-white shadow-md">
                <div className="w-full px-4 py-4">
                    <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">Outfit Builder</h1>
                    <p className="text-gray-500 mt-1">Create and save your favorite product bundles.</p>
                </div>
            </header>
            
            <main className="w-full p-4">
                {/* Product Search */}
                <div className="mb-8">
                    <ProductList products={initialProducts} onSelectProduct={handleSelectProduct} />
                </div>
                
                {/* 4 Outfit Builders */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Outfit Builders</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                        {Object.entries(outfits).map(([outfitId, outfit]) => (
                            <OutfitBuilder 
                                key={outfitId}
                                outfitId={outfitId}
                                outfit={outfit} 
                                productData={productData}
                                onRemoveItem={handleRemoveItem} 
                                onSelectProduct={handleSelectProduct}
                                onSave={() => handleSaveCollection(outfitId)}
                                onClear={() => handleClearOutfit(outfitId)}
                                onOpenSelector={() => handleOpenSelector(outfitId)}
                                collections={realCollections}
                                onToggleCollection={handleToggleCollection}
                            />
                        ))}
                    </div>
                </div>

                {/* Real Collections from API */}
                {realCollections.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Collections</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {realCollections.map((collection, index) => (
                                <div key={collection.id} className="bg-white rounded-lg shadow-md p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold text-gray-800">{collection.name}</h3>
                                        <span className="text-xs text-gray-500">{new Date(collection.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {collection.products.slice(0, 4).map((item, idx) => (
                                            <div key={idx} className="text-center">
                                                <div className="w-16 h-20 mx-auto bg-gray-100 rounded overflow-hidden">
                                                    <img src={item.imageUrl} alt={item.product.titles?.default || 'Product'} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {collection.products.length > 4 && (
                                        <p className="text-xs text-gray-500 text-center mt-2">+{collection.products.length - 4} more items</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Saved Collections */}
                {collections.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Saved Collections</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {collections.map((collection, index) => (
                                <SavedCollectionCard key={index} collection={collection} id={index} onDelete={handleDeleteCollection} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Extended content section */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Outfit Builder Tips</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">🎯 Start with Basics</h3>
                            <p className="text-gray-600 text-sm">Begin with a top or dress, then add bottoms and shoes to complete your look.</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">💎 Accessorize Smart</h3>
                            <p className="text-gray-600 text-sm">Add accessories like necklaces, scarves, and handbags to elevate your outfit.</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">👒 Hat Selection</h3>
                            <p className="text-gray-600 text-sm">Choose hats that complement your outfit's style and color palette.</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">👠 Perfect Shoes</h3>
                            <p className="text-gray-600 text-sm">Select shoes that match your outfit's formality and color scheme.</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">👜 Bag Coordination</h3>
                            <p className="text-gray-600 text-sm">Match your handbag to your outfit's style and occasion.</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-800 mb-2">💾 Save Favorites</h3>
                            <p className="text-gray-600 text-sm">Save your favorite combinations to recreate them later.</p>
                        </div>
                    </div>
                </div>

                {/* Footer section */}
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Create Your Perfect Look?</h3>
                    <p className="text-gray-600 mb-4">Explore our collection of LK Bennett products and build stunning outfits for any occasion.</p>
                    <div className="flex justify-center space-x-4">
                        <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                            Browse All Products
                        </button>
                        <button className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                            View Collections
                        </button>
                    </div>
                </div>
            </main>
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
