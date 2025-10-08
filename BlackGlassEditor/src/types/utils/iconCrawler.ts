/**
 * Iconsax Icon Crawler
 * Utility to fetch and process Iconsax icons
 */

export interface IconsaxIcon {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  svg: string;
  variants: string[];
  tags: string[];
}

export interface CrawlerConfig {
  baseUrl: string;
  apiKey?: string;
  batchSize: number;
  categories: string[];
}

const defaultConfig: CrawlerConfig = {
  baseUrl: 'https://app.iconsax.io',
  batchSize: 50,
  categories: [
    'household',
    'people',
    'emotions',
    'media',
    'system',
    'business',
    'shopping',
    'travel',
    'food',
    'sports',
    'health',
    'education',
    'technology',
    'nature',
    'transportation'
  ]
};

export class IconsaxCrawler {
  private config: CrawlerConfig;
  private icons: IconsaxIcon[] = [];
  private isCrawling = false;

  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    console.log('IconsaxCrawler initialized with config:', this.config);
  }

  /**
   * Start crawling Iconsax icons
   */
  async startCrawling(): Promise<IconsaxIcon[]> {
    if (this.isCrawling) {
      throw new Error('Crawler is already running');
    }

    this.isCrawling = true;
    this.icons = [];

    try {
      // For now, we'll use a mock implementation
      // In a real implementation, you would:
      // 1. Make API calls to Iconsax
      // 2. Parse their icon data
      // 3. Convert to our format
      
      console.log('Starting Iconsax icon crawl...');
      
      // Mock data for demonstration
      const mockIcons = this.generateMockIcons();
      this.icons = mockIcons;
      
      console.log(`Crawled ${this.icons.length} icons`);
      return this.icons;
    } catch (error) {
      console.error('Error crawling icons:', error);
      throw error;
    } finally {
      this.isCrawling = false;
    }
  }

  /**
   * Generate mock Iconsax-style icons for demonstration
   */
  private generateMockIcons(): IconsaxIcon[] {
    const mockIcons: IconsaxIcon[] = [
      // Household
      {
        id: 'home-2',
        name: 'Home 2',
        category: 'household',
        keywords: ['home', 'house', 'building', 'residence', 'dwelling'],
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
        variants: ['outline', 'bold', 'bulk', 'linear'],
        tags: ['household', 'building', 'home']
      },
      {
        id: 'building-1',
        name: 'Building',
        category: 'household',
        keywords: ['building', 'office', 'workplace', 'structure'],
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"/></svg>',
        variants: ['outline', 'bold', 'bulk', 'linear'],
        tags: ['household', 'building', 'office']
      },
      
      // People
      {
        id: 'user-2',
        name: 'User 2',
        category: 'people',
        keywords: ['user', 'person', 'profile', 'account', 'avatar'],
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        variants: ['outline', 'bold', 'bulk', 'linear'],
        tags: ['people', 'user', 'profile']
      },
      {
        id: 'users-1',
        name: 'Users',
        category: 'people',
        keywords: ['users', 'people', 'group', 'team', 'community'],
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        variants: ['outline', 'bold', 'bulk', 'linear'],
        tags: ['people', 'group', 'team']
      },
      
      // Emotions
      {
        id: 'smile-1',
        name: 'Smile',
        category: 'emotions',
        keywords: ['smile', 'happy', 'joy', 'emotion', 'face'],
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
        variants: ['outline', 'bold', 'bulk', 'linear'],
        tags: ['emotions', 'happy', 'smile']
      },
      {
        id: 'frown-1',
        name: 'Frown',
        category: 'emotions',
        keywords: ['frown', 'sad', 'unhappy', 'emotion', 'face'],
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
        variants: ['outline', 'bold', 'bulk', 'linear'],
        tags: ['emotions', 'sad', 'frown']
      },
      
      // Media
      {
        id: 'play-1',
        name: 'Play',
        category: 'media',
        keywords: ['play', 'video', 'media', 'start', 'triangle'],
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5,3 19,12 5,21 5,3"/></svg>',
        variants: ['outline', 'bold', 'bulk', 'linear'],
        tags: ['media', 'play', 'video']
      },
      {
        id: 'pause-1',
        name: 'Pause',
        category: 'media',
        keywords: ['pause', 'video', 'media', 'stop', 'control'],
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>',
        variants: ['outline', 'bold', 'bulk', 'linear'],
        tags: ['media', 'pause', 'video']
      },
      
      // System
      {
        id: 'wifi-1',
        name: 'WiFi',
        category: 'system',
        keywords: ['wifi', 'internet', 'connection', 'network', 'signal'],
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
        variants: ['outline', 'bold', 'bulk', 'linear'],
        tags: ['system', 'wifi', 'network']
      },
      {
        id: 'battery-1',
        name: 'Battery',
        category: 'system',
        keywords: ['battery', 'power', 'energy', 'charge', 'level'],
        svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="6" width="18" height="10" rx="2" ry="2"/><line x1="23" y1="13" x2="23" y2="11"/></svg>',
        variants: ['outline', 'bold', 'bulk', 'linear'],
        tags: ['system', 'battery', 'power']
      }
    ];

    return mockIcons;
  }

  /**
   * Get all crawled icons
   */
  getIcons(): IconsaxIcon[] {
    return this.icons;
  }

  /**
   * Search icons by query
   */
  searchIcons(query: string): IconsaxIcon[] {
    const lowercaseQuery = query.toLowerCase();
    return this.icons.filter(icon =>
      icon.name.toLowerCase().includes(lowercaseQuery) ||
      icon.keywords.some(keyword => keyword.toLowerCase().includes(lowercaseQuery)) ||
      icon.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get icons by category
   */
  getIconsByCategory(category: string): IconsaxIcon[] {
    return this.icons.filter(icon => icon.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    return Array.from(new Set(this.icons.map(icon => icon.category)));
  }

  /**
   * Export icons to JSON
   */
  exportToJSON(): string {
    return JSON.stringify(this.icons, null, 2);
  }

  /**
   * Save icons to localStorage
   */
  saveToLocalStorage(key: string = 'iconsax-icons'): void {
    localStorage.setItem(key, this.exportToJSON());
  }

  /**
   * Load icons from localStorage
   */
  loadFromLocalStorage(key: string = 'iconsax-icons'): IconsaxIcon[] {
    const stored = localStorage.getItem(key);
    if (stored) {
      this.icons = JSON.parse(stored);
      return this.icons;
    }
    return [];
  }
}

// Export singleton instance
export const iconsaxCrawler = new IconsaxCrawler();
