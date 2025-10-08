import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, CheckCircle, AlertTriangle, Clock, Download } from 'lucide-react';

interface DeploymentStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  logs?: string[];
}

interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  buildCommand: string;
  outputDir: string;
  nodeVersion: string;
  envVars: Record<string, string>;
}

export const DeploymentManager: React.FC = () => {
  const [showDeployment, setShowDeployment] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<DeploymentConfig>({
    environment: 'production',
    buildCommand: 'npm run build',
    outputDir: 'dist',
    nodeVersion: '18.x',
    envVars: {
      NODE_ENV: 'production',
      VITE_API_URL: 'https://api.example.com'
    }
  });

  const deploymentConfigs: Record<string, DeploymentConfig> = {
    development: {
      environment: 'development',
      buildCommand: 'npm run dev',
      outputDir: 'src',
      nodeVersion: '18.x',
      envVars: {
        NODE_ENV: 'development',
        VITE_API_URL: 'http://localhost:3001'
      }
    },
    staging: {
      environment: 'staging',
      buildCommand: 'npm run build',
      outputDir: 'dist',
      nodeVersion: '18.x',
      envVars: {
        NODE_ENV: 'staging',
        VITE_API_URL: 'https://staging-api.example.com'
      }
    },
    production: {
      environment: 'production',
      buildCommand: 'npm run build',
      outputDir: 'dist',
      nodeVersion: '18.x',
      envVars: {
        NODE_ENV: 'production',
        VITE_API_URL: 'https://api.example.com'
      }
    }
  };

  const runDeployment = async () => {
    setIsDeploying(true);
    
    const steps: DeploymentStep[] = [
      { id: 'validate', name: 'Validate Configuration', description: 'Check deployment settings', status: 'pending' },
      { id: 'install', name: 'Install Dependencies', description: 'npm install', status: 'pending' },
      { id: 'test', name: 'Run Tests', description: 'npm run test', status: 'pending' },
      { id: 'build', name: 'Build Application', description: selectedConfig.buildCommand, status: 'pending' },
      { id: 'optimize', name: 'Optimize Assets', description: 'Compress and optimize files', status: 'pending' },
      { id: 'deploy', name: 'Deploy to Server', description: `Deploy to ${selectedConfig.environment}`, status: 'pending' },
      { id: 'verify', name: 'Verify Deployment', description: 'Health check and smoke tests', status: 'pending' }
    ];

    setDeploymentSteps(steps);

    // Simulate deployment process
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Start step
      setDeploymentSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, status: 'running' } : s
      ));

      // Simulate step execution
      const startTime = Date.now();
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
      const duration = Date.now() - startTime;

      // Complete step (simulate occasional failures)
      const success = Math.random() > 0.1; // 90% success rate
      const logs = generateStepLogs(step.id, success);
      
      setDeploymentSteps(prev => prev.map(s => 
        s.id === step.id ? { 
          ...s, 
          status: success ? 'success' : 'error',
          duration,
          logs
        } : s
      ));

      if (!success) {
        setIsDeploying(false);
        return;
      }
    }

    setIsDeploying(false);
  };

  const generateStepLogs = (stepId: string, success: boolean): string[] => {
    const baseLogs = {
      validate: [
        'Checking Node.js version...',
        'Validating package.json...',
        'Checking environment variables...'
      ],
      install: [
        'Installing dependencies...',
        'npm WARN deprecated package@1.0.0',
        'added 1247 packages in 23.4s'
      ],
      test: [
        'Running test suite...',
        'PASS src/components/Canvas.test.tsx',
        'PASS src/utils/export.test.ts',
        'Tests: 47 passed, 47 total'
      ],
      build: [
        'Building for production...',
        'Transforming files...',
        'Generating chunks...',
        'dist/index.html                   0.45 kB',
        'dist/assets/index-a1b2c3d4.js   245.67 kB'
      ],
      optimize: [
        'Compressing assets...',
        'Optimizing images...',
        'Minifying CSS and JS...',
        'Reduced bundle size by 23%'
      ],
      deploy: [
        'Uploading files to server...',
        'Updating DNS records...',
        'Configuring SSL certificate...',
        'Deployment successful!'
      ],
      verify: [
        'Running health checks...',
        'Testing API endpoints...',
        'Verifying asset loading...',
        'All systems operational'
      ]
    };

    const logs = baseLogs[stepId as keyof typeof baseLogs] || ['Step completed'];
    
    if (!success) {
      logs.push('ERROR: Step failed with exit code 1');
    }

    return logs;
  };

  const generateDockerfile = () => {
    return `# Multi-stage build for Master Image Editor
FROM node:${selectedConfig.nodeVersion}-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN ${selectedConfig.buildCommand}

FROM nginx:alpine
COPY --from=builder /app/${selectedConfig.outputDir} /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;
  };

  const generateGitHubActions = () => {
    return `name: Deploy Master Image Editor

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '${selectedConfig.nodeVersion}'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: ${selectedConfig.buildCommand}
      env:
${Object.entries(selectedConfig.envVars).map(([key, value]) => `        ${key}: ${value}`).join('\n')}
    
    - name: Deploy to ${selectedConfig.environment}
      run: |
        echo "Deploying to ${selectedConfig.environment}"
        # Add your deployment commands here`;
  };

  const downloadConfig = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStepIcon = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'error':
        return <AlertTriangle className="text-red-500" size={16} />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  if (!showDeployment) {
    return (
      <motion.button
        onClick={() => setShowDeployment(true)}
        className="fixed bottom-28 right-4 z-40 bg-orange-600 text-white p-3 rounded-full shadow-lg hover:bg-orange-700"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Deployment Manager"
      >
        <Rocket size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={() => setShowDeployment(false)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Rocket size={20} />
              Deployment Manager
            </h2>
            <button
              onClick={() => setShowDeployment(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Deployment Configuration</h3>
              
              {/* Environment Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Environment</label>
                <div className="flex gap-2">
                  {Object.keys(deploymentConfigs).map(env => (
                    <button
                      key={env}
                      onClick={() => setSelectedConfig(deploymentConfigs[env])}
                      className={`px-3 py-2 rounded text-sm capitalize ${
                        selectedConfig.environment === env
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration Details */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Build Command</label>
                  <input
                    type="text"
                    value={selectedConfig.buildCommand}
                    onChange={(e) => setSelectedConfig(prev => ({ ...prev, buildCommand: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Output Directory</label>
                  <input
                    type="text"
                    value={selectedConfig.outputDir}
                    onChange={(e) => setSelectedConfig(prev => ({ ...prev, outputDir: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Node Version</label>
                  <input
                    type="text"
                    value={selectedConfig.nodeVersion}
                    onChange={(e) => setSelectedConfig(prev => ({ ...prev, nodeVersion: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Environment Variables */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Environment Variables</label>
                <div className="space-y-2">
                  {Object.entries(selectedConfig.envVars).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <input
                        type="text"
                        value={key}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50"
                        readOnly
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setSelectedConfig(prev => ({
                          ...prev,
                          envVars: { ...prev.envVars, [key]: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Config Files */}
              <div className="space-y-2">
                <button
                  onClick={() => downloadConfig('Dockerfile', generateDockerfile())}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                >
                  <Download size={14} />
                  Download Dockerfile
                </button>
                <button
                  onClick={() => downloadConfig('.github/workflows/deploy.yml', generateGitHubActions())}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                >
                  <Download size={14} />
                  Download GitHub Actions
                </button>
              </div>
            </div>

            {/* Deployment Status */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Deployment Status</h3>
                <button
                  onClick={runDeployment}
                  disabled={isDeploying}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  <Rocket size={16} />
                  {isDeploying ? 'Deploying...' : 'Deploy'}
                </button>
              </div>

              {/* Deployment Steps */}
              <div className="space-y-3">
                {deploymentSteps.map((step, index) => (
                  <div key={step.id} className="border rounded-lg p-3">
                    <div className="flex items-center gap-3 mb-2">
                      {getStepIcon(step.status)}
                      <div className="flex-1">
                        <div className="font-medium text-sm">{step.name}</div>
                        <div className="text-xs text-gray-600">{step.description}</div>
                      </div>
                      {step.duration && (
                        <div className="text-xs text-gray-500">
                          {(step.duration / 1000).toFixed(1)}s
                        </div>
                      )}
                    </div>
                    
                    {step.logs && step.logs.length > 0 && (
                      <div className="mt-2 bg-gray-900 rounded p-2 text-xs">
                        {step.logs.map((log, i) => (
                          <div key={i} className={`font-mono ${
                            log.startsWith('ERROR') ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};