import React, { useState } from 'react';
import { Investigation, ToolResult } from '../../types';
import { calculateOverallScore } from '../../utils/comparisionMetrics';
import { getToolById } from '../../services/toolService';
import { 
  Clock, 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  StarHalf,
  Check,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface ResultsDisplayProps {
  investigation: Investigation;
  onRateResult: (toolId: string, score: number, notes?: string) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  investigation,
  onRateResult
}) => {
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  const [ratingToolId, setRatingToolId] = useState<string | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(0);
  const [ratingNotes, setRatingNotes] = useState<string>('');
  
  // Toggle result expansion
  const toggleExpand = (toolId: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [toolId]: !prev[toolId]
    }));
  };
  
  // Open rating modal
  const openRatingModal = (toolId: string, currentScore?: number, currentNotes?: string) => {
    setRatingToolId(toolId);
    setRatingScore(currentScore || 5);
    setRatingNotes(currentNotes || '');
  };
  
  // Submit rating
  const submitRating = () => {
    if (ratingToolId) {
      onRateResult(ratingToolId, ratingScore, ratingNotes);
      setRatingToolId(null);
    }
  };
  
  // Sort results by score (highest first)
  const sortedResults = [...investigation.results].sort((a, b) => {
    const scoreA = calculateOverallScore(a);
    const scoreB = calculateOverallScore(b);
    return scoreB - scoreA;
  });
  
  // Get the status icon based on result status
  const getStatusIcon = (result: ToolResult) => {
    switch (result.status) {
      case 'completed':
        return <Check size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      case 'timeout':
        return <AlertTriangle size={16} className="text-yellow-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Investigation Results: <span className="font-bold">{investigation.query}</span>
        </h3>
        
        <div className="space-y-4">
          {sortedResults.map(result => {
            const tool = getToolById(result.toolId);
            const isExpanded = expandedResults[result.toolId] || false;
            const score = calculateOverallScore(result);
            
            return (
              <div 
                key={result.toolId} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-300"
              >
                <div 
                  className="p-4 bg-gray-50 dark:bg-gray-900 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleExpand(result.toolId)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      {getStatusIcon(result)}
                    </div>
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      {tool?.name || `Unknown Tool (${result.toolId})`}
                    </h4>
                    {result.status === 'completed' && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        {result.executionTimeMs}ms
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {result.status === 'completed' && (
                      <div className="flex items-center">
                        <Award size={16} className="text-yellow-500 mr-1" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {score.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    {result.status === 'completed' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-700 dark:text-gray-300">Summary</h5>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {result.standardizedResponse?.summary || 'No summary available'}
                            </p>
                            
                            <h5 className="font-medium text-gray-700 dark:text-gray-300 mt-4">
                              Entities Discovered ({result.standardizedResponse?.entities.length || 0})
                            </h5>
                            {result.standardizedResponse?.entities && result.standardizedResponse.entities.length > 0 ? (
                              <ul className="text-sm space-y-1">
                                {result.standardizedResponse.entities.map((entity, idx) => (
                                  <li 
                                    key={idx} 
                                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded"
                                  >
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">
                                        {entity.type}:
                                      </span>{' '}
                                      <span className="text-gray-700 dark:text-gray-300">
                                        {entity.value}
                                      </span>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      {(entity.confidence * 100).toFixed(0)}% confidence
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No entities discovered
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-700 dark:text-gray-300">Raw Response</h5>
                            <div className="mt-2 bg-gray-100 dark:bg-gray-900 p-3 rounded-md">
                              <pre className="text-xs overflow-auto text-gray-800 dark:text-gray-300 max-h-60">
                                {result.rawResponse}
                              </pre>
                            </div>
                            
                            <div className="mt-4">
                              <h5 className="font-medium text-gray-700 dark:text-gray-300">Your Rating</h5>
                              <div className="mt-2 flex items-center space-x-2">
                                <div className="flex items-center">
                                  {result.score ? (
                                    <>
                                      {[1, 2, 3, 4, 5].map(star => (
                                        <Star 
                                          key={star}
                                          size={18} 
                                          fill={star <= result.score! ? "currentColor" : "none"} 
                                          className={
                                            star <= result.score! 
                                              ? "text-yellow-500" 
                                              : "text-gray-400"
                                          }
                                        />
                                      ))}
                                    </>
                                  ) : (
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      Not rated yet
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openRatingModal(result.toolId, result.score, result.notes);
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
                                >
                                  {result.score ? 'Edit Rating' : 'Rate Results'}
                                </button>
                              </div>
                              {result.notes && (
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic">
                                  "{result.notes}"
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : result.status === 'pending' ? (
                      <div className="text-center py-8">
                        <div className="animate-pulse flex flex-col items-center">
                          <div className="h-12 w-12 bg-blue-200 dark:bg-blue-800 rounded-full"></div>
                          <div className="mt-4 h-4 bg-blue-200 dark:bg-blue-800 rounded w-1/3"></div>
                        </div>
                        <p className="mt-4 text-gray-500 dark:text-gray-400">
                          Processing request...
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <XCircle size={48} className="text-red-500" />
                          <h5 className="mt-4 text-red-600 dark:text-red-400 font-medium">
                            {result.status === 'failed' ? 'Request Failed' : 'Request Timed Out'}
                          </h5>
                        </div>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                          {result.rawResponse || 'No error details available'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Rating Modal */}
      {ratingToolId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Rate Result Quality
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Score
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setRatingScore(score)}
                      className="focus:outline-none"
                    >
                      <Star 
                        size={24} 
                        fill={score <= ratingScore ? "currentColor" : "none"} 
                        className={
                          score <= ratingScore 
                            ? "text-yellow-500" 
                            : "text-gray-400 hover:text-yellow-400"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={ratingNotes}
                  onChange={(e) => setRatingNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  placeholder="What was good or bad about these results?"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setRatingToolId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitRating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;