import React, { useState } from 'react';
import InvestigationForm from '../components/Investigation/InvestigationForm';
import ResultsDisplay from '../components/Investigation/ResultsDisplay';
import ComparisonView from '../components/Investigation/ComparisonView';
import { OsintTool, Investigation, InvestigationType } from '../types';
import { getActiveTools } from '../services/toolService';
import { createInvestigation, runInvestigation, rateToolResult } from '../services/investigationService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Loader2 } from 'lucide-react';

interface InvestigationsPageProps {
  currentInvestigation: Investigation | null;
  onInvestigationComplete: (investigation: Investigation) => void;
}

const InvestigationsPage: React.FC<InvestigationsPageProps> = ({
  currentInvestigation,
  onInvestigationComplete
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('results');
  const activeTools = getActiveTools();
  
  const handleInvestigationSubmit = async (query: string, type: InvestigationType, toolIds: string[]) => {
    setIsLoading(true);
    
    try {
      // Create the investigation
      const investigation = createInvestigation(query, type, toolIds);
      
      // Run the investigation against all selected tools
      const completedInvestigation = await runInvestigation(investigation);
      
      // Notify parent component
      onInvestigationComplete(completedInvestigation);
      
      // Switch to results tab
      setActiveTab('results');
    } catch (error) {
      console.error('Error running investigation:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRateResult = (toolId: string, score: number, notes?: string) => {
    if (currentInvestigation) {
      const updatedInvestigation = rateToolResult(
        currentInvestigation.id,
        toolId,
        score,
        notes
      );
      
      if (updatedInvestigation) {
        onInvestigationComplete(updatedInvestigation);
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Investigation Parameters
          </h2>
          
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center justify-center">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Running investigation...
              </p>
            </div>
          ) : (
            <InvestigationForm 
              tools={activeTools} 
              onSubmit={handleInvestigationSubmit}
            />
          )}
        </div>
        
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Results
          </h2>
          
          {currentInvestigation ? (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6">
                  <button
                    onClick={() => setActiveTab('results')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'results'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Individual Results
                  </button>
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'comparison'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Comparison View
                  </button>
                </nav>
              </div>
              
              <div className="mt-4">
                {activeTab === 'results' ? (
                  <ResultsDisplay 
                    investigation={currentInvestigation} 
                    onRateResult={handleRateResult}
                  />
                ) : (
                  <ComparisonView investigation={currentInvestigation} />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No active investigation. Start a new investigation from the form on the left.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestigationsPage;