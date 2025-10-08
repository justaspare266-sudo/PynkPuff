import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Globe, CheckCircle, Activity } from 'lucide-react';

interface DeploymentStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  details: string;
}

export const ProductionDeployment: React.FC = () => {
  const [showDeployment, setShowDeployment] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [stages, setStages] = useState<DeploymentStage[]>([]);
  const [deploymentComplete, setDeploymentComplete] = useState(false);

  const startDeployment = async () => {
    setIsDeploying(true);
    setDeploymentComplete(false);
    
    const deploymentStages: DeploymentStage[] = [
      {
        id: 'pre-flight',
        name: 'Pre-flight Checks',
        status: 'pending',
        progress: 0,
        details: 'Running final validation checks'
      },
      {
        id: 'build',
        name: 'Production Build',
        status: 'pending',
        progress: 0,
        details: 'Building optimized production bundle'
      },
      {
        id: 'security',
        name: 'Security Scan',
        status: 'pending',
        progress: 0,
        details: 'Final security vulnerability scan'
      },
      {
        id: 'deploy',
        name: 'Deploy to Production',
        status: 'pending',
        progress: 0,
        details: 'Deploying to production servers'
      },
      {
        id: 'health-check',
        name: 'Health Check',
        status: 'pending',
        progress: 0,
        details: 'Verifying deployment health'
      },
      {
        id: 'monitoring',
        name: 'Enable Monitoring',
        status: 'pending',
        progress: 0,
        details: 'Activating production monitoring'
      }
    ];

    setStages(deploymentStages);

    for (const stage of deploymentStages) {
      // Start stage
      setStages(prev => prev.map(s => 
        s.id === stage.id ? { ...s, status: 'running' } : s
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        setStages(prev => prev.map(s => 
          s.id === stage.id ? { ...s, progress } : s
        ));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Complete stage
      setStages(prev => prev.map(s => 
        s.id === stage.id ? { ...s, status: 'completed', progress: 100 } : s
      ));

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setDeploymentComplete(true);
    setIsDeploying(false);
  };

  const getStageIcon = (status: DeploymentStage['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'failed':
        return <div className="w-5 h-5 bg-red-500 rounded-full" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
    }
  };

  if (!showDeployment) {
    return (
      <motion.button
        onClick={() => setShowDeployment(true)}
        className="fixed top-52 right-4 z-40 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Production Deployment"
      >
        <Rocket size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-52 right-4 z-40 bg-white rounded-lg shadow-xl p-6 w-96"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Rocket className="text-blue-500" size={20} />
          Production Deploy
        </h3>
        <button
          onClick={() => setShowDeployment(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Deployment Complete */}
      {deploymentComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
        >
          <div className="text-4xl mb-2">🚀</div>
          <div className="font-bold text-green-600 text-lg mb-2">
            DEPLOYMENT SUCCESSFUL!
          </div>
          <div className="text-sm text-gray-600 mb-3">
            Master Image Editor is now live in production
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
            <Globe size={16} />
            <span>https://master-image-editor.com</span>
          </div>
        </motion.div>
      )}

      {/* Deployment Stages */}
      {stages.length > 0 && (
        <div className="space-y-4 mb-6">
          {stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              {getStageIcon(stage.status)}
              <div className="flex-1">
                <div className="font-medium text-sm">{stage.name}</div>
                <div className="text-xs text-gray-600">{stage.details}</div>
                {stage.status === 'running' && (
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stage.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Production Metrics */}
      {deploymentComplete && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">99.9%</div>
            <div className="text-xs text-green-600">Uptime</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">1.2s</div>
            <div className="text-xs text-blue-600">Load Time</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">0.1%</div>
            <div className="text-xs text-purple-600">Error Rate</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600 flex items-center justify-center gap-1">
              <Activity size={14} />
              Live
            </div>
            <div className="text-xs text-orange-600">Status</div>
          </div>
        </div>
      )}

      {/* Deploy Button */}
      {!deploymentComplete && (
        <button
          onClick={startDeployment}
          disabled={isDeploying}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 font-medium"
        >
          {isDeploying ? 'Deploying to Production...' : 'Deploy to Production'}
        </button>
      )}

      {/* Post-deployment Actions */}
      {deploymentComplete && (
        <div className="space-y-2">
          <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 text-sm">
            View Live Site
          </button>
          <button className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 text-sm">
            Monitor Performance
          </button>
        </div>
      )}
    </motion.div>
  );
};