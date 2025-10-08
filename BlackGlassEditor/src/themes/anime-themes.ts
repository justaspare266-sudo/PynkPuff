// 🎌 Anime-Inspired Themes for the Ultimate Creative Playground! ⚡✨
// So amazing that even Pokemon would want to play here! 🎮

export interface AnimeTheme {
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    shadow: string;
    glow: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
  };
  effects: {
    blur: string;
    glow: string;
    shadow: string;
    animation: string;
  };
  icons: {
    style: 'outline' | 'filled' | 'gradient' | 'neon';
    color: string;
  };
}

export const animeThemes: Record<string, AnimeTheme> = {
  // 🌸 Sakura Dreams - Soft, dreamy pink theme
  sakura: {
    name: 'Sakura Dreams',
    description: 'Soft pink petals dancing in the wind 🌸',
    colors: {
      primary: '#ff6b9d',
      secondary: '#ffc1e3',
      accent: '#ff9ec7',
      background: '#fef7f7',
      surface: '#ffffff',
      text: '#2d1b2e',
      textSecondary: '#8b5a6b',
      border: '#ffb3d1',
      shadow: 'rgba(255, 107, 157, 0.25)',
      glow: 'rgba(255, 107, 157, 0.5)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ff6b9d 0%, #ffc1e3 100%)',
      secondary: 'linear-gradient(45deg, #ff9ec7 0%, #ffb3d1 100%)',
      background: 'linear-gradient(180deg, #fef7f7 0%, #ffeef7 100%)',
      surface: 'linear-gradient(135deg, #ffffff 0%, #fff5f8 100%)'
    },
    effects: {
      blur: 'blur(8px)',
      glow: '0 0 20px rgba(255, 107, 157, 0.3)',
      shadow: '0 8px 32px rgba(255, 107, 157, 0.15)',
      animation: 'sakura-float 3s ease-in-out infinite'
    },
    icons: {
      style: 'gradient',
      color: '#ff6b9d'
    }
  },

  // ⚡ Electric Thunder - Vibrant electric theme
  thunder: {
    name: 'Electric Thunder',
    description: 'Pikachu\'s favorite theme! ⚡',
    colors: {
      primary: '#ffd700',
      secondary: '#ffed4e',
      accent: '#ff6b35',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#ffd700',
      shadow: 'rgba(255, 215, 0, 0.25)',
      glow: 'rgba(255, 215, 0, 0.5)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
      secondary: 'linear-gradient(45deg, #ff6b35 0%, #ffd700 100%)',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
      surface: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
    },
    effects: {
      blur: 'blur(6px)',
      glow: '0 0 25px rgba(255, 215, 0, 0.5)',
      shadow: '0 8px 32px rgba(255, 215, 0, 0.2)',
      animation: 'thunder-pulse 2s ease-in-out infinite'
    },
    icons: {
      style: 'neon',
      color: '#ffd700'
    }
  },

  // 🌊 Ocean Breeze - Calm blue theme
  ocean: {
    name: 'Ocean Breeze',
    description: 'Deep blue waves and coral dreams 🌊',
    colors: {
      primary: '#00b4d8',
      secondary: '#90e0ef',
      accent: '#0077b6',
      background: '#f0f8ff',
      surface: '#ffffff',
      text: '#023e8a',
      textSecondary: '#0077b6',
      border: '#90e0ef',
      shadow: 'rgba(0, 180, 216, 0.25)',
      glow: 'rgba(0, 180, 216, 0.5)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00b4d8 0%, #90e0ef 100%)',
      secondary: 'linear-gradient(45deg, #0077b6 0%, #00b4d8 100%)',
      background: 'linear-gradient(180deg, #f0f8ff 0%, #e0f2ff 100%)',
      surface: 'linear-gradient(135deg, #ffffff 0%, #f0f8ff 100%)'
    },
    effects: {
      blur: 'blur(10px)',
      glow: '0 0 20px rgba(0, 180, 216, 0.3)',
      shadow: '0 8px 32px rgba(0, 180, 216, 0.15)',
      animation: 'ocean-wave 4s ease-in-out infinite'
    },
    icons: {
      style: 'gradient',
      color: '#00b4d8'
    }
  },

  // 🌸 Cherry Blossom - Traditional Japanese theme
  cherry: {
    name: 'Cherry Blossom',
    description: 'Traditional Japanese elegance 🌸',
    colors: {
      primary: '#e91e63',
      secondary: '#f8bbd9',
      accent: '#ad1457',
      background: '#fce4ec',
      surface: '#ffffff',
      text: '#2e2e2e',
      textSecondary: '#666666',
      border: '#f8bbd9',
      shadow: 'rgba(233, 30, 99, 0.25)',
      glow: 'rgba(233, 30, 99, 0.5)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #e91e63 0%, #f8bbd9 100%)',
      secondary: 'linear-gradient(45deg, #ad1457 0%, #e91e63 100%)',
      background: 'linear-gradient(180deg, #fce4ec 0%, #f8bbd9 100%)',
      surface: 'linear-gradient(135deg, #ffffff 0%, #fce4ec 100%)'
    },
    effects: {
      blur: 'blur(12px)',
      glow: '0 0 25px rgba(233, 30, 99, 0.3)',
      shadow: '0 8px 32px rgba(233, 30, 99, 0.15)',
      animation: 'cherry-fall 5s ease-in-out infinite'
    },
    icons: {
      style: 'gradient',
      color: '#e91e63'
    }
  },

  // 🌟 Cosmic Galaxy - Space theme
  galaxy: {
    name: 'Cosmic Galaxy',
    description: 'Journey through the stars ✨',
    colors: {
      primary: '#9d4edd',
      secondary: '#c77dff',
      accent: '#7209b7',
      background: '#0a0a0a',
      surface: '#1a1a1a',
      text: '#ffffff',
      textSecondary: '#cccccc',
      border: '#9d4edd',
      shadow: 'rgba(157, 78, 221, 0.25)',
      glow: 'rgba(157, 78, 221, 0.5)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #9d4edd 0%, #c77dff 100%)',
      secondary: 'linear-gradient(45deg, #7209b7 0%, #9d4edd 100%)',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
      surface: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)'
    },
    effects: {
      blur: 'blur(8px)',
      glow: '0 0 30px rgba(157, 78, 221, 0.4)',
      shadow: '0 8px 32px rgba(157, 78, 221, 0.2)',
      animation: 'galaxy-spin 6s linear infinite'
    },
    icons: {
      style: 'neon',
      color: '#9d4edd'
    }
  },

  // 🌈 Rainbow Magic - Vibrant rainbow theme
  rainbow: {
    name: 'Rainbow Magic',
    description: 'All the colors of the rainbow! 🌈',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#45b7d1',
      background: '#f8f9fa',
      surface: '#ffffff',
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      border: '#e9ecef',
      shadow: 'rgba(255, 107, 107, 0.25)',
      glow: 'rgba(255, 107, 107, 0.5)'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)',
      secondary: 'linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 100%)',
      background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
      surface: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
    },
    effects: {
      blur: 'blur(6px)',
      glow: '0 0 20px rgba(255, 107, 107, 0.3)',
      shadow: '0 8px 32px rgba(255, 107, 107, 0.15)',
      animation: 'rainbow-shift 3s ease-in-out infinite'
    },
    icons: {
      style: 'gradient',
      color: '#ff6b6b'
    }
  }
};

// 🎨 CSS Animations for the themes
export const animeAnimations = `
  @keyframes sakura-float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(5deg); }
  }

  @keyframes thunder-pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
    50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
  }

  @keyframes ocean-wave {
    0%, 100% { transform: translateX(0px); }
    50% { transform: translateX(5px); }
  }

  @keyframes cherry-fall {
    0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(20px) rotate(360deg); opacity: 0; }
  }

  @keyframes galaxy-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes rainbow-shift {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
  }
`;

// 🎮 Pokemon-inspired color palettes
export const pokemonPalettes = {
  pikachu: ['#ffd700', '#ffed4e', '#ff6b35', '#000000'],
  charizard: ['#ff6b35', '#ff8c42', '#ffd700', '#8b0000'],
  blastoise: ['#4169e1', '#87ceeb', '#00b4d8', '#000080'],
  venusaur: ['#32cd32', '#90ee90', '#228b22', '#006400'],
  mewtwo: ['#9370db', '#dda0dd', '#ff69b4', '#4b0082']
};

