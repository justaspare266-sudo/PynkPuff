
import React, { useState } from 'react';
import { AppState, SelectedElement } from '../types';
import { UndoIcon, RedoIcon, UploadIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon } from './icons';

interface InputControlsProps {
    state: AppState;
    onStateChange: (updates: Partial<AppState>, recordHistory?: boolean) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    selectedElement: SelectedElement;
    onElementAlign: (align: 'left' | 'center' | 'right') => void;
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

const Label: React.FC<{ htmlFor?: string, children: React.ReactNode, value?: string }> = ({ htmlFor, children, value }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 block flex justify-between items-center">
        <span>{children}</span>
        {value && <span className="text-gray-500 font-mono">{value}</span>}
    </label>
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

const Checkbox: React.FC<{ id: string; label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ id, label, checked, onChange }) => (
    <div className="flex items-center">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-900">{label}</label>
    </div>
);

export const InputControls: React.FC<InputControlsProps> = ({ state, onStateChange, undo, redo, canUndo, canRedo, selectedElement, onElementAlign }) => {
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
            </ControlSection>

            {selectedElement && (
                <ControlSection title="Alignment" defaultOpen>
                    <div className="flex justify-around items-center p-1 bg-gray-100 rounded-md">
                        <button onClick={() => onElementAlign('left')} className="p-2 rounded hover:bg-gray-200 focus:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500" aria-label="Align left">
                            <AlignLeftIcon className="w-6 h-6 text-gray-700" />
                        </button>
                         <button onClick={() => onElementAlign('center')} className="p-2 rounded hover:bg-gray-200 focus:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500" aria-label="Align center">
                            <AlignCenterIcon className="w-6 h-6 text-gray-700" />
                        </button>
                         <button onClick={() => onElementAlign('right')} className="p-2 rounded hover:bg-gray-200 focus:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500" aria-label="Align right">
                            <AlignRightIcon className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>
                </ControlSection>
            )}

            <ControlSection title="Typography">
                <div>
                    <Label htmlFor="fontColor">Font Color</Label>
                    <ColorPicker id="fontColor" value={state.fontColor} onChange={e => onStateChange({ fontColor: e.target.value })} />
                </div>
                <div>
                    <Label htmlFor="textBgColor">Text Background</Label>
                    <ColorPicker id="textBgColor" value={state.textBgColor} onChange={e => onStateChange({ textBgColor: e.target.value })} />
                </div>
                <div>
                    <Label htmlFor="textBgOpacity" value={`${Math.round(state.textBgOpacity * 100)}%`}>Opacity</Label>
                    <Input type="range" min="0" max="1" step="0.01" id="textBgOpacity" value={state.textBgOpacity} onChange={e => onStateChange({ textBgOpacity: parseFloat(e.target.value) })} />
                </div>
                 <div>
                    <Label htmlFor="letterSpacing" value={`${state.letterSpacing}px`}>Letter Spacing</Label>
                    <Input type="range" min="-5" max="10" step="0.1" id="letterSpacing" value={state.letterSpacing} onChange={e => onStateChange({ letterSpacing: parseFloat(e.target.value) })} />
                </div>
                <div>
                    <Label htmlFor="lineHeight" value={state.lineHeight.toFixed(2)}>Line Height</Label>
                    <Input type="range" min="0.8" max="3" step="0.05" id="lineHeight" value={state.lineHeight} onChange={e => onStateChange({ lineHeight: parseFloat(e.target.value) })} />
                </div>
            </ControlSection>

            <ControlSection title="CTA Button">
                <div>
                    <Label htmlFor="ctaBgColor">Background Color</Label>
                    <ColorPicker id="ctaBgColor" value={state.ctaBgColor} onChange={e => onStateChange({ ctaBgColor: e.target.value })} />
                </div>
                <div>
                    <Label htmlFor="ctaBgOpacity" value={`${Math.round(state.ctaBgOpacity * 100)}%`}>Background Opacity</Label>
                    <Input type="range" min="0" max="1" step="0.01" id="ctaBgOpacity" value={state.ctaBgOpacity} onChange={e => onStateChange({ ctaBgOpacity: parseFloat(e.target.value) })} />
                </div>
                <div>
                    <Label htmlFor="ctaTextColor">Text Color</Label>
                    <ColorPicker id="ctaTextColor" value={state.ctaTextColor} onChange={e => onStateChange({ ctaTextColor: e.target.value })} />
                </div>
                <div className="space-y-2 border-t pt-2">
                    <Checkbox id="ctaStroke" label="Enable Stroke" checked={state.ctaStrokeEnabled} onChange={e => onStateChange({ ctaStrokeEnabled: e.target.checked })} />
                    {state.ctaStrokeEnabled && (
                        <>
                            <div>
                                <Label htmlFor="ctaStrokeWidth" value={`${state.ctaStrokeWidth}px`}>Stroke Width</Label>
                                <Input type="range" min="1" max="10" step="1" id="ctaStrokeWidth" value={state.ctaStrokeWidth} onChange={e => onStateChange({ ctaStrokeWidth: parseInt(e.target.value) })} />
                            </div>
                             <div>
                                <Label htmlFor="ctaStrokeColor">Stroke Color</Label>
                                <ColorPicker id="ctaStrokeColor" value={state.ctaStrokeColor} onChange={e => onStateChange({ ctaStrokeColor: e.target.value })} />
                            </div>
                        </>
                    )}
                </div>
                 <div className="space-y-2 border-t pt-2">
                    <Checkbox id="ctaUnderline" label="Enable Underline" checked={state.ctaUnderline} onChange={e => onStateChange({ ctaUnderline: e.target.checked })} />
                    {state.ctaUnderline && (
                        <>
                            <div>
                                <Label htmlFor="ctaUnderlineThickness" value={`${state.ctaUnderlineThickness}px`}>Underline Thickness</Label>
                                <Input type="range" min="1" max="10" step="1" id="ctaUnderlineThickness" value={state.ctaUnderlineThickness} onChange={e => onStateChange({ ctaUnderlineThickness: parseInt(e.target.value) })} />
                            </div>
                             <div>
                                <Label htmlFor="ctaUnderlineOffset" value={`${state.ctaUnderlineOffset}px`}>Underline Offset</Label>
                                <Input type="range" min="0" max="15" step="1" id="ctaUnderlineOffset" value={state.ctaUnderlineOffset} onChange={e => onStateChange({ ctaUnderlineOffset: parseInt(e.target.value) })} />
                            </div>
                        </>
                    )}
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