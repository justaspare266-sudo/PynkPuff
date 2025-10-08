// src/components/fontselector/FontSelector.tsx
"use client";

import React, { useState } from 'react';

// Define the structure of our font options for clarity
type FontWeight = {
  name: string;   // e.g., "Thin", "Bold Italic"
  weight: number; // e.g., 100, 700
  style: string;  // e.g., 'normal', 'italic'
};

type FontOption = {
  [key: string]: FontWeight[];
};

// Define all our available fonts and their weights here
const fontOptions: FontOption = {
  "Heading Pro": [
    { name: "Thin", weight: 100, style: 'normal' },
    { name: "Extra Light", weight: 200, style: 'normal' },
    { name: "Light", weight: 300, style: 'normal' },
    { name: "Regular", weight: 400, style: 'normal' },
    { name: "Book", weight: 450, style: 'normal' },
    { name: "Bold", weight: 700, style: 'normal' },
    { name: "Extra Bold", weight: 800, style: 'normal' },
    { name: "Heavy", weight: 900, style: 'normal' },
  ],
  "Swear Text": [
    { name: "Thin", weight: 100, style: 'normal' },
    { name: "Thin Italic", weight: 100, style: 'italic' },
    { name: "Thin Cilati", weight: 100, style: 'normal' },
    { name: "Light", weight: 300, style: 'normal' },
    { name: "Light Italic", weight: 300, style: 'italic' },
    { name: "Light Cilati", weight: 300, style: 'normal' },
    { name: "Regular", weight: 400, style: 'normal' },
    { name: "Italic", weight: 400, style: 'italic' },
    { name: "Cilati", weight: 400, style: 'normal' },
    { name: "Medium", weight: 500, style: 'normal' },
    { name: "Medium Italic", weight: 500, style: 'italic' },
    { name: "Medium Cilati", weight: 500, style: 'normal' },
    { name: "Bold", weight: 700, style: 'normal' },
    { name: "Bold Italic", weight: 700, style: 'italic' },
    { name: "Bold Cilati", weight: 700, style: 'normal' },
    { name: "Black", weight: 900, style: 'normal' },
    { name: "Black Italic", weight: 900, style: 'italic' },
    { name: "Black Cilati", weight: 900, style: 'normal' },
  ]
};

// The component receives the currently selected shape and an update function
const FontSelector = ({ selectedShape, onPropertyChange, onBatchPropertyChange }: any) => {
  const isDisabled = !selectedShape;
  const [localFontFamily, setLocalFontFamily] = useState(selectedShape?.fontFamily || '');
  // Use fontOptions directly
  const availableWeights = fontOptions[localFontFamily] || [];

  return (
    <fieldset style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
      <legend>Text Properties</legend>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: isDisabled ? 0.4 : 1 }}>
        {/* Main Font Family Dropdown */}
        <div>
          <label htmlFor="font-family-selector">Font Family: </label>
          <select
            id="font-family-selector"
            value={localFontFamily} // Use local state
            disabled={isDisabled}
            onChange={(e) => {
              const newFamily = e.target.value;
              setLocalFontFamily(newFamily); // Update local state

              // When family changes, reset weight to the first available option
              if (fontOptions[newFamily] && fontOptions[newFamily][0]) {
                const defaultWeight = fontOptions[newFamily][0];
                onBatchPropertyChange({
                  fontFamily: newFamily,
                  fontWeight: defaultWeight.weight,
                  fontStyle: defaultWeight.style,
                });
              } else {
                // If no default weight found, just set fontFamily
                onBatchPropertyChange({
                  fontFamily: newFamily,
                });
              }
            }}
          >
            <option value="" disabled>Select a font...</option>
            {/* Use keys from fontOptions */}
            {Object.keys(fontOptions).map(family => (
              <option key={family} value={family}>{family}</option>
            ))}
          </select>
        </div>

        {/* Live Preview List of Font Weights */}
        {availableWeights.length > 0 && (
          <div>
            <label>Font Style:</label>
            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '5px' }}>
              {availableWeights.map((weight) => (
                <button
                  key={weight.name}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const updates: any = {
                      fontFamily: `${localFontFamily} ${weight.name}`.trim(), // Construct the full unique font family name
                      fontWeight: weight.weight,   // Use the specific weight
                      fontStyle: weight.style,    // Use the specific style
                    };

                    onBatchPropertyChange(updates);
                  }}
                  style={{
                    padding: '4px',
                    cursor: 'pointer',
                    fontFamily: `"${localFontFamily}"`,
                    fontWeight: weight.weight,
                    fontStyle: weight.style,
                    backgroundColor: selectedShape &&
                      selectedShape.fontWeight === weight.weight &&
                      selectedShape.fontStyle === weight.style &&
                      (() => { // Immediately invoked function to determine expected fontFamily
                        // The expected font family is the unique name from weight.name
                        const expectedFontFamily = `${localFontFamily} ${weight.name}`.trim(); // Construct the full unique font family name
                        return selectedShape.fontFamily === expectedFontFamily;
                      })()
                      ? '#e0f7fa' : 'transparent',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: '4px'
                  }}
                >
                  {weight.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </fieldset>
  );
};

export default FontSelector;