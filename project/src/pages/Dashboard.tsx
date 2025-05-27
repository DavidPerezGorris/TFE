import React, { useState } from 'react';
import InvestigationForm from '../components/Investigation/InvestigationForm';
import { OsintTool, Investigation, InvestigationType } from '../types';
import { getActiveTools } from '../services/toolService';
import { createInvestigation, runInvestigation } from '../services/investigationService';
import { PieChart, BarChart2, Search, Clock, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onInvestigationComplete: (investigation: Investigation) => void;
  recentInvestigations: Investigation[];
  onSelectInvestigation: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onInvestigationComplete,
  recentInvestigations,
  onSelectInvestigation
}) => {
  const [isLoading, setIsLoading] = useState(false);
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
    } catch (error) {
      console.error('Error running investigation:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate some mock stats for the dashboard
  const stats = {
    totalInvestigations: recentInvestigations.length,
    toolsUsed: [...new Set(recentInvestigations.flatMap(inv => inv.toolIds))].length,
    avgToolsPerQuery: recentInvestigations.length > 0 
      ? Math.round(recentInvestigations.reduce((sum, inv) => sum + inv.toolIds.length, 0) / recentInvestigations.length * 10) / 10
      : 0
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <Search size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Investigations
            </h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.totalInvestigations}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
            <PieChart size={24} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tools Used
            </h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.toolsUsed}/{activeTools.length}
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
            <BarChart2 size={24} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Avg. Tools Per Query
            </h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.avgToolsPerQuery}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            New Investigation
          </h2>
          
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Running investigation across tools...
              </p>
            </div>
          ) : (
            <InvestigationForm 
              tools={activeTools} 
              onSubmit={handleInvestigationSubmit}
            />
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Investigations
          </h2>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            {recentInvestigations.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentInvestigations.slice(0, 5).map(investigation => (
                  <div 
                    key={investigation.id} 
                    className="py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-2 rounded transition-colors"
                    onClick={() => onSelectInvestigation(investigation.id)}
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">
                        {investigation.query}
                      </h4>
                      <span className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs">
                        {investigation.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {new Date(investigation.date).toLocaleString()}
                      </span>
                      <span>
                        {investigation.toolIds.length} tool{investigation.toolIds.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No investigations yet. Start your first investigation!
                </p>
              </div>
            )}
            
            {recentInvestigations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => onChangeTab('history')}
                  className="flex items-center justify-center w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  View all investigations
                  <ArrowRight size={16} className="ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;