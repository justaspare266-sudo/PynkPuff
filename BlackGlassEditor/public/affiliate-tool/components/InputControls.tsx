import React, { useState } from 'react';
// Fix: Add .ts extension to resolve module path.
import { AppState, ElementName, LayoutTemplate, TextStyle } from '../types.ts';
import { 
    UndoIcon, RedoIcon, UploadIcon, DownloadIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, 
    AlignTopIcon, AlignMiddleIcon, AlignBottomIcon, DistributeVerticalIcon, SaveIcon, TrashIcon,
    UppercaseIcon, LowercaseIcon, CapitalizeIcon, BoldIcon, ItalicIcon, UnderlineIcon
// Fix: Add .tsx extension to resolve module path.
} from './icons.tsx';

interface InputControlsProps {
    state: AppState;
    onStateChange: (updates: Partial<AppState>, recordHistory?: boolean) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onGlobalElementAlign: (elementName: ElementName, align: { h?: 'left' | 'center' | 'right'; v?: 'top' | 'middle' | 'bottom' }) => void;
    onTidyUp: () => void;
    onFontUpload: (fontFamily: string) => void;
    savedTemplates: LayoutTemplate[];
    onSaveLayout: (name: string) => void;
    onApplyLayout: (name: string) => void;
    onDeleteLayout: (name: string) => void;
    onUploadLayout: (template: LayoutTemplate) => void;
    onArtboardCompleteToggle: (artboardId: string, isComplete: boolean) => void;
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
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700 block">
        <span>{children}</span>
    </label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-sm ${props.className}`} />
);

const NumberInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <div className="flex items-center">
        <input 
            type="number"
            {...props} 
            className={`w-full p-1 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-sm ${props.className}`} 
        />
    </div>
);

const ColorPicker: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <div className="flex items-center space-x-2 border border-gray-300 p-1 rounded-md">
        <input type="color" {...props} className={`h-6 w-6 rounded cursor-pointer ${props.className}`} style={{border: 'none', padding: 0, background: 'none'}} />
        <span className="text-xs uppercase font-mono">{props.value}</span>
    </div>
);

const Checkbox: React.FC<{ id: string; label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ id, label, checked, onChange }) => (
    <div className="flex items-center">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500" />
        <label htmlFor={id} className="ml-2 block text-sm text-gray-900">{label}</label>
    </div>
);

const ToggleButton: React.FC<{ onClick: () => void, active: boolean, children: React.ReactNode, label: string }> = ({ onClick, active, children, label }) => (
    <button 
        onClick={onClick} 
        aria-label={label}
        className={`p-2 rounded transition-colors ${active ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
    >
        {children}
    </button>
);

const TextElementControls: React.FC<{
    elementName: 'headline' | 'subheadline' | 'cta',
    state: AppState,
    onStateChange: (updates: Partial<AppState>, recordHistory?: boolean) => void,
    onGlobalElementAlign: (elementName: ElementName, align: { h?: 'left' | 'center' | 'right'; v?: 'top' | 'middle' | 'bottom' }) => void;
    onFontUpload: (fontFamily: string) => void;
}> = ({ elementName, state, onStateChange, onGlobalElementAlign, onFontUpload }) => {

    const textValue = state[elementName === 'cta' ? 'ctaText' : elementName];
    const styleKey = `${elementName}Style` as const;
    const styleValue = state[styleKey];

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onStateChange({ [elementName === 'cta' ? 'ctaText' : elementName]: e.target.value });
    };

    const handleStyleChange = (updates: Partial<TextStyle>) => {
        onStateChange({ [styleKey]: { ...styleValue, ...updates } });
    };
    
    const handleFontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const fontDataUrl = reader.result as string;
            const fontFamilyName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '-');

            let styleEl = document.getElementById('custom-font-style');
            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'custom-font-style';
                document.head.appendChild(styleEl);
            }
            const fontFaceRule = `@font-face { font-family: '${fontFamilyName}'; src: url(${fontDataUrl}); }`;
            styleEl.innerHTML = fontFaceRule;
            onFontUpload(fontFamilyName);
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const elementButtonClass = "p-2 rounded hover:bg-gray-200 focus:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors";
    
    return (
        <div className="space-y-3">
            <div>
                <Label htmlFor={elementName}>{elementName === 'cta' ? 'CTA Text' : elementName}</Label>
                <Input id={elementName} value={textValue} onChange={handleTextChange} />
            </div>

            <div className="grid grid-cols-3 gap-2">
                <div className="p-1 bg-gray-100 rounded-md flex justify-around">
                     <ToggleButton onClick={() => handleStyleChange({ textTransform: styleValue.textTransform === 'uppercase' ? 'none' : 'uppercase' })} active={styleValue.textTransform === 'uppercase'} label="Uppercase"><UppercaseIcon className="w-5 h-5" /></ToggleButton>
                     <ToggleButton onClick={() => handleStyleChange({ textTransform: styleValue.textTransform === 'lowercase' ? 'none' : 'lowercase' })} active={styleValue.textTransform === 'lowercase'} label="Lowercase"><LowercaseIcon className="w-5 h-5" /></ToggleButton>
                     <ToggleButton onClick={() => handleStyleChange({ textTransform: styleValue.textTransform === 'capitalize' ? 'none' : 'capitalize' })} active={styleValue.textTransform === 'capitalize'} label="Capitalize"><CapitalizeIcon className="w-5 h-5" /></ToggleButton>
                </div>
                 <div className="p-1 bg-gray-100 rounded-md flex justify-around col-span-2">
                     <ToggleButton onClick={() => handleStyleChange({ fontWeight: styleValue.fontWeight === 700 ? 400 : 700 })} active={styleValue.fontWeight === 700} label="Bold"><BoldIcon className="w-5 h-5" /></ToggleButton>
                     <ToggleButton onClick={() => handleStyleChange({ fontStyle: styleValue.fontStyle === 'italic' ? 'normal' : 'italic' })} active={styleValue.fontStyle === 'italic'} label="Italic"><ItalicIcon className="w-5 h-5" /></ToggleButton>
                     <ToggleButton onClick={() => handleStyleChange({ textDecoration: styleValue.textDecoration === 'underline' ? 'none' : 'underline' })} active={styleValue.textDecoration === 'underline'} label="Underline"><UnderlineIcon className="w-5 h-5" /></ToggleButton>
                </div>
            </div>
            
            <div>
                <Label>Text Overflow</Label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-md">
                    <button 
                        onClick={() => handleStyleChange({ overflowBehavior: 'wrap' })} 
                        className={`px-2 py-1 text-sm rounded-md transition-colors ${(!styleValue.overflowBehavior || styleValue.overflowBehavior === 'wrap') ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-200'}`}
                    >
                        Wrap
                    </button>
                    <button 
                        onClick={() => handleStyleChange({ overflowBehavior: 'ellipsis' })} 
                        className={`px-2 py-1 text-sm rounded-md transition-colors ${styleValue.overflowBehavior === 'ellipsis' ? 'bg-purple-600 text-white' : 'bg-white hover:bg-gray-200'}`}
                    >
                        Ellipsis
                    </button>
                </div>
            </div>

             <div className="flex justify-around items-center p-1 bg-gray-100 rounded-md space-x-1">
                <button onClick={() => onGlobalElementAlign(elementName, { h: 'left' })} className={elementButtonClass}><AlignLeftIcon className="w-5 h-5 text-gray-700" /></button>
                <button onClick={() => onGlobalElementAlign(elementName, { h: 'center' })} className={elementButtonClass}><AlignCenterIcon className="w-5 h-5 text-gray-700" /></button>
                <button onClick={() => onGlobalElementAlign(elementName, { h: 'right' })} className={elementButtonClass}><AlignRightIcon className="w-5 h-5 text-gray-700" /></button>
                <div className="border-l h-5 border-gray-300 mx-1"></div>
                <button onClick={() => onGlobalElementAlign(elementName, { v: 'top' })} className={elementButtonClass}><AlignTopIcon className="w-5 h-5 text-gray-700" /></button>
                <button onClick={() => onGlobalElementAlign(elementName, { v: 'middle' })} className={elementButtonClass}><AlignMiddleIcon className="w-5 h-5 text-gray-700" /></button>
                <button onClick={() => onGlobalElementAlign(elementName, { v: 'bottom' })} className={elementButtonClass}><AlignBottomIcon className="w-5 h-5 text-gray-700" /></button>
            </div>
            
            <div className="p-2 border rounded-md space-y-3">
                 <div className="flex items-center space-x-2">
                    <span className="p-2 border border-gray-300 rounded-md bg-gray-50 text-xs w-full truncate" title={styleValue.fontFamily}>{styleValue.fontFamily}</span>
                    <label htmlFor={`${elementName}-font-upload`} className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer shrink-0"><UploadIcon className="w-4 h-4" /></label>
                    <input id={`${elementName}-font-upload`} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={handleFontFileChange} />
                </div>
                <div className="flex items-center justify-between space-x-2">
                    <ColorPicker value={styleValue.fontColor} onChange={e => handleStyleChange({ fontColor: e.target.value })} />
                    <ColorPicker value={styleValue.textBgColor} onChange={e => handleStyleChange({ textBgColor: e.target.value })} />
                </div>
                 <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                        <Label htmlFor={`${elementName}-letterSpacing`}>Spacing</Label>
                        <NumberInput id={`${elementName}-letterSpacing`} step={0.1} value={styleValue.letterSpacing} onChange={e => handleStyleChange({ letterSpacing: parseFloat(e.target.value) })} />
                    </div>
                     <div>
                        <Label htmlFor={`${elementName}-lineHeight`}>Height</Label>
                        <NumberInput id={`${elementName}-lineHeight`} step={0.05} value={styleValue.lineHeight} onChange={e => handleStyleChange({ lineHeight: parseFloat(e.target.value) })} />
                    </div>
                     <div>
                        <Label htmlFor={`${elementName}-textBgOpacity`}>Opacity</Label>
                        <NumberInput id={`${elementName}-textBgOpacity`} step={0.01} min={0} max={1} value={styleValue.textBgOpacity} onChange={e => handleStyleChange({ textBgOpacity: parseFloat(e.target.value) })} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const InputControls: React.FC<InputControlsProps> = ({ 
    state, onStateChange, undo, redo, canUndo, canRedo, onGlobalElementAlign, onTidyUp, onFontUpload,
    savedTemplates, onSaveLayout, onApplyLayout, onDeleteLayout, onUploadLayout, onArtboardCompleteToggle
}) => {
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    onStateChange({ logoImage: img, logoAspectRatio: aspectRatio });
                }
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

    const handleSaveLayoutClick = () => {
        const name = prompt("Enter a name for this layout template:");
        if (name) {
            onSaveLayout(name);
        }
    };

    const handleDownloadTemplate = (template: LayoutTemplate) => {
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${template.name.replace(/ /g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    const handleUploadTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const template = JSON.parse(event.target?.result as string) as LayoutTemplate;
                if (template.name && Array.isArray(template.configs)) {
                    onUploadLayout(template);
                } else {
                    alert("Invalid template file format.");
                }
            } catch (error) {
                alert("Error parsing template file.");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
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

            <ControlSection title="Artboards" defaultOpen>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                    {state.artboardConfigs.map(config => (
                        <div key={config.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border text-sm">
                            <span className="font-mono">{config.width}x{config.height}</span>
                            <div className="flex items-center">
                                <label htmlFor={`complete-${config.id}`} className="mr-2 text-xs text-gray-500">Done</label>
                                <input 
                                    type="checkbox" 
                                    id={`complete-${config.id}`}
                                    checked={config.isComplete}
                                    onChange={e => onArtboardCompleteToggle(config.id, e.target.checked)}
                                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </ControlSection>

            <ControlSection title="Layout Templates" defaultOpen>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={handleSaveLayoutClick} className="w-full flex items-center justify-center p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"><SaveIcon className="w-4 h-4 mr-2" />Save</button>
                    <label htmlFor="upload-layout" className="w-full flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer"><UploadIcon className="w-4 h-4 mr-2" />Upload</label>
                    <input id="upload-layout" type="file" accept=".json" className="hidden" onChange={handleUploadTemplate} />
                </div>
                {savedTemplates.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-semibold text-gray-500">Saved Templates</h4>
                        <ul className="max-h-40 overflow-y-auto space-y-2 pr-2">
                            {savedTemplates.map(template => (
                                <li key={template.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border">
                                    <span className="text-sm font-medium truncate" title={template.name}>{template.name}</span>
                                    <div className="flex items-center space-x-1 shrink-0">
                                        <button onClick={() => handleDownloadTemplate(template)} className="p-1 text-gray-400 hover:text-blue-600" aria-label={`Download ${template.name}`}><DownloadIcon className="w-4 h-4" /></button>
                                        <button onClick={() => onApplyLayout(template.name)} className="text-sm text-purple-600 hover:underline">Apply</button>
                                        <button onClick={() => { if (confirm(`Delete "${template.name}"?`)) onDeleteLayout(template.name) }} className="p-1 text-gray-400 hover:text-red-600" aria-label={`Delete ${template.name}`}><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </ControlSection>
            
             <div className="border-t pt-3 flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-lg">
                <label htmlFor="align-as-group" className="text-sm font-semibold text-purple-800">Align as Group</label>
                <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="align-as-group" className="sr-only peer" checked={state.alignAsGroup} onChange={e => onStateChange({ alignAsGroup: e.target.checked })} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </div>
            </div>
             <button onClick={onTidyUp} className="w-full flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"><DistributeVerticalIcon className="w-5 h-5 mr-2" />Tidy Up Vertically</button>

            <ControlSection title="Headline" defaultOpen={false}>
                <TextElementControls elementName="headline" state={state} onStateChange={onStateChange} onGlobalElementAlign={onGlobalElementAlign} onFontUpload={onFontUpload} />
            </ControlSection>

            <ControlSection title="Subheadline" defaultOpen={false}>
                 <TextElementControls elementName="subheadline" state={state} onStateChange={onStateChange} onGlobalElementAlign={onGlobalElementAlign} onFontUpload={onFontUpload} />
            </ControlSection>

            <ControlSection title="CTA Button" defaultOpen={false}>
                 <TextElementControls elementName="cta" state={state} onStateChange={onStateChange} onGlobalElementAlign={onGlobalElementAlign} onFontUpload={onFontUpload} />
                 <div className="space-y-2 border-t pt-3 mt-3">
                    <Checkbox id="ctaStroke" label="Enable Stroke" checked={state.ctaStrokeEnabled} onChange={e => onStateChange({ ctaStrokeEnabled: e.target.checked })} />
                    {state.ctaStrokeEnabled && (
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label>Width</Label>
                                <NumberInput value={state.ctaStrokeWidth} onChange={e => onStateChange({ ctaStrokeWidth: parseInt(e.target.value) })} />
                            </div>
                            <div>
                                <Label>Color</Label>
                                <ColorPicker value={state.ctaStrokeColor} onChange={e => onStateChange({ ctaStrokeColor: e.target.value })} />
                            </div>
                        </div>
                    )}
                </div>
                 <div className="space-y-2 border-t pt-3 mt-3">
                     <p className="text-sm font-medium text-gray-700">Underline Settings</p>
                     <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Thickness</Label>
                            <NumberInput value={state.ctaUnderlineThickness} onChange={e => onStateChange({ ctaUnderlineThickness: parseInt(e.target.value) })} />
                        </div>
                        <div>
                            <Label>Offset</Label>
                            <NumberInput value={state.ctaUnderlineOffset} onChange={e => onStateChange({ ctaUnderlineOffset: parseInt(e.target.value) })} />
                        </div>
                    </div>
                </div>
            </ControlSection>
            
            <ControlSection title="Logo" defaultOpen={false}>
                <label htmlFor="logo-upload" className="w-full p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center justify-center cursor-pointer"><UploadIcon className="w-5 h-5 mr-2" />{state.logoImage ? 'Change Logo' : 'Upload Logo'}</label>
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                 <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
                    <p className="text-sm font-semibold capitalize mb-2 text-gray-800">Logo Alignment</p>
                    <div className="flex justify-around items-center p-1 bg-gray-100 rounded-md space-x-1">
                        <button onClick={() => onGlobalElementAlign('logo', { h: 'left' })} className="p-2 rounded hover:bg-gray-200"><AlignLeftIcon className="w-6 h-6 text-gray-700" /></button>
                        <button onClick={() => onGlobalElementAlign('logo', { h: 'center' })} className="p-2 rounded hover:bg-gray-200"><AlignCenterIcon className="w-6 h-6 text-gray-700" /></button>
                        <button onClick={() => onGlobalElementAlign('logo', { h: 'right' })} className="p-2 rounded hover:bg-gray-200"><AlignRightIcon className="w-6 h-6 text-gray-700" /></button>
                        <div className="border-l h-6 border-gray-300 mx-1"></div>
                        <button onClick={() => onGlobalElementAlign('logo', { v: 'top' })} className="p-2 rounded hover:bg-gray-200"><AlignTopIcon className="w-6 h-6 text-gray-700" /></button>
                        <button onClick={() => onGlobalElementAlign('logo', { v: 'middle' })} className="p-2 rounded hover:bg-gray-200"><AlignMiddleIcon className="w-6 h-6 text-gray-700" /></button>
                        <button onClick={() => onGlobalElementAlign('logo', { v: 'bottom' })} className="p-2 rounded hover:bg-gray-200"><AlignBottomIcon className="w-6 h-6 text-gray-700" /></button>
                    </div>
                </div>
            </ControlSection>

            <ControlSection title="Background" defaultOpen={false}>
                <div className="flex space-x-2">
                    <button onClick={() => onStateChange({ backgroundType: 'solid' })} className={`flex-1 p-2 rounded-md ${state.backgroundType === 'solid' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Solid</button>
                    <button onClick={() => onStateChange({ backgroundType: 'gradient' })} className={`flex-1 p-2 rounded-md ${state.backgroundType === 'gradient' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Gradient</button>
                    <button onClick={() => document.getElementById('bg-image-upload')?.click()} className={`flex-1 p-2 rounded-md ${state.backgroundType === 'image' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Image</button>
                    <input id="bg-image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                {state.backgroundType === 'solid' && (
                     <div>
                        <Label>Color</Label>
                        <ColorPicker value={state.backgroundColor} onChange={e => onStateChange({ backgroundColor: e.target.value })} />
                    </div>
                )}
                 {state.backgroundType === 'image' && state.backgroundImage && (
                     <div>
                        <Label>Image Scale</Label>
                        <NumberInput value={state.backgroundScale} step={0.05} min={0.1} max={3} onChange={e => onStateChange({ backgroundScale: parseFloat(e.target.value) })} />
                    </div>
                )}
            </ControlSection>
        </div>
    );
};