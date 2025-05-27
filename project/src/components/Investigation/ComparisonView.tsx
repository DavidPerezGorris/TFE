import React, { useState } from 'react';
import { Investigation, ToolResult } from '../../types';
import { getToolById } from '../../services/toolService';
import { compareResults, calculateOverallScore } from '../../utils/comparisionMetrics';
import { ArrowLeftRight, ChevronDown, ChevronUp, BarChart } from 'lucide-react';

interface ComparisonViewProps {
  investigation: Investigation;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ investigation }) => {
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    entities: true,
    metrics: true
  });
  
  // Only show completed results
  const completedResults = investigation.results.filter(
    result => result.status === 'completed'
  );
  
  // Toggle tool selection
  const toggleToolSelection = (toolId: string) => {
    setSelectedToolIds(prev => {
      // If already selected, remove it
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId);
      }
      
      // If we already have 2 tools selected, replace the oldest one
      if (prev.length >= 2) {
        return [prev[1], toolId];
      }
      
      // Otherwise add it
      return [...prev, toolId];
    });
  };
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Get tool results for comparison
  const getSelectedResults = (): ToolResult[] => {
    return selectedToolIds.map(
      toolId => completedResults.find(result => result.toolId === toolId)!
    ).filter(Boolean);
  };
  
  // Get comparison data
  const getComparison = () => {
    const results = getSelectedResults();
    if (results.length !== 2) return null;
    
    return compareResults(results[0], results[1]);
  };
  
  const comparison = getComparison();
  const selectedResults = getSelectedResults();
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <ArrowLeftRight size={20} className="mr-2 text-blue-500" />
          Tool Comparison
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {completedResults.map(result => {
            const tool = getToolById(result.toolId);
            const isSelected = selectedToolIds.includes(result.toolId);
            const score = calculateOverallScore(result);
            
            return (
              <button
                key={result.toolId}
                onClick={() => toggleToolSelection(result.toolId)}
                className={`p-3 rounded-lg text-center transition-all ${
                  isSelected 
                    ? 'bg-blue-100 border-2 border-blue-500 dark:bg-blue-900/30 dark:border-blue-600' 
                    : 'bg-gray-100 border border-gray-300 hover:bg-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800'
                }`}
              >
                <p className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">
                  {tool?.name || `Tool ${result.toolId}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Score: {score.toFixed(1)}
                </p>
              </button>
            );
          })}
        </div>
        
        {completedResults.length === 0 && (
          <p className="text-center py-4 text-gray-500 dark:text-gray-400">
            No completed tool results to compare
          </p>
        )}
        
        {completedResults.length > 0 && (
          <p className="text-center mt-3 text-sm text-gray-500 dark:text-gray-400">
            {selectedToolIds.length === 0 
              ? 'Select two tools to compare their results' 
              : selectedToolIds.length === 1 
                ? 'Select one more tool to compare' 
                : 'Comparing 2 tools'}
          </p>
        )}
      </div>
      
      {comparison && selectedResults.length === 2 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Metric
              </h4>
            </div>
            <div className="col-span-1 text-center">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {getToolById(selectedResults[0].toolId)?.name || 'Tool 1'}
              </h4>
            </div>
            <div className="col-span-1 text-center">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {getToolById(selectedResults[1].toolId)?.name || 'Tool 2'}
              </h4>
            </div>
          </div>
          
          {/* Summary Section */}
          <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <div 
              className="bg-gray-50 dark:bg-gray-900 p-3 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('summary')}
            >
              <h5 className="font-medium text-gray-700 dark:text-gray-300">Summary Comparison</h5>
              {expandedSections.summary ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </div>
            
            {expandedSections.summary && (
              <div className="p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedResults[0].standardizedResponse?.summary || 'No summary available'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedResults[1].standardizedResponse?.summary || 'No summary available'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Entities Section */}
          <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <div 
              className="bg-gray-50 dark:bg-gray-900 p-3 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('entities')}
            >
              <h5 className="font-medium text-gray-700 dark:text-gray-300">Entity Comparison</h5>
              {expandedSections.entities ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </div>
            
            {expandedSections.entities && (
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total entities: {selectedResults[0].standardizedResponse?.entities.length || 0}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total entities: {selectedResults[1].standardizedResponse?.entities.length || 0}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unique entities in {getToolById(selectedResults[0].toolId)?.name || 'Tool 1'}
                    </h6>
                    {comparison.uniqueEntities.tool1.length > 0 ? (
                      <ul className="space-y-1">
                        {comparison.uniqueEntities.tool1.map((entity, idx) => (
                          <li 
                            key={idx} 
                            className="text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md"
                          >
                            <span className="text-gray-500 dark:text-gray-400">{entity.type}:</span>{' '}
                            <span className="text-gray-800 dark:text-gray-200">{entity.value}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        No unique entities found
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unique entities in {getToolById(selectedResults[1].toolId)?.name || 'Tool 2'}
                    </h6>
                    {comparison.uniqueEntities.tool2.length > 0 ? (
                      <ul className="space-y-1">
                        {comparison.uniqueEntities.tool2.map((entity, idx) => (
                          <li 
                            key={idx} 
                            className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded-md"
                          >
                            <span className="text-gray-500 dark:text-gray-400">{entity.type}:</span>{' '}
                            <span className="text-gray-800 dark:text-gray-200">{entity.value}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        No unique entities found
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Metrics Section */}
          <div className="mt-4 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <div 
              className="bg-gray-50 dark:bg-gray-900 p-3 flex justify-between items-center cursor-pointer"
              onClick={() => toggleSection('metrics')}
            >
              <h5 className="font-medium text-gray-700 dark:text-gray-300">Performance Metrics</h5>
              {expandedSections.metrics ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </div>
            
            {expandedSections.metrics && (
              <div className="p-3">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Execution Time
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedResults[0].executionTimeMs}ms
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedResults[1].executionTimeMs}ms
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Entity Count
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedResults[0].standardizedResponse?.entities.length || 0}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedResults[1].standardizedResponse?.entities.length || 0}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Confidence
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {(selectedResults[0].standardizedResponse?.confidence || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {(selectedResults[1].standardizedResponse?.confidence || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Overall Score
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {calculateOverallScore(selectedResults[0]).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {calculateOverallScore(selectedResults[1]).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;