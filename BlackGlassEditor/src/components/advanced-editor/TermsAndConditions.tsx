"use client";

import React from 'react';

interface TermsAndConditionsProps {
  terms: string;
  setTerms: (terms: string) => void;
  isTermsVisible: boolean;
  setIsTermsVisible: (visible: boolean) => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  terms,
  setTerms,
  isTermsVisible,
  setIsTermsVisible,
}) => {
  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-700">Terms & Conditions</h4>
        <input
          type="checkbox"
          checked={isTermsVisible}
          onChange={(e) => setIsTermsVisible(e.target.checked)}
          className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
          aria-label="Toggle Terms & Conditions Visibility"
        />
      </div>
      {isTermsVisible && (
        <div className="mt-2">
          <input
            type="text"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            aria-label="Terms & Conditions Text"
          />
        </div>
      )}
    </div>
  );
};

export default TermsAndConditions;