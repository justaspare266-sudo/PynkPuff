import React from 'react';

const SimpleApp: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Affiliate Tool - Simple Version</h1>
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <p className="text-gray-600 mb-4">This is a simple test version of the affiliate tool.</p>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg">
                            <h3 className="font-semibold text-green-900">✅ Working!</h3>
                            <p className="text-green-700">The component is loading successfully.</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h3 className="font-semibold text-blue-900">Next Steps:</h3>
                            <p className="text-blue-700">Now we can gradually add the full functionality.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleApp;
