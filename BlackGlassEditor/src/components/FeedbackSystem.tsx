import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bug, Star, Send, X, Camera } from 'lucide-react';

interface FeedbackData {
  type: 'bug' | 'feature' | 'general';
  rating?: number;
  title: string;
  description: string;
  screenshot?: string;
  userAgent: string;
  timestamp: string;
}

export const FeedbackSystem: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const takeScreenshot = async () => {
    try {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const dataURL = canvas.toDataURL('image/png');
        setScreenshot(dataURL);
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  };

  const submitFeedback = async () => {
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    const feedbackData: FeedbackData = {
      type: feedbackType,
      rating: feedbackType === 'general' ? rating : undefined,
      title: title.trim(),
      description: description.trim(),
      screenshot: screenshot || undefined,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store locally for now
      const existingFeedback = JSON.parse(localStorage.getItem('editor-feedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('editor-feedback', JSON.stringify(existingFeedback));

      setSubmitted(true);
      setTimeout(() => {
        setShowFeedback(false);
        resetForm();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFeedbackType('general');
    setRating(0);
    setTitle('');
    setDescription('');
    setScreenshot(null);
    setSubmitted(false);
  };

  return (
    <>
      {/* Feedback Button */}
      <motion.button
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-4 right-4 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageSquare size={20} />
      </motion.button>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFeedback(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              {submitted ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-green-500" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
                  <p className="text-gray-600">Your feedback has been submitted successfully.</p>
                </div>
              ) : (
                <>
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Send Feedback</h2>
                      <button
                        onClick={() => setShowFeedback(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Feedback Type */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Feedback Type</label>
                      <div className="flex gap-2">
                        {[
                          { type: 'general' as const, icon: MessageSquare, label: 'General' },
                          { type: 'bug' as const, icon: Bug, label: 'Bug Report' },
                          { type: 'feature' as const, icon: Star, label: 'Feature Request' }
                        ].map(({ type, icon: Icon, label }) => (
                          <button
                            key={type}
                            onClick={() => setFeedbackType(type)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                              feedbackType === type
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon size={16} />
                            <span className="text-sm">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating (for general feedback) */}
                    {feedbackType === 'general' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              <Star size={20} fill={star <= rating ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={
                          feedbackType === 'bug' ? 'Brief description of the bug' :
                          feedbackType === 'feature' ? 'Feature you\'d like to see' :
                          'What\'s on your mind?'
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={
                          feedbackType === 'bug' ? 'Steps to reproduce, expected vs actual behavior...' :
                          feedbackType === 'feature' ? 'Describe the feature and how it would help...' :
                          'Tell us more about your experience...'
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Screenshot */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Screenshot (optional)</label>
                        <button
                          onClick={takeScreenshot}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Camera size={14} />
                          Capture
                        </button>
                      </div>
                      {screenshot && (
                        <div className="relative">
                          <img src={screenshot} alt="Screenshot" className="w-full h-32 object-cover rounded-lg" />
                          <button
                            onClick={() => setScreenshot(null)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={submitFeedback}
                      disabled={!title.trim() || !description.trim() || isSubmitting}
                      className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {isSubmitting ? 'Submitting...' : 'Send Feedback'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};