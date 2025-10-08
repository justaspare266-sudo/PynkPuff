import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones, TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react';

interface SupportMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'needs-attention';
}

interface SupportTicket {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'resolved';
  user: string;
  timestamp: number;
}

export const PostLaunchSupport: React.FC = () => {
  const [showSupport, setShowSupport] = useState(false);
  const [metrics, setMetrics] = useState<SupportMetric[]>([
    {
      id: 'user-satisfaction',
      name: 'User Satisfaction',
      value: 4.8,
      unit: '/5',
      trend: 'up',
      status: 'excellent'
    },
    {
      id: 'response-time',
      name: 'Avg Response Time',
      value: 2.3,
      unit: 'hrs',
      trend: 'down',
      status: 'excellent'
    },
    {
      id: 'resolution-rate',
      name: 'Resolution Rate',
      value: 94,
      unit: '%',
      trend: 'stable',
      status: 'excellent'
    },
    {
      id: 'active-users',
      name: 'Active Users',
      value: 12547,
      unit: '',
      trend: 'up',
      status: 'excellent'
    }
  ]);

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      title: 'Export feature not working in Safari',
      priority: 'medium',
      status: 'resolved',
      user: 'john.doe@example.com',
      timestamp: Date.now() - 3600000
    },
    {
      id: '2',
      title: 'Feature request: Add more shape tools',
      priority: 'low',
      status: 'in-progress',
      user: 'designer@company.com',
      timestamp: Date.now() - 7200000
    },
    {
      id: '3',
      title: 'Performance issue with large images',
      priority: 'high',
      status: 'resolved',
      user: 'photographer@studio.com',
      timestamp: Date.now() - 10800000
    }
  ]);

  const getTrendIcon = (trend: SupportMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="text-green-500" size={16} />;
      case 'down':
        return <TrendingUp className="text-red-500 rotate-180" size={16} />;
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: SupportMetric['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'needs-attention': return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
    }
  };

  const getTicketIcon = (status: SupportTicket['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'in-progress':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="text-orange-500" size={16} />;
    }
  };

  if (!showSupport) {
    return (
      <motion.button
        onClick={() => setShowSupport(true)}
        className="fixed top-64 right-4 z-40 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-full shadow-lg hover:from-indigo-600 hover:to-purple-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Post-Launch Support"
      >
        <Headphones size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-64 right-4 z-40 bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Headphones className="text-indigo-500" size={20} />
          Post-Launch Support
        </h3>
        <button
          onClick={() => setShowSupport(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {/* Support Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg ${getStatusColor(metric.status)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{metric.name}</span>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="text-lg font-bold">
              {metric.value.toLocaleString()}{metric.unit}
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Status */}
      <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="font-semibold text-green-700">All Systems Operational</span>
        </div>
        <div className="text-sm text-gray-600">
          Master Image Editor is running smoothly with 99.9% uptime
        </div>
      </div>

      {/* Recent Support Tickets */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Users size={16} />
          Recent Support Tickets
        </h4>
        <div className="space-y-3">
          {tickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 border rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                {getTicketIcon(ticket.status)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{ticket.title}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {ticket.user} • {new Date(ticket.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Support Actions */}
      <div className="space-y-2">
        <button className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 text-sm">
          View All Tickets
        </button>
        <button className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 text-sm">
          Generate Support Report
        </button>
      </div>

      {/* Success Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="text-center">
          <div className="text-2xl mb-2">🎉</div>
          <div className="font-bold text-purple-600 mb-1">
            Launch Successful!
          </div>
          <div className="text-sm text-gray-600">
            Master Image Editor is live and serving users worldwide
          </div>
        </div>
      </div>
    </motion.div>
  );
};