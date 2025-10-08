
import React, { useState, useCallback } from 'react';
import { AppState } from '../types';
import { UndoIcon, RedoIcon, UploadIcon, RefreshIcon } from './icons';
import { GoogleGenAI } from "@google/genai";

// Fix: Per Gemini API guidelines, initialize with apiKey property
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

interface InputControlsProps {
    state: AppState;
    onStateChange: (updates: Partial<AppState>, recordHistory?: boolean) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

const ControlSection: React.FC<{ title: string, children: React.ReactNode, defaultOpen?: boolean }> = ({ title, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border-t border-gray-200 py-3">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider flex justify-between items-center">
                    {title}
                    <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </h3>
            </button>
            {isOpen && <div className="space-y-3 mt-3">{children}</div>}
        </div>
    );
};

const Label: React.FC<{ htmlFor?: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 block">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-sm ${props.className}`} />
);

const ColorPicker: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <div className="flex items-center space-x-2 border border-gray-300 p-1 rounded-md">
        <input type="color" {...props} className={`h-8 w-8 rounded cursor-pointer ${props.className}`} style={{border: 'none', padding: 0, background: 'none'}} />
        <span className="text-sm uppercase font-mono">{props.value}</span>
    </div>
);


export const InputControls: React.FC<InputControlsProps> = ({ state, onStateChange, undo, redo, canUndo, canRedo }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => onStateChange({ logoImage: img });
                img.src = event.target!.result as string;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => onStateChange({ backgroundImage: img, backgroundType: 'image' });
                img.src = event.target!.result as string;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const generateTextWithAI = useCallback(async () => {
        setIsGenerating(true);
        try {
            const prompt = `Generate a compelling headline, subheadline, and call-to-action text for an advertisement. The current headline is "${state.headline}". Provide a JSON response with keys "headline", "subheadline", and "ctaText". Be creative and concise.`;
            
            // Fix: Use ai.models.generateContent and 'gemini-2.5-flash' model
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                }
            });
    
            // Fix: Access text directly from response.text
            const text = response.text;
            const generated = JSON.parse(text);
            
            onStateChange({
                headline: generated.headline,
                subheadline: generated.subheadline,
                ctaText: generated.ctaText,
            });
    
        } catch (error) {
            console.error("Error generating text with AI:", error);
            alert("Failed to generate text. Please check your API key and console for details.");
        } finally {
            setIsGenerating(false);
        }
    }, [state.headline, onStateChange]);

    return (
        <div className="flex flex-col space-y-4 flex-grow">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Controls</h2>
                <div className="flex space-x-2">
                    <button onClick={undo} disabled={!canUndo} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><UndoIcon className="w-5 h-5" /></button>
                    <button onClick={redo} disabled={!canRedo} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"><RedoIcon className="w-5 h-5" /></button>
                </div>
            </div>

            <ControlSection title="Text & Content">
                <div>
                    <Label htmlFor="headline">Headline</Label>
                    <Input id="headline" value={state.headline} onChange={e => onStateChange({ headline: e.target.value })} />
                </div>
                <div>
                    <Label htmlFor="subheadline">Subheadline</Label>
                    <Input id="subheadline" value={state.subheadline} onChange={e => onStateChange({ subheadline: e.target.value })} />
                </div>
                <div>
                    <Label htmlFor="cta">CTA Text</Label>
                    <Input id="cta" value={state.ctaText} onChange={e => onStateChange({ ctaText: e.target.value })} />
                </div>
                 <button onClick={generateTextWithAI} disabled={isGenerating} className="w-full mt-2 p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center justify-center disabled:bg-purple-300">
                    <RefreshIcon className={`w-5 h-5 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
                </button>
            </ControlSection>

            <ControlSection title="Typography">
                <div>
                    <Label htmlFor="fontColor">Font Color</Label>
                    <ColorPicker id="fontColor" value={state.fontColor} onChange={e => onStateChange({ fontColor: e.target.value })} />
                </div>
            </ControlSection>

            <ControlSection title="CTA Button">
                <div>
                    <Label htmlFor="ctaBgColor">Background Color</Label>
                    <ColorPicker id="ctaBgColor" value={state.ctaBgColor} onChange={e => onStateChange({ ctaBgColor: e.target.value })} />
                </div>
                <div>
                    <Label htmlFor="ctaTextColor">Text Color</Label>
                    <ColorPicker id="ctaTextColor" value={state.ctaTextColor} onChange={e => onStateChange({ ctaTextColor: e.target.value })} />
                </div>
            </ControlSection>
            
            <ControlSection title="Logo">
                <label htmlFor="logo-upload" className="w-full p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center cursor-pointer">
                    <UploadIcon className="w-5 h-5 mr-2" />
                    {state.logoImage ? 'Change Logo' : 'Upload Logo'}
                </label>
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </ControlSection>

            <ControlSection title="Background">
                <div className="flex space-x-2">
                    <button onClick={() => onStateChange({ backgroundType: 'solid' })} className={`flex-1 p-2 rounded-md ${state.backgroundType === 'solid' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Solid</button>
                    <button onClick={() => onStateChange({ backgroundType: 'gradient' })} className={`flex-1 p-2 rounded-md ${state.backgroundType === 'gradient' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Gradient</button>
                    <button onClick={() => document.getElementById('bg-image-upload')?.click()} className={`flex-1 p-2 rounded-md ${state.backgroundType === 'image' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Image</button>
                    <input id="bg-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                {state.backgroundType === 'solid' && (
                     <div>
                        <Label htmlFor="bgColor">Color</Label>
                        <ColorPicker id="bgColor" value={state.backgroundColor} onChange={e => onStateChange({ backgroundColor: e.target.value })} />
                    </div>
                )}
                 {state.backgroundType === 'image' && state.backgroundImage && (
                     <div>
                        <Label htmlFor="bgScale">Image Scale: {Math.round(state.backgroundScale * 100)}%</Label>
                        <Input type="range" min="0.1" max="3" step="0.05" id="bgScale" value={state.backgroundScale} onChange={e => onStateChange({ backgroundScale: parseFloat(e.target.value) })} />
                    </div>
                )}
            </ControlSection>
        </div>
    );
};
