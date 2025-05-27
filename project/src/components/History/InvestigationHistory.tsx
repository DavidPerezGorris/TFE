import React, { useState } from 'react';
import { Investigation, InvestigationType } from '../../types';
import { Clock, Search, Calendar, Trash2 } from 'lucide-react';
import { format } from '../../utils/formatter';

interface InvestigationHistoryProps {
  investigations: Investigation[];
  onSelectInvestigation: (id: string) => void;
  onDeleteInvestigation: (id: string) => void;
}

const InvestigationHistory: React.FC<InvestigationHistoryProps> = ({
  investigations,
  onSelectInvestigation,
  onDeleteInvestigation
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sort investigations by date (newest first)
  const sortedInvestigations = [...investigations].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Apply filters
  const filteredInvestigations = sortedInvestigations.filter(investigation => {
    // Type filter
    if (typeFilter !== 'all' && investigation.type !== typeFilter) {
      return false;
    }
    
    // Search term (match query string)
    if (searchTerm && !investigation.query.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Group by date
  const groupInvestigationsByDate = () => {
    const groups: Record<string, Investigation[]> = {};
    
    filteredInvestigations.forEach(investigation => {
      const date = new Date(investigation.date);
      const dateKey = date.toDateString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(investigation);
    });
    
    return groups;
  };
  
  const investigationGroups = groupInvestigationsByDate();
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Investigation History
      </h3>
      
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-4">
        <div className="w-full sm:w-2/3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search investigations..."
              className="block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
        </div>
        
        <div className="w-full sm:w-1/3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            {Object.values(InvestigationType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      
      {Object.keys(investigationGroups).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(investigationGroups).map(([dateKey, investigations]) => (
            <div key={dateKey} className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Calendar size={16} />
                <span className="text-sm font-medium">{format.formatDate(new Date(dateKey))}</span>
              </div>
              
              <div className="space-y-2">
                {investigations.map(investigation => (
                  <div 
                    key={investigation.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="p-3 flex justify-between items-center">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => onSelectInvestigation(investigation.id)}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white text-base">
                          {investigation.query}
                        </h4>
                        
                        <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {format.formatTime(new Date(investigation.date))}
                          </span>
                          
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-900">
                            {investigation.type}
                          </span>
                          
                          <span>
                            {investigation.toolIds.length} tool{investigation.toolIds.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onDeleteInvestigation(investigation.id)}
                        className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Delete investigation"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            {investigations.length === 0 
              ? 'No investigations yet. Start your first investigation!'
              : 'No investigations match your filters'}
          </p>
        </div>
      )}
    </div>
  );
};

export default InvestigationHistory;