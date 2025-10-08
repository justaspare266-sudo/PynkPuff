import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' }
];

const translations: Translations = {
  en: {
    // Tools
    'tool.select': 'Select',
    'tool.text': 'Text',
    'tool.shape': 'Shape',
    'tool.image': 'Image',
    'tool.crop': 'Crop',
    'tool.pan': 'Pan',
    'tool.zoom': 'Zoom',
    
    // Actions
    'action.undo': 'Undo',
    'action.redo': 'Redo',
    'action.copy': 'Copy',
    'action.paste': 'Paste',
    'action.delete': 'Delete',
    'action.duplicate': 'Duplicate',
    'action.save': 'Save',
    'action.export': 'Export',
    'action.import': 'Import',
    
    // Properties
    'property.position': 'Position',
    'property.size': 'Size',
    'property.rotation': 'Rotation',
    'property.opacity': 'Opacity',
    'property.color': 'Color',
    'property.font': 'Font',
    'property.fontSize': 'Font Size',
    
    // Panels
    'panel.layers': 'Layers',
    'panel.properties': 'Properties',
    'panel.history': 'History',
    'panel.assets': 'Assets',
    
    // Messages
    'message.saved': 'Project saved successfully',
    'message.exported': 'Project exported successfully',
    'message.error': 'An error occurred',
    'message.loading': 'Loading...',
    
    // Common
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.apply': 'Apply',
    'common.reset': 'Reset'
  },
  es: {
    'tool.select': 'Seleccionar',
    'tool.text': 'Texto',
    'tool.shape': 'Forma',
    'tool.image': 'Imagen',
    'tool.crop': 'Recortar',
    'tool.pan': 'Mover',
    'tool.zoom': 'Zoom',
    
    'action.undo': 'Deshacer',
    'action.redo': 'Rehacer',
    'action.copy': 'Copiar',
    'action.paste': 'Pegar',
    'action.delete': 'Eliminar',
    'action.duplicate': 'Duplicar',
    'action.save': 'Guardar',
    'action.export': 'Exportar',
    'action.import': 'Importar',
    
    'property.position': 'Posición',
    'property.size': 'Tamaño',
    'property.rotation': 'Rotación',
    'property.opacity': 'Opacidad',
    'property.color': 'Color',
    'property.font': 'Fuente',
    'property.fontSize': 'Tamaño de fuente',
    
    'panel.layers': 'Capas',
    'panel.properties': 'Propiedades',
    'panel.history': 'Historial',
    'panel.assets': 'Recursos',
    
    'message.saved': 'Proyecto guardado exitosamente',
    'message.exported': 'Proyecto exportado exitosamente',
    'message.error': 'Ocurrió un error',
    'message.loading': 'Cargando...',
    
    'common.ok': 'Aceptar',
    'common.cancel': 'Cancelar',
    'common.close': 'Cerrar',
    'common.apply': 'Aplicar',
    'common.reset': 'Restablecer'
  },
  fr: {
    'tool.select': 'Sélectionner',
    'tool.text': 'Texte',
    'tool.shape': 'Forme',
    'tool.image': 'Image',
    'tool.crop': 'Recadrer',
    'tool.pan': 'Déplacer',
    'tool.zoom': 'Zoom',
    
    'action.undo': 'Annuler',
    'action.redo': 'Rétablir',
    'action.copy': 'Copier',
    'action.paste': 'Coller',
    'action.delete': 'Supprimer',
    'action.duplicate': 'Dupliquer',
    'action.save': 'Enregistrer',
    'action.export': 'Exporter',
    'action.import': 'Importer',
    
    'property.position': 'Position',
    'property.size': 'Taille',
    'property.rotation': 'Rotation',
    'property.opacity': 'Opacité',
    'property.color': 'Couleur',
    'property.font': 'Police',
    'property.fontSize': 'Taille de police',
    
    'panel.layers': 'Calques',
    'panel.properties': 'Propriétés',
    'panel.history': 'Historique',
    'panel.assets': 'Ressources',
    
    'message.saved': 'Projet enregistré avec succès',
    'message.exported': 'Projet exporté avec succès',
    'message.error': 'Une erreur s\'est produite',
    'message.loading': 'Chargement...',
    
    'common.ok': 'OK',
    'common.cancel': 'Annuler',
    'common.close': 'Fermer',
    'common.apply': 'Appliquer',
    'common.reset': 'Réinitialiser'
  }
  // Additional languages would be added here
};

interface LocalizationContextType {
  currentLanguage: string;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
}

const LocalizationContext = createContext<LocalizationContextType | null>(null);

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('editor-language');
    if (savedLanguage && languages.find(l => l.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (languages.find(l => l.code === browserLang)) {
        setCurrentLanguage(browserLang);
      }
    }
  }, []);

  const setLanguage = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('editor-language', code);
    
    // Update document direction for RTL languages
    const language = languages.find(l => l.code === code);
    document.documentElement.dir = language?.rtl ? 'rtl' : 'ltr';
  };

  const t = (key: string, fallback?: string): string => {
    const translation = translations[currentLanguage]?.[key] || translations.en[key] || fallback || key;
    return translation;
  };

  const isRTL = languages.find(l => l.code === currentLanguage)?.rtl || false;

  return (
    <LocalizationContext.Provider value={{ currentLanguage, setLanguage, t, isRTL }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
};

export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage } = useLocalization();
  const [showSelector, setShowSelector] = useState(false);

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  return (
    <>
      {/* Language Button */}
      <motion.button
        onClick={() => setShowSelector(true)}
        className="fixed top-4 right-16 z-40 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Globe size={16} />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
      </motion.button>

      {/* Language Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Globe size={18} />
                    Select Language
                  </h2>
                  <button
                    onClick={() => setShowSelector(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {languages.map(language => (
                  <motion.button
                    key={language.code}
                    onClick={() => {
                      setLanguage(language.code);
                      setShowSelector(false);
                    }}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      currentLanguage === language.code ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                    whileHover={{ backgroundColor: '#f9fafb' }}
                  >
                    <span className="text-2xl">{language.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{language.nativeName}</div>
                      <div className="text-sm text-gray-500">{language.name}</div>
                    </div>
                    {currentLanguage === language.code && (
                      <Check size={16} className="text-blue-500" />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="p-4 border-t bg-gray-50">
                <p className="text-xs text-gray-600 text-center">
                  Language preference is saved automatically
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Translation helper component
export const T: React.FC<{ k: string; fallback?: string }> = ({ k, fallback }) => {
  const { t } = useLocalization();
  return <>{t(k, fallback)}</>;
};