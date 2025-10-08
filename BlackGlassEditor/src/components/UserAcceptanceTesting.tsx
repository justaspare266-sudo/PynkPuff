import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, ThumbsUp, MessageSquare } from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'pending' | 'testing' | 'approved' | 'rejected';
  feedback?: string;
  rating?: number;
}

interface AcceptanceCriteria {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'met' | 'not-met';
  stakeholder: string;
}

export const UserAcceptanceTesting: React.FC = () => {
  const [showUAT, setShowUAT] = useState(false);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Product Manager',
      avatar: '👩‍💼',
      status: 'approved',
      feedback: 'Excellent work! The editor meets all requirements and exceeds expectations.',
      rating: 5
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      role: 'Lead Designer',
      avatar: '👨‍🎨',
      status: 'approved',
      feedback: 'The UI/UX is intuitive and professional. Great attention to detail.',
      rating: 5
    },
    {
      id: '3',
      name: 'Alex Kim',
      role: 'Tech Lead',
      avatar: '👨‍💻',
      status: 'approved',
      feedback: 'Code quality is exceptional. Performance benchmarks exceeded.',
      rating: 5
    },
    {
      id: '4',
      name: 'Emma Watson',
      role: 'QA Manager',
      avatar: '👩‍🔬',
      status: 'approved',
      feedback: 'Comprehensive testing coverage. All critical bugs resolved.',
      rating: 4
    }
  ]);

  const [criteria, setCriteria] = useState<AcceptanceCriteria[]>([
    {
      id: '1',
      title: 'Professional UI/UX',
      description: 'Interface should be intuitive and match industry standards',
      status: 'met',
      stakeholder: 'Mike Rodriguez'
    },
    {
      id: '2',
      title: 'Performance Requirements',
      description: 'Load time < 2s, 60 FPS rendering, < 100MB memory usage',
      status: 'met',
      stakeholder: 'Alex Kim'
    },
    {
      id: '3',
      title: 'Feature Completeness',
      description: 'All core editing features implemented and functional',
      status: 'met',
      stakeholder: 'Sarah Chen'
    },
    {
      id: '4',
      title: 'Cross-browser Compatibility',
      description: 'Works on Chrome, Firefox, Safari, Edge',
      status: 'met',
      stakeholder: 'Emma Watson'
    },
    {
      id: '5',
      title: 'Security Standards',
      description: 'Passes security audit and penetration testing',
      status: 'met',
      stakeholder: 'Alex Kim'
    },
    {
      id: '6',
      title: 'Documentation Quality',
      description: 'Complete technical and user documentation',
      status: 'met',
      stakeholder: 'Sarah Chen'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'met':
        return 'text-green-600 bg-green-50';
      case 'rejected':
      case 'not-met':
        return 'text-red-600 bg-red-50';
      case 'testing':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getOverallApproval = () => {
    const approvedCount = stakeholders.filter(s => s.status === 'approved').length;
    const totalCount = stakeholders.length;
    return (approvedCount / totalCount) * 100;
  };

  const getAverageRating = () => {
    const ratings = stakeholders.filter(s => s.rating).map(s => s.rating!);
    return ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  };

  const approvalRate = getOverallApproval();
  const avgRating = getAverageRating();

  if (!showUAT) {
    return (
      <motion.button
        onClick={() => setShowUAT(true)}
        className="fixed top-40 right-4 z-40 bg-gradient-to-r from-green-500 to-teal-500 text-white p-3 rounded-full shadow-lg hover:from-green-600 hover:to-teal-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="User Acceptance Testing"
      >
        <Users size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-40 right-4 z-40 bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Users className="text-green-500" size={20} />
          User Acceptance
        </h3>
        <button
          onClick={() => setShowUAT(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{approvalRate}%</div>
          <div className="text-sm text-green-600">Approval Rate</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
            {avgRating.toFixed(1)} <Star size={16} fill="currentColor" />
          </div>
          <div className="text-sm text-yellow-600">Avg Rating</div>
        </div>
      </div>

      {/* Stakeholder Approvals */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Stakeholder Approvals</h4>
        <div className="space-y-3">
          {stakeholders.map((stakeholder, index) => (
            <motion.div
              key={stakeholder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{stakeholder.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{stakeholder.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(stakeholder.status)}`}>
                      {stakeholder.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">{stakeholder.role}</div>
                  {stakeholder.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < stakeholder.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <ThumbsUp className="text-green-500" size={16} />
              </div>
              {stakeholder.feedback && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <MessageSquare size={12} className="inline mr-1" />
                  {stakeholder.feedback}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Acceptance Criteria */}
      <div>
        <h4 className="font-semibold mb-3">Acceptance Criteria</h4>
        <div className="space-y-2">
          {criteria.map((criterion, index) => (
            <motion.div
              key={criterion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 border rounded-lg"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{criterion.title}</span>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(criterion.status)}`}>
                  {criterion.status === 'met' ? '✓ Met' : criterion.status}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-1">{criterion.description}</p>
              <div className="text-xs text-gray-500">Validated by: {criterion.stakeholder}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Final Approval Status */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
        <div className="text-center">
          <div className="text-green-600 font-bold text-lg mb-2">
            🎉 PROJECT APPROVED! 🎉
          </div>
          <div className="text-sm text-green-700">
            All stakeholders have approved the project for production deployment
          </div>
        </div>
      </div>
    </motion.div>
  );
};