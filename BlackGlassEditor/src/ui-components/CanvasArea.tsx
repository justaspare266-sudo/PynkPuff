import { ImageEditorContextMenu } from "./ContextMenu";
import { Theme } from "./ThemeSwitcher";

interface CanvasAreaProps {
  currentTheme: Theme;
}

export function CanvasArea({ currentTheme }: CanvasAreaProps) {
  const getBackgroundClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-gray-100";
      case "pink":
        return "bg-gradient-to-br from-pink-100 to-rose-200";
      case "gold":
        return "bg-gradient-to-br from-amber-100 to-yellow-200";
      default:
        return "bg-gray-900";
    }
  };

  const getInfoClasses = () => {
    switch (currentTheme) {
      case "light":
        return "bg-white/80 backdrop-blur-md text-gray-900";
      case "pink":
        return "bg-pink-50/80 backdrop-blur-md text-pink-900";
      case "gold":
        return "bg-amber-50/80 backdrop-blur-md text-amber-900";
      default:
        return "bg-black/60 backdrop-blur-md text-white/80";
    }
  };

  return (
    <div className={`flex-1 relative overflow-hidden ${getBackgroundClasses()}`}>
      {/* Canvas Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #374151 25%, transparent 25%), 
            linear-gradient(-45deg, #374151 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #374151 75%), 
            linear-gradient(-45deg, transparent 75%, #374151 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      />
      
      {/* Main Canvas */}
      <ImageEditorContextMenu>
        <div className="absolute inset-4 bg-white rounded-lg shadow-2xl flex items-center justify-center cursor-crosshair">
          <div className="text-gray-400 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p>Click to start editing or drag an image here</p>
            <p className="text-sm mt-2">Right-click for options</p>
          </div>
        </div>
      </ImageEditorContextMenu>

      {/* Canvas Info */}
      <div className={`absolute bottom-4 left-4 rounded-lg px-3 py-2 text-sm ${getInfoClasses()}`}>
        Canvas: 1920 × 1080px | 72 DPI
      </div>

      {/* Zoom Info */}
      <div className={`absolute bottom-4 right-4 rounded-lg px-3 py-2 text-sm ${getInfoClasses()}`}>
        100% | RGB
      </div>
    </div>
  );
}