import React, { useState } from 'react';
import { InvestigationType, OsintTool } from '../../types';
import { Search, AlertCircle } from 'lucide-react';

interface InvestigationFormProps {
  tools: OsintTool[];
  onSubmit: (query: string, type: InvestigationType, toolIds: string[]) => void;
}

const InvestigationForm: React.FC<InvestigationFormProps> = ({ tools, onSubmit }) => {
  const [query, setQuery] = useState('');
  const [investigationType, setInvestigationType] = useState<InvestigationType>(InvestigationType.GENERIC);
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ query?: string; tools?: string }>({});
  
  const activeTools = tools.filter(tool => tool.isActive);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { query?: string; tools?: string } = {};
    
    // Validate query
    if (!query.trim()) {
      newErrors.query = 'Query is required';
    }
    
    // Validate at least one tool is selected
    if (selectedToolIds.length === 0) {
      newErrors.tools = 'Select at least one tool';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors and submit
    setErrors({});
    onSubmit(query, investigationType, selectedToolIds);
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInvestigationType(e.target.value as InvestigationType);
  };
  
  const handleToolSelection = (toolId: string) => {
    setSelectedToolIds(prev => {
      if (prev.includes(toolId)) {
        return prev.filter(id => id !== toolId);
      } else {
        return [...prev, toolId];
      }
    });
  };
  
  const selectAllTools = () => {
    setSelectedToolIds(activeTools.map(tool => tool.id));
  };
  
  const deselectAllTools = () => {
    setSelectedToolIds([]);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Investigation Query
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a domain, email, username, or search term..."
              className={`block w-full pl-10 pr-3 py-2 sm:text-sm border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                errors.query ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
          </div>
          {errors.query && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.query}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Investigation Type
          </label>
          <select
            value={investigationType}
            onChange={handleTypeChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            {Object.values(InvestigationType).map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tools to Use
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={selectAllTools}
                className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Select All
              </button>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <button
                type="button"
                onClick={deselectAllTools}
                className="text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className={`mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${
            errors.tools ? 'border border-red-300 rounded-md p-2' : ''
          }`}>
            {activeTools.length > 0 ? (
              activeTools.map(tool => (
                <div key={tool.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`tool-${tool.id}`}
                    checked={selectedToolIds.includes(tool.id)}
                    onChange={() => handleToolSelection(tool.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-700"
                  />
                  <label
                    htmlFor={`tool-${tool.id}`}
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    {tool.name}
                  </label>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                No active tools available. Please activate or add tools first.
              </p>
            )}
          </div>
          {errors.tools && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle size={14} className="mr-1" />
              {errors.tools}
            </p>
          )}
        </div>
        
        <div className="pt-3">
          <button
            type="submit"
            disabled={activeTools.length === 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            <Search size={18} className="mr-2" />
            Launch Investigation
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvestigationForm;