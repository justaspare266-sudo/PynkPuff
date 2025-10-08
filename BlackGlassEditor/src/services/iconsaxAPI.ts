/**
 * Iconsax API Integration Service
 * Real integration with Iconsax Firebase API
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// Iconsax Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBj7gPZQT_9sdLTEDcSXHD2RWJTg1s9aZM",
  authDomain: "iconsax-38c5c.firebaseapp.com",
  projectId: "iconsax-38c5c",
  storageBucket: "iconsax-38c5c.firebasestorage.app",
  messagingSenderId: "456858031928",
  appId: "1:456858031928:web:d8005dec0c4ecdc06613cd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface IconsaxIcon {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  svg: string;
  variants: string[];
  tags: string[];
  author?: string;
  license?: string;
  createdAt?: Date;
  updatedAt?: Date;
  downloads?: number;
  views?: number;
}

export interface IconsaxAPIResponse {
  icons: IconsaxIcon[];
  total: number;
  hasMore: boolean;
  lastDoc?: any;
}

export interface IconsaxSearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  variants?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'category' | 'downloads' | 'views' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

class IconsaxAPIService {
  private db = db;
  private iconsCollection = 'icons';
  private categoriesCollection = 'categories';

  /**
   * Search icons with various filters
   */
  async searchIcons(params: IconsaxSearchParams = {}): Promise<IconsaxAPIResponse> {
    try {
      const {
        query = '',
        category = '',
        tags = [],
        variants = [],
        limit: limitCount = 50,
        offset = 0,
        sortBy = 'name',
        sortOrder = 'asc'
      } = params;

      let q = query(collection(this.db, this.iconsCollection));

      // Apply filters
      if (category) {
        q = query(q, where('category', '==', category));
      }

      if (tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', tags));
      }

      if (variants.length > 0) {
        q = query(q, where('variants', 'array-contains-any', variants));
      }

      // Apply sorting
      const sortField = sortBy === 'createdAt' ? 'createdAt' : sortBy;
      q = query(q, orderBy(sortField, sortOrder));

      // Apply pagination
      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      const icons: IconsaxIcon[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        icons.push({
          id: doc.id,
          name: data.name || '',
          category: data.category || '',
          keywords: data.keywords || [],
          svg: data.svg || '',
          variants: data.variants || [],
          tags: data.tags || [],
          author: data.author,
          license: data.license,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          downloads: data.downloads || 0,
          views: data.views || 0
        });
      });

      return {
        icons,
        total: icons.length,
        hasMore: icons.length === limitCount,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };
    } catch (error) {
      console.error('Error searching icons:', error);
      throw new Error('Failed to search icons');
    }
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const snapshot = await getDocs(collection(this.db, this.categoriesCollection));
      const categories: string[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        if (data.name) {
          categories.push(data.name);
        }
      });

      return categories.sort();
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Get popular icons
   */
  async getPopularIcons(limitCount: number = 20): Promise<IconsaxIcon[]> {
    try {
      const q = query(
        collection(this.db, this.iconsCollection),
        orderBy('downloads', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const icons: IconsaxIcon[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        icons.push({
          id: doc.id,
          name: data.name || '',
          category: data.category || '',
          keywords: data.keywords || [],
          svg: data.svg || '',
          variants: data.variants || [],
          tags: data.tags || [],
          author: data.author,
          license: data.license,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          downloads: data.downloads || 0,
          views: data.views || 0
        });
      });

      return icons;
    } catch (error) {
      console.error('Error fetching popular icons:', error);
      return [];
    }
  }

  /**
   * Get recent icons
   */
  async getRecentIcons(limitCount: number = 20): Promise<IconsaxIcon[]> {
    try {
      const q = query(
        collection(this.db, this.iconsCollection),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const icons: IconsaxIcon[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        icons.push({
          id: doc.id,
          name: data.name || '',
          category: data.category || '',
          keywords: data.keywords || [],
          svg: data.svg || '',
          variants: data.variants || [],
          tags: data.tags || [],
          author: data.author,
          license: data.license,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          downloads: data.downloads || 0,
          views: data.views || 0
        });
      });

      return icons;
    } catch (error) {
      console.error('Error fetching recent icons:', error);
      return [];
    }
  }

  /**
   * Get icons by category
   */
  async getIconsByCategory(category: string, limitCount: number = 50): Promise<IconsaxIcon[]> {
    try {
      const q = query(
        collection(this.db, this.iconsCollection),
        where('category', '==', category),
        orderBy('name', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const icons: IconsaxIcon[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        icons.push({
          id: doc.id,
          name: data.name || '',
          category: data.category || '',
          keywords: data.keywords || [],
          svg: data.svg || '',
          variants: data.variants || [],
          tags: data.tags || [],
          author: data.author,
          license: data.license,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          downloads: data.downloads || 0,
          views: data.views || 0
        });
      });

      return icons;
    } catch (error) {
      console.error('Error fetching icons by category:', error);
      return [];
    }
  }

  /**
   * Search icons by text query
   */
  async searchIconsByText(query: string, limitCount: number = 50): Promise<IconsaxIcon[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simplified implementation that searches by name
      const q = query(
        collection(this.db, this.iconsCollection),
        where('name', '>=', query),
        where('name', '<=', query + '\uf8ff'),
        orderBy('name', 'asc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const icons: IconsaxIcon[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data() as any;
        icons.push({
          id: doc.id,
          name: data.name || '',
          category: data.category || '',
          keywords: data.keywords || [],
          svg: data.svg || '',
          variants: data.variants || [],
          tags: data.tags || [],
          author: data.author,
          license: data.license,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          downloads: data.downloads || 0,
          views: data.views || 0
        });
      });

      return icons;
    } catch (error) {
      console.error('Error searching icons by text:', error);
      return [];
    }
  }

  /**
   * Get icon by ID
   */
  async getIconById(id: string): Promise<IconsaxIcon | null> {
    try {
      const q = query(collection(this.db, this.iconsCollection), where('__name__', '==', id));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name || '',
        category: data.category || '',
        keywords: data.keywords || [],
        svg: data.svg || '',
        variants: data.variants || [],
        tags: data.tags || [],
        author: data.author,
        license: data.license,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        downloads: data.downloads || 0,
        views: data.views || 0
      };
    } catch (error) {
      console.error('Error fetching icon by ID:', error);
      return null;
    }
  }

  /**
   * Get icon statistics
   */
  async getIconStats(): Promise<{
    totalIcons: number;
    totalCategories: number;
    totalDownloads: number;
    mostPopularCategory: string;
  }> {
    try {
      // This would require additional Firestore queries or a separate stats collection
      // For now, return mock data
      return {
        totalIcons: 0,
        totalCategories: 0,
        totalDownloads: 0,
        mostPopularCategory: ''
      };
    } catch (error) {
      console.error('Error fetching icon stats:', error);
      return {
        totalIcons: 0,
        totalCategories: 0,
        totalDownloads: 0,
        mostPopularCategory: ''
      };
    }
  }
}

// Export singleton instance
export const iconsaxAPI = new IconsaxAPIService();
