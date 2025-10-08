import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, RotateCcw, CheckCircle, ArrowRight, Lightbulb, Target, BookOpen } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'type' | 'drag' | 'wait';
  actionData?: any;
  validation?: () => boolean;
  hint?: string;
  duration?: number; // Auto-advance after duration (ms)
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'tools' | 'advanced' | 'workflow';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  steps: TutorialStep[];
  prerequisites?: string[];
  learningObjectives: string[];
}

interface InteractiveTutorialProps {
  onClose: () => void;
  onComplete: (tutorialId: string) => void;
}

const TUTORIALS: Tutorial[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with Master Image Editor',
    description: 'Learn the basics of navigating and using the editor interface',
    category: 'basics',
    difficulty: 'beginner',
    estimatedTime: 5,
    learningObjectives: [
      'Navigate the editor interface',
      'Understand the toolbar and panels',
      'Create your first project'
    ],
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Master Image Editor',
        description: 'This tutorial will guide you through the basics of using our professional image editor.',
        target: '.master-image-editor',
        position: 'center'
      },
      {
        id: 'toolbar',
        title: 'The Toolbar',
        description: 'The toolbar on the left contains all the tools you need for editing. Click on the selection tool.',
        target: '.toolbar',
        position: 'right',
        action: 'click',
        actionData: { selector: '[data-tool="select"]' }
      },
      {
        id: 'canvas',
        title: 'The Canvas',
        description: 'This is your workspace where you create and edit your designs. Try clicking on the canvas.',
        target: '.canvas-container',
        position: 'top',
        action: 'click'
      },
      {
        id: 'panels',
        title: 'Property Panels',
        description: 'The right side contains panels for layers, properties, and more. These update based on your selection.',
        target: '.panels-container',
        position: 'left'
      }
    ]
  },
  {
    id: 'text-tool',
    title: 'Working with Text',
    description: 'Master the text tool to create beautiful typography in your designs',
    category: 'tools',
    difficulty: 'beginner',
    estimatedTime: 8,
    learningObjectives: [
      'Add text to your design',
      'Format text properties',
      'Apply text effects'
    ],
    steps: [
      {
        id: 'select-text-tool',
        title: 'Select the Text Tool',
        description: 'Click on the text tool in the toolbar to start adding text to your design.',
        target: '[data-tool="text"]',
        position: 'right',
        action: 'click'
      },
      {
        id: 'add-text',
        title: 'Add Text',
        description: 'Click anywhere on the canvas to add a text element.',
        target: '.canvas-container',
        position: 'top',
        action: 'click',
        hint: 'Click anywhere on the canvas to create text'
      },
      {
        id: 'edit-text',
        title: 'Edit Text Content',
        description: 'Type your text content. Try typing "Hello World!"',
        target: '.text-editor',
        position: 'bottom',
        action: 'type',
        actionData: { text: 'Hello World!' }
      },
      {
        id: 'format-text',
        title: 'Format Text',
        description: 'Use the properties panel to change font, size, and color.',
        target: '.properties-panel',
        position: 'left'
      }
    ]
  },
  {
    id: 'layers-workflow',
    title: 'Managing Layers',
    description: 'Learn to organize your design with layers for better workflow',
    category: 'workflow',
    difficulty: 'intermediate',
    estimatedTime: 10,
    prerequisites: ['getting-started'],
    learningObjectives: [
      'Understand layer hierarchy',
      'Organize elements with layers',
      'Use layer effects and blending'
    ],
    steps: [
      {
        id: 'layers-panel',
        title: 'The Layers Panel',
        description: 'The layers panel shows all elements in your design. Each element is on its own layer.',
        target: '.layers-panel',
        position: 'left'
      },
      {
        id: 'create-shape',
        title: 'Create a Shape',
        description: 'Select the shape tool and create a rectangle on the canvas.',
        target: '[data-tool="shape"]',
        position: 'right',
        action: 'click'
      },
      {
        id: 'layer-order',
        title: 'Layer Order',
        description: 'Drag layers in the panel to change their stacking order.',
        target: '.layer-item',
        position: 'left',
        action: 'drag'
      },
      {
        id: 'layer-effects',
        title: 'Layer Effects',
        description: 'Right-click on a layer to access effects like shadows and borders.',
        target: '.layer-item',
        position: 'left',
        action: 'hover'
      }
    ]
  }
];

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  onClose,
  onComplete
}) => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (selectedTutorial) {
      setProgress((currentStep / selectedTutorial.steps.length) * 100);
    }
  }, [currentStep, selectedTutorial]);

  useEffect(() => {
    if (isPlaying && selectedTutorial) {
      const step = selectedTutorial.steps[currentStep];
      if (step?.duration) {
        const timer = setTimeout(() => {
          nextStep();
        }, step.duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isPlaying, currentStep, selectedTutorial]);

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(true);
    highlightElement(tutorial.steps[0]);
  };

  const nextStep = () => {
    if (!selectedTutorial) return;

    const currentStepData = selectedTutorial.steps[currentStep];
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));

    if (currentStep < selectedTutorial.steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      highlightElement(selectedTutorial.steps[nextStepIndex]);
    } else {
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      if (selectedTutorial) highlightElement(selectedTutorial.steps[prevStepIndex]);
    }
  };

  const completeTutorial = () => {
    if (selectedTutorial) {
      onComplete(selectedTutorial.id);
      removeHighlight();
      setSelectedTutorial(null);
      setIsPlaying(false);
    }
  };

  const highlightElement = (step: TutorialStep) => {
    // Remove existing highlights
    removeHighlight();

    // Add highlight to target element
    const element = document.querySelector(step.target);
    if (element) {
      element.classList.add('tutorial-highlight');
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add spotlight overlay
      createSpotlight(element as HTMLElement, step.position);
    }
  };

  const removeHighlight = () => {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
      el.classList.remove('tutorial-highlight');
    });
    
    const spotlight = document.querySelector('.tutorial-spotlight');
    if (spotlight) {
      spotlight.remove();
    }
  };

  const createSpotlight = (element: HTMLElement, position: TutorialStep['position']) => {
    const spotlight = document.createElement('div');
    spotlight.className = 'tutorial-spotlight';
    
    const rect = element.getBoundingClientRect();
    const padding = 8;
    
    spotlight.style.cssText = `
      position: fixed;
      top: ${rect.top - padding}px;
      left: ${rect.left - padding}px;
      width: ${rect.width + padding * 2}px;
      height: ${rect.height + padding * 2}px;
      border: 2px solid #3B82F6;
      border-radius: 8px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      pointer-events: none;
      z-index: 9999;
      animation: pulse 2s infinite;
    `;
    
    document.body.appendChild(spotlight);
  };

  const resetTutorial = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setIsPlaying(false);
    if (selectedTutorial) {
      highlightElement(selectedTutorial.steps[0]);
    }
  };

  const getCurrentStep = () => {
    return selectedTutorial?.steps[currentStep];
  };

  const getDifficultyColor = (difficulty: Tutorial['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: Tutorial['category']) => {
    switch (category) {
      case 'basics': return <BookOpen className="w-4 h-4" />;
      case 'tools': return <Target className="w-4 h-4" />;
      case 'advanced': return <Lightbulb className="w-4 h-4" />;
      case 'workflow': return <ArrowRight className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[80vh] max-w-6xl flex flex-col">
          {!selectedTutorial ? (
            // Tutorial Selection
            <>
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Play className="w-5 h-5 text-blue-600" />
                    Interactive Tutorials
                  </h2>
                  <p className="text-sm text-gray-500">Learn Master Image Editor with guided tutorials</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">×</button>
              </div>

              <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {TUTORIALS.map(tutorial => (
                    <div key={tutorial.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(tutorial.category)}
                          <h3 className="font-medium text-lg">{tutorial.title}</h3>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(tutorial.difficulty)}`}>
                          {tutorial.difficulty}
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{tutorial.description}</p>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>⏱️ {tutorial.estimatedTime} minutes</span>
                          <span>•</span>
                          <span>{tutorial.steps.length} steps</span>
                        </div>

                        {tutorial.prerequisites && (
                          <div className="text-sm text-gray-500">
                            <strong>Prerequisites:</strong> {tutorial.prerequisites.join(', ')}
                          </div>
                        )}

                        <div>
                          <strong className="text-sm text-gray-700">You'll learn:</strong>
                          <ul className="text-sm text-gray-600 mt-1 space-y-1">
                            {tutorial.learningObjectives.map((objective, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-500 mt-0.5">•</span>
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <button
                        onClick={() => startTutorial(tutorial)}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Start Tutorial
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Tutorial Player
            <>
              <div className="flex items-center justify-between p-4 border-b">
                <div>
                  <h2 className="text-lg font-semibold">{selectedTutorial.title}</h2>
                  <p className="text-sm text-gray-500">
                    Step {currentStep + 1} of {selectedTutorial.steps.length}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={resetTutorial}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTutorial(null);
                      removeHighlight();
                    }}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-4 py-2 border-b">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Current Step */}
              <div className="flex-1 p-6">
                {getCurrentStep() && (
                  <div className="max-w-2xl">
                    <h3 className="text-xl font-semibold mb-3">{getCurrentStep()!.title}</h3>
                    <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                      {getCurrentStep()!.description}
                    </p>

                    {getCurrentStep()!.hint && showHint && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Hint</h4>
                            <p className="text-yellow-700 text-sm">{getCurrentStep()!.hint}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={previousStep}
                        disabled={currentStep === 0}
                        className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      <button
                        onClick={nextStep}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                      >
                        {currentStep === selectedTutorial.steps.length - 1 ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </>
                        ) : (
                          <>
                            Next
                            <SkipForward className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {getCurrentStep()!.hint && (
                        <button
                          onClick={() => setShowHint(!showHint)}
                          className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded hover:bg-yellow-50"
                        >
                          {showHint ? 'Hide Hint' : 'Show Hint'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Step Navigation */}
              <div className="border-t p-4">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {selectedTutorial.steps.map((step, index) => (
                    <button
                      key={step.id}
                      onClick={() => {
                        setCurrentStep(index);
                        highlightElement(step);
                      }}
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        index === currentStep
                          ? 'bg-blue-500 text-white'
                          : completedSteps.has(step.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {completedSteps.has(step.id) ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tutorial Styles */}
      <style>{`
        .tutorial-highlight {
          position: relative;
          z-index: 10000;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .tutorial-spotlight {
          animation: pulse 2s infinite;
        }
      `}</style>
    </>
  );
};