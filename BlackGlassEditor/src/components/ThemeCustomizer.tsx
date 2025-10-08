import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sun, Moon, Monitor, Paintbrush, Eye, Download, Upload } from 'lucide-react';
import { sanitizeHtml, sanitizeForLog } from '../utils/security';

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
  };
  mode: 'light' | 'dark' | 'auto';
  borderRadius: number;
  spacing: number;
  shadows: boolean;
  animations: boolean;
}

const defaultThemes: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright interface',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      accent: '#06b6d4'
    },
    mode: 'light',
    borderRadius: 8,
    spacing: 16,
    shadows: true,
    animations: true
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes for long sessions',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      accent: '#22d3ee'
    },
    mode: 'dark',
    borderRadius: 8,
    spacing: 16,
    shadows: true,
    animations: true
  },
  {
    id: 'purple',
    name: 'Purple',
    description: 'Creative and vibrant purple theme',
    colors: {
      primary: '#8b5cf6',
      secondary: '#a78bfa',
      background: '#faf5ff',
      surface: '#f3e8ff',
      text: '#581c87',
      textSecondary: '#7c3aed',
      border: '#e9d5ff',
      accent: '#c084fc'
    },
    mode: 'light',
    borderRadius: 12,
    spacing: 20,
    shadows: true,
    animations: true
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and distraction-free',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#000000',
      textSecondary: '#666666',
      border: '#e0e0e0',
      accent: '#333333'
    },
    mode: 'light',
    borderRadius: 4,
    spacing: 12,
    shadows: false,
    animations: false
  }
];

export const ThemeCustomizer: React.FC = () => {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[0]);
  const [customThemes, setCustomThemes] = useState<Theme[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('editor-theme');
    const savedCustomThemes = localStorage.getItem('editor-custom-themes');
    
    if (savedTheme) {
      try {
        // Check if it's already a parsed object or a JSON string
        const theme = typeof savedTheme === 'string' ? JSON.parse(savedTheme) : savedTheme;
        setCurrentTheme(theme);
        applyTheme(theme);
      } catch (error) {
        console.error('Failed to load saved theme:', sanitizeForLog(error instanceof Error ? error.message : String(error)));
        // Clear invalid theme data
        localStorage.removeItem('editor-theme');
      }
    }

    if (savedCustomThemes) {
      try {
        setCustomThemes(JSON.parse(savedCustomThemes));
      } catch (error) {
        console.error('Failed to load custom themes:', sanitizeForLog(error instanceof Error ? error.message : String(error)));
      }
    }
  }, []);

  // Apply theme to document
  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    root.style.setProperty('--border-radius', `${theme.borderRadius}px`);
    root.style.setProperty('--spacing', `${theme.spacing}px`);
    root.style.setProperty('--shadows', theme.shadows ? '1' : '0');
    root.style.setProperty('--animations', theme.animations ? '1' : '0');
    
    // Apply theme class
    root.className = root.className.replace(/theme-\w+/g, '');
    root.classList.add(`theme-${theme.id}`);
    
    // Save theme
    localStorage.setItem('editor-theme', JSON.stringify(theme));
  };

  // Switch theme
  const switchTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
  };

  // Create custom theme
  const createCustomTheme = () => {
    const newTheme: Theme = {
      ...currentTheme,
      id: `custom-${Date.now()}`,
      name: 'Custom Theme',
      description: 'My custom theme'
    };
    setEditingTheme(newTheme);
    setIsEditing(true);
  };

  // Save custom theme
  const saveCustomTheme = (theme: Theme) => {
    const updatedCustomThemes = [...customThemes];
    const existingIndex = updatedCustomThemes.findIndex(t => t.id === theme.id);
    
    if (existingIndex >= 0) {
      updatedCustomThemes[existingIndex] = theme;
    } else {
      updatedCustomThemes.push(theme);
    }
    
    setCustomThemes(updatedCustomThemes);
    localStorage.setItem('editor-custom-themes', JSON.stringify(updatedCustomThemes));
    switchTheme(theme);
    setIsEditing(false);
    setEditingTheme(null);
  };

  // Delete custom theme
  const deleteCustomTheme = (themeId: string) => {
    const updatedCustomThemes = customThemes.filter(t => t.id !== themeId);
    setCustomThemes(updatedCustomThemes);
    localStorage.setItem('editor-custom-themes', JSON.stringify(updatedCustomThemes));
    
    if (currentTheme.id === themeId) {
      switchTheme(defaultThemes[0]);
    }
  };

  // Export theme
  const exportTheme = (theme: Theme) => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import theme
  const importTheme = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target?.result as string);
        theme.id = `imported-${Date.now()}`;
        saveCustomTheme(theme);
      } catch (error) {
        console.error('Failed to import theme:', sanitizeForLog(error instanceof Error ? error.message : String(error)));
      }
    };
    reader.readAsText(file);
  };

  const allThemes = [...defaultThemes, ...customThemes];

  return (
    <>
      {/* Theme Button */}
      <motion.button
        onClick={() => setShowCustomizer(true)}
        className="fixed top-4 right-28 z-40 bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Customize Theme"
      >
        <Palette size={16} />
      </motion.button>

      {/* Theme Customizer Modal */}
      <AnimatePresence>
        {showCustomizer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCustomizer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Palette size={20} />
                    Theme Customizer
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={createCustomTheme}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Create Custom
                    </button>
                    <button
                      onClick={() => setShowCustomizer(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {isEditing && editingTheme ? (
                  <ThemeEditor
                    theme={editingTheme}
                    onSave={saveCustomTheme}
                    onCancel={() => {
                      setIsEditing(false);
                      setEditingTheme(null);
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allThemes.map(theme => (
                      <motion.div
                        key={theme.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          currentTheme.id === theme.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => switchTheme(theme)}
                      >
                        {/* Theme Preview */}
                        <div className="mb-3 h-20 rounded overflow-hidden border">
                          <div
                            className="h-8 flex"
                            style={{ backgroundColor: theme.colors.background }}
                          >
                            <div
                              className="w-1/3 h-full"
                              style={{ backgroundColor: theme.colors.primary }}
                            />
                            <div
                              className="w-1/3 h-full"
                              style={{ backgroundColor: theme.colors.surface }}
                            />
                            <div
                              className="w-1/3 h-full"
                              style={{ backgroundColor: theme.colors.accent }}
                            />
                          </div>
                          <div
                            className="h-12 p-2"
                            style={{ backgroundColor: theme.colors.surface }}
                          >
                            <div
                              className="w-full h-2 rounded mb-1"
                              style={{ backgroundColor: theme.colors.text }}
                            />
                            <div
                              className="w-2/3 h-2 rounded"
                              style={{ backgroundColor: theme.colors.textSecondary }}
                            />
                          </div>
                        </div>

                        <h3 className="font-semibold mb-1">{theme.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{theme.description}</p>

                        {/* Theme Actions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {theme.mode === 'light' && <Sun size={14} />}
                            {theme.mode === 'dark' && <Moon size={14} />}
                            {theme.mode === 'auto' && <Monitor size={14} />}
                            <span className="text-xs capitalize">{theme.mode}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                exportTheme(theme);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600"
                              title="Export theme"
                            >
                              <Download size={12} />
                            </button>
                            {customThemes.includes(theme) && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTheme(theme);
                                    setIsEditing(true);
                                  }}
                                  className="p-1 text-gray-400 hover:text-green-600"
                                  title="Edit theme"
                                >
                                  <Paintbrush size={12} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCustomTheme(theme.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                  title="Delete theme"
                                >
                                  ×
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Import Theme */}
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center justify-center">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => e.target.files?.[0] && importTheme(e.target.files[0])}
                    className="hidden"
                    id="theme-import"
                  />
                  <label
                    htmlFor="theme-import"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    <Upload size={14} />
                    Import Theme
                  </label>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Theme Editor Component
const ThemeEditor: React.FC<{
  theme: Theme;
  onSave: (theme: Theme) => void;
  onCancel: () => void;
}> = ({ theme, onSave, onCancel }) => {
  const [editedTheme, setEditedTheme] = useState<Theme>({ ...theme });

  const updateColor = (key: keyof Theme['colors'], value: string) => {
    setEditedTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold mb-3">Theme Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={editedTheme.name}
                onChange={(e) => setEditedTheme(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={editedTheme.description}
                onChange={(e) => setEditedTheme(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="font-semibold mb-3">Preview</h3>
          <div className="border rounded-lg overflow-hidden h-32">
            <div
              className="h-12 p-3 flex items-center justify-between"
              style={{ backgroundColor: editedTheme.colors.surface }}
            >
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: editedTheme.colors.primary }}
              />
              <div
                className="text-sm font-medium"
                style={{ color: editedTheme.colors.text }}
              >
                Sample Text
              </div>
            </div>
            <div
              className="h-20 p-3"
              style={{ backgroundColor: editedTheme.colors.background }}
            >
              <div
                className="w-full h-3 rounded mb-2"
                style={{ backgroundColor: editedTheme.colors.accent }}
              />
              <div
                className="w-2/3 h-2 rounded"
                style={{ backgroundColor: editedTheme.colors.textSecondary }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-semibold mb-3">Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(editedTheme.colors).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateColor(key as keyof Theme['colors'], e.target.value)}
                  className="w-8 h-8 border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateColor(key as keyof Theme['colors'], e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="font-semibold mb-3">Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Border Radius</label>
            <input
              type="range"
              min="0"
              max="20"
              value={editedTheme.borderRadius}
              onChange={(e) => setEditedTheme(prev => ({ ...prev, borderRadius: Number(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{editedTheme.borderRadius}px</span>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Spacing</label>
            <input
              type="range"
              min="8"
              max="32"
              value={editedTheme.spacing}
              onChange={(e) => setEditedTheme(prev => ({ ...prev, spacing: Number(e.target.value) }))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{editedTheme.spacing}px</span>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editedTheme.shadows}
                onChange={(e) => setEditedTheme(prev => ({ ...prev, shadows: e.target.checked }))}
              />
              <span className="text-sm">Shadows</span>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editedTheme.animations}
                onChange={(e) => setEditedTheme(prev => ({ ...prev, animations: e.target.checked }))}
              />
              <span className="text-sm">Animations</span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(editedTheme)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Theme
        </button>
      </div>
    </div>
  );
};