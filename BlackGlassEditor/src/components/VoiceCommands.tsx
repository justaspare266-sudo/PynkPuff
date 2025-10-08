import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Play, Square, HelpCircle } from 'lucide-react';
import { sanitizeHtml, sanitizeForLog } from '../utils/security';

interface VoiceCommand {
  phrase: string;
  action: string;
  description: string;
  category: 'navigation' | 'editing' | 'tools' | 'view' | 'file';
  parameters?: string[];
}

interface VoiceCommandsProps {
  onCommand: (action: string, parameters?: any) => void;
  onStatusChange: (status: 'idle' | 'listening' | 'processing' | 'error') => void;
}

const VOICE_COMMANDS: VoiceCommand[] = [
  // Navigation
  { phrase: 'zoom in', action: 'zoom.in', description: 'Zoom into the canvas', category: 'navigation' },
  { phrase: 'zoom out', action: 'zoom.out', description: 'Zoom out of the canvas', category: 'navigation' },
  { phrase: 'zoom to fit', action: 'zoom.fit', description: 'Fit canvas to window', category: 'navigation' },
  { phrase: 'center canvas', action: 'canvas.center', description: 'Center the canvas view', category: 'navigation' },
  
  // Tools
  { phrase: 'select tool', action: 'tool.select', description: 'Switch to selection tool', category: 'tools' },
  { phrase: 'text tool', action: 'tool.text', description: 'Switch to text tool', category: 'tools' },
  { phrase: 'shape tool', action: 'tool.shape', description: 'Switch to shape tool', category: 'tools' },
  { phrase: 'draw tool', action: 'tool.draw', description: 'Switch to drawing tool', category: 'tools' },
  { phrase: 'pan tool', action: 'tool.pan', description: 'Switch to pan tool', category: 'tools' },
  
  // Editing
  { phrase: 'undo', action: 'edit.undo', description: 'Undo last action', category: 'editing' },
  { phrase: 'redo', action: 'edit.redo', description: 'Redo last undone action', category: 'editing' },
  { phrase: 'copy', action: 'edit.copy', description: 'Copy selected objects', category: 'editing' },
  { phrase: 'paste', action: 'edit.paste', description: 'Paste copied objects', category: 'editing' },
  { phrase: 'delete', action: 'edit.delete', description: 'Delete selected objects', category: 'editing' },
  { phrase: 'select all', action: 'edit.selectAll', description: 'Select all objects', category: 'editing' },
  { phrase: 'duplicate', action: 'edit.duplicate', description: 'Duplicate selected objects', category: 'editing' },
  
  // View
  { phrase: 'show grid', action: 'view.grid.show', description: 'Show grid lines', category: 'view' },
  { phrase: 'hide grid', action: 'view.grid.hide', description: 'Hide grid lines', category: 'view' },
  { phrase: 'show rulers', action: 'view.rulers.show', description: 'Show rulers', category: 'view' },
  { phrase: 'hide rulers', action: 'view.rulers.hide', description: 'Hide rulers', category: 'view' },
  { phrase: 'fullscreen', action: 'view.fullscreen', description: 'Enter fullscreen mode', category: 'view' },
  
  // File
  { phrase: 'new project', action: 'file.new', description: 'Create new project', category: 'file' },
  { phrase: 'save project', action: 'file.save', description: 'Save current project', category: 'file' },
  { phrase: 'export image', action: 'file.export', description: 'Export as image', category: 'file' },
  
  // Parameterized commands
  { phrase: 'add text *', action: 'text.add', description: 'Add text with content', category: 'editing', parameters: ['text'] },
  { phrase: 'set color *', action: 'style.color', description: 'Set color (red, blue, etc.)', category: 'editing', parameters: ['color'] },
  { phrase: 'rotate * degrees', action: 'transform.rotate', description: 'Rotate by degrees', category: 'editing', parameters: ['degrees'] }
];

export const VoiceCommands: React.FC<VoiceCommandsProps> = ({ onCommand, onStatusChange }) => {
  const [isListening, setIsListening] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [lastCommand, setLastCommand] = useState<string>('');
  const [confidence, setConfidence] = useState(0);
  const [showCommands, setShowCommands] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    maxAlternatives: 3,
    sensitivity: 0.7,
    timeout: 5000
  });
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = voiceSettings.continuous;
    recognition.interimResults = voiceSettings.interimResults;
    recognition.maxAlternatives = voiceSettings.maxAlternatives;
    recognition.lang = voiceSettings.language;

    recognition.onstart = () => {
      setStatus('listening');
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.toLowerCase().trim();
        const confidence = lastResult[0].confidence;
        
        setLastCommand(transcript);
        setConfidence(confidence);
        
        if (confidence >= voiceSettings.sensitivity) {
          processVoiceCommand(transcript);
        } else {
          speak('Command not recognized clearly. Please try again.');
          setStatus('error');
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', sanitizeForLog(event.error));
      setStatus('error');
      setIsListening(false);
      
      if (event.error === 'no-speech') {
        speak('No speech detected. Please try again.');
      } else if (event.error === 'network') {
        speak('Network error. Please check your connection.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (status === 'listening') {
        setStatus('idle');
      }
    };

    recognitionRef.current = recognition;
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [voiceSettings, status]);

  // Update parent component with status changes
  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  const processVoiceCommand = (transcript: string) => {
    setStatus('processing');
    
    // Find matching command
    const matchedCommand = VOICE_COMMANDS.find(cmd => {
      if (cmd.parameters) {
        // Handle parameterized commands (with wildcards)
        const pattern = cmd.phrase.replace(/\*/g, '(.+)');
        const regex = new RegExp(`^${pattern}$`, 'i');
        return regex.test(transcript);
      } else {
        // Exact match for simple commands
        return transcript === cmd.phrase;
      }
    });

    if (matchedCommand) {
      let parameters: any = {};
      
      if (matchedCommand.parameters) {
        // Extract parameters from transcript
        const pattern = matchedCommand.phrase.replace(/\*/g, '(.+)');
        const regex = new RegExp(`^${pattern}$`, 'i');
        const matches = transcript.match(regex);
        
        if (matches && matches.length > 1) {
          matchedCommand.parameters.forEach((param, index) => {
            parameters[param] = matches[index + 1].trim();
          });
        }
      }

      // Execute command
      onCommand(matchedCommand.action, parameters);
      speak(`Executing ${matchedCommand.description}`);
      setStatus('idle');
      
    } else {
      // Try fuzzy matching
      const fuzzyMatch = findFuzzyMatch(transcript);
      if (fuzzyMatch) {
        speak(`Did you mean "${fuzzyMatch.phrase}"? Say "yes" to confirm.`);
        // TODO: Implement confirmation flow
      } else {
        speak('Command not recognized. Say "help" to see available commands.');
        setStatus('error');
      }
    }

    // Auto-stop listening after processing
    setTimeout(() => {
      if (isListening) {
        stopListening();
      }
    }, 1000);
  };

  const findFuzzyMatch = (transcript: string): VoiceCommand | null => {
    let bestMatch: VoiceCommand | null = null;
    let bestScore = 0;

    VOICE_COMMANDS.forEach(cmd => {
      const score = calculateSimilarity(transcript, cmd.phrase);
      if (score > bestScore && score > 0.6) {
        bestScore = score;
        bestMatch = cmd;
      }
    });

    return bestMatch;
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.toLowerCase().split(' ');
    const words2 = str2.toLowerCase().split(' ');
    
    let matches = 0;
    words1.forEach(word => {
      if (words2.includes(word)) {
        matches++;
      }
    });

    return matches / Math.max(words1.length, words2.length);
  };

  const speak = (text: string) => {
    if (synthRef.current && isEnabled) {
      synthRef.current.cancel(); // Stop any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        
        // Set timeout for listening
        timeoutRef.current = setTimeout(() => {
          stopListening();
          speak('Listening timeout. Please try again.');
        }, voiceSettings.timeout);
        
      } catch (error) {
        console.error('Failed to start speech recognition:', sanitizeForLog(error instanceof Error ? error.message : String(error)));
        setStatus('error');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      clearTimeout(timeoutRef.current);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleEnabled = () => {
    setIsEnabled(!isEnabled);
    if (isListening) {
      stopListening();
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCommandsByCategory = () => {
    const categories = VOICE_COMMANDS.reduce((acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    }, {} as Record<string, VoiceCommand[]>);

    return categories;
  };

  return (
    <>
      {/* Voice Control Panel */}
      <div className="fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleEnabled}
            className={`p-2 rounded ${isEnabled ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            title={isEnabled ? 'Disable Voice Commands' : 'Enable Voice Commands'}
          >
            {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleListening}
            disabled={!isEnabled}
            className={`p-2 rounded transition-colors ${
              isListening 
                ? 'bg-red-500 text-white animate-pulse' 
                : isEnabled 
                  ? 'bg-green-500 text-white hover:bg-green-600' 
                  : 'bg-gray-100 text-gray-400'
            }`}
            title={isListening ? 'Stop Listening' : 'Start Listening'}
          >
            {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <div className="flex flex-col">
            <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            {lastCommand && (
              <div className="text-xs text-gray-500 mt-1 max-w-32 truncate">
                "{sanitizeHtml(lastCommand)}" ({Math.round(confidence * 100)}%)
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCommands(true)}
            className="p-2 hover:bg-gray-100 rounded"
            title="Voice Commands Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Voice Commands Help Dialog */}
      {showCommands && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-4xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Voice Commands
                </h2>
                <p className="text-sm text-gray-500">Available voice commands for hands-free editing</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCommands(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Commands List */}
              <div className="flex-1 p-4 overflow-y-auto">
                {Object.entries(getCommandsByCategory()).map(([category, commands]) => (
                  <div key={category} className="mb-6">
                    <h3 className="font-medium text-lg mb-3 capitalize text-gray-800">
                      {category}
                    </h3>
                    <div className="grid gap-2">
                      {commands.map((cmd, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <code className="text-sm font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                "{sanitizeHtml(cmd.phrase)}"
                              </code>
                              <p className="text-sm text-gray-600 mt-1">{sanitizeHtml(cmd.description)}</p>
                            </div>
                            <button
                              onClick={() => {
                                processVoiceCommand(cmd.phrase.replace(/\*/g, 'example'));
                              }}
                              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                            >
                              <Play className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Settings Panel */}
              <div className="w-80 border-l p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Voice Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select
                      value={voiceSettings.language}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="fr-FR">French</option>
                      <option value="de-DE">German</option>
                      <option value="it-IT">Italian</option>
                      <option value="pt-BR">Portuguese</option>
                      <option value="ja-JP">Japanese</option>
                      <option value="ko-KR">Korean</option>
                      <option value="zh-CN">Chinese</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sensitivity: {Math.round(voiceSettings.sensitivity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.3"
                      max="1"
                      step="0.1"
                      value={voiceSettings.sensitivity}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, sensitivity: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Timeout: {voiceSettings.timeout / 1000}s
                    </label>
                    <input
                      type="range"
                      min="3000"
                      max="10000"
                      step="1000"
                      value={voiceSettings.timeout}
                      onChange={(e) => setVoiceSettings(prev => ({ ...prev, timeout: Number(e.target.value) }))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={voiceSettings.continuous}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, continuous: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Continuous listening</span>
                    </label>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={voiceSettings.interimResults}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, interimResults: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm">Show interim results</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Quick Test</h4>
                    <button
                      onClick={() => speak('Voice commands are working correctly')}
                      className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Test Speech Output
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {status === 'listening' && 'Voice recognition is listening'}
        {status === 'processing' && 'Processing voice command'}
        {status === 'error' && 'Voice command error occurred'}
      </div>
    </>
  );
};