import React, { useState, useEffect } from 'react';
import { Link, Settings, Zap, CheckCircle, AlertCircle, ExternalLink, Key, Code, Webhook } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'storage' | 'design' | 'productivity' | 'ai' | 'social' | 'development';
  status: 'connected' | 'disconnected' | 'error';
  config: Record<string, any>;
  apiEndpoint?: string;
  webhookUrl?: string;
  lastSync?: Date;
  features: string[];
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

interface ExternalIntegrationsProps {
  onClose: () => void;
  onIntegrationUpdate: (integration: Integration) => void;
}

const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'figma',
    name: 'Figma',
    description: 'Import designs and sync with Figma files',
    icon: '🎨',
    category: 'design',
    status: 'disconnected',
    config: {},
    features: ['Import designs', 'Sync files', 'Export to Figma']
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Save and load projects from Google Drive',
    icon: '📁',
    category: 'storage',
    status: 'disconnected',
    config: {},
    features: ['Cloud storage', 'Auto-sync', 'Shared folders']
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Sync projects with Dropbox',
    icon: '📦',
    category: 'storage',
    status: 'disconnected',
    config: {},
    features: ['File sync', 'Version history', 'Team sharing']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Share designs and get notifications in Slack',
    icon: '💬',
    category: 'productivity',
    status: 'disconnected',
    config: {},
    features: ['Design sharing', 'Notifications', 'Team collaboration']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI-powered design suggestions and content generation',
    icon: '🤖',
    category: 'ai',
    status: 'disconnected',
    config: {},
    features: ['AI suggestions', 'Content generation', 'Smart layouts']
  },
];

const SAMPLE_API_KEYS: APIKey[] = [
  {
    id: 'api-1',
    name: 'Production API',
    key: 'sk-proj-abc123...def456',
    permissions: ['read', 'write', 'export'],
    createdAt: new Date('2024-01-01'),
    lastUsed: new Date('2024-01-15'),
    isActive: true
  },
  {
    id: 'api-2',
    name: 'Development API',
    key: 'sk-dev-xyz789...uvw012',
    permissions: ['read'],
    createdAt: new Date('2024-01-10'),
    isActive: true
  }
];

export const ExternalIntegrations: React.FC<ExternalIntegrationsProps> = ({
  onClose,
  onIntegrationUpdate
}) => {
  const [integrations, setIntegrations] = useState<Integration[]>(AVAILABLE_INTEGRATIONS);
  const [apiKeys, setApiKeys] = useState<APIKey[]>(SAMPLE_API_KEYS);
  const [selectedTab, setSelectedTab] = useState<'integrations' | 'api' | 'webhooks'>('integrations');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showConnectDialog, setShowConnectDialog] = useState<Integration | null>(null);
  const [showCreateAPIKey, setShowCreateAPIKey] = useState(false);
  const [newAPIKey, setNewAPIKey] = useState({
    name: '',
    permissions: [] as string[]
  });

  const categories = [
    { id: 'all', name: 'All', count: integrations.length },
    { id: 'storage', name: 'Storage', count: integrations.filter(i => i.category === 'storage').length },
    { id: 'design', name: 'Design', count: integrations.filter(i => i.category === 'design').length },
    { id: 'productivity', name: 'Productivity', count: integrations.filter(i => i.category === 'productivity').length },
    { id: 'ai', name: 'AI', count: integrations.filter(i => i.category === 'ai').length },
    { id: 'social', name: 'Social', count: integrations.filter(i => i.category === 'social').length }
  ];

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.category === selectedCategory);

  const connectIntegration = async (integration: Integration, config: Record<string, any>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedIntegration = {
        ...integration,
        status: 'connected' as const,
        config,
        lastSync: new Date()
      };

      setIntegrations(prev => prev.map(i => 
        i.id === integration.id ? updatedIntegration : i
      ));

      onIntegrationUpdate(updatedIntegration);
      setShowConnectDialog(null);
    } catch (error) {
      console.error('Failed to connect integration:', error);
    }
  };

  const disconnectIntegration = (integrationId: string) => {
    setIntegrations(prev => prev.map(i => 
      i.id === integrationId 
        ? { ...i, status: 'disconnected' as const, config: {}, lastSync: undefined }
        : i
    ));
  };

  const createAPIKey = () => {
    if (!newAPIKey.name) return;

    const apiKey: APIKey = {
      id: `api-${Date.now()}`,
      name: newAPIKey.name,
      key: `sk-proj-${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 8)}`,
      permissions: newAPIKey.permissions,
      createdAt: new Date(),
      isActive: true
    };

    setApiKeys(prev => [...prev, apiKey]);
    setNewAPIKey({ name: '', permissions: [] });
    setShowCreateAPIKey(false);
  };

  const toggleAPIKey = (keyId: string) => {
    setApiKeys(prev => prev.map(key =>
      key.id === keyId ? { ...key, isActive: !key.isActive } : key
    ));
  };

  const deleteAPIKey = (keyId: string) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[90vh] max-w-6xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Link className="w-5 h-5" />
              External Integrations
            </h2>
            <p className="text-sm text-gray-500">Connect with external tools and services</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">×</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'integrations', name: 'Integrations', icon: Link },
            { id: 'api', name: 'API Keys', icon: Key },
            { id: 'webhooks', name: 'Webhooks', icon: Webhook }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {selectedTab === 'integrations' && (
            <>
              {/* Sidebar */}
              <div className="w-64 border-r bg-gray-50 p-4">
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded text-left hover:bg-gray-200 ${
                        selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      <span className="capitalize">{category.name}</span>
                      <span className="text-xs text-gray-500">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Integrations Grid */}
              <div className="flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIntegrations.map(integration => (
                    <div key={integration.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{integration.icon}</span>
                          <div>
                            <h3 className="font-medium">{integration.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">{integration.category}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          integration.status === 'connected' ? 'bg-green-100 text-green-700' :
                          integration.status === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {integration.status}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{integration.description}</p>

                      <div className="mb-3">
                        <h4 className="text-xs font-medium text-gray-700 mb-1">Features:</h4>
                        <div className="flex flex-wrap gap-1">
                          {integration.features.slice(0, 3).map(feature => (
                            <span key={feature} className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        {integration.status === 'connected' ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-600">Connected</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Not connected</span>
                          </div>
                        )}

                        {integration.status === 'connected' ? (
                          <button
                            onClick={() => disconnectIntegration(integration.id)}
                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => setShowConnectDialog(integration)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Connect
                          </button>
                        )}
                      </div>

                      {integration.lastSync && (
                        <div className="mt-2 text-xs text-gray-500">
                          Last sync: {integration.lastSync.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {selectedTab === 'api' && (
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">API Keys</h3>
                  <p className="text-sm text-gray-500">Manage API keys for external integrations</p>
                </div>
                <button
                  onClick={() => setShowCreateAPIKey(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create API Key
                </button>
              </div>

              <div className="space-y-4">
                {apiKeys.map(apiKey => (
                  <div key={apiKey.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <p className="text-sm text-gray-500">
                          Created {apiKey.createdAt.toLocaleDateString()}
                          {apiKey.lastUsed && ` • Last used ${apiKey.lastUsed.toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded text-xs ${
                          apiKey.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </div>
                        <button
                          onClick={() => toggleAPIKey(apiKey.id)}
                          className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                        >
                          {apiKey.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => deleteAPIKey(apiKey.id)}
                          className="px-3 py-1 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                        {apiKey.key}
                      </code>
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="px-3 py-2 border rounded hover:bg-gray-50"
                      >
                        Copy
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {apiKey.permissions.map(permission => (
                        <span key={permission} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'webhooks' && (
            <div className="flex-1 p-6">
              <div className="text-center text-gray-500 py-12">
                <Webhook className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Webhooks</h3>
                <p>Configure webhooks to receive real-time notifications</p>
                <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Add Webhook
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connect Integration Dialog */}
      {showConnectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl w-[500px] p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">{showConnectDialog.icon}</span>
              Connect {showConnectDialog.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">API Key / Token</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter your API key"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Endpoint URL (optional)</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://api.example.com"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowConnectDialog(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => connectIntegration(showConnectDialog, { apiKey: 'test-key' })}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Dialog */}
      {showCreateAPIKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl w-[500px] p-6">
            <h3 className="text-lg font-semibold mb-4">Create API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Key Name</label>
                <input
                  type="text"
                  value={newAPIKey.name}
                  onChange={(e) => setNewAPIKey(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Production API, Development, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Permissions</label>
                <div className="space-y-2">
                  {['read', 'write', 'export', 'admin'].map(permission => (
                    <label key={permission} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newAPIKey.permissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAPIKey(prev => ({
                              ...prev,
                              permissions: [...prev.permissions, permission]
                            }));
                          } else {
                            setNewAPIKey(prev => ({
                              ...prev,
                              permissions: prev.permissions.filter(p => p !== permission)
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="capitalize">{permission}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateAPIKey(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={createAPIKey}
                disabled={!newAPIKey.name || newAPIKey.permissions.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};