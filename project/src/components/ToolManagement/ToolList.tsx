import React, { useState } from 'react';
import { OsintTool } from '../../types';
import ToolCard from './ToolCard';
import ToolForm from './ToolForm';
import { Plus, Filter } from 'lucide-react';

interface ToolListProps {
  tools: OsintTool[];
  onAddTool: (tool: Omit<OsintTool, 'id'>) => void;
  onUpdateTool: (id: string, tool: Partial<OsintTool>) => void;
  onDeleteTool: (id: string) => void;
  onToggleTool: (id: string) => void;
}

const ToolList: React.FC<ToolListProps> = ({
  tools,
  onAddTool,
  onUpdateTool,
  onDeleteTool,
  onToggleTool
}) => {
  const [isAddingTool, setIsAddingTool] = useState(false);
  const [editingTool, setEditingTool] = useState<OsintTool | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleEditTool = (tool: OsintTool) => {
    setEditingTool(tool);
    setIsAddingTool(false);
  };
  
  const handleToolSubmit = (toolData: Omit<OsintTool, 'id'>) => {
    if (editingTool) {
      onUpdateTool(editingTool.id, toolData);
      setEditingTool(null);
    } else {
      onAddTool(toolData);
      setIsAddingTool(false);
    }
  };
  
  const handleCancel = () => {
    setIsAddingTool(false);
    setEditingTool(null);
  };
  
  const filteredTools = tools.filter(tool => {
    // Apply active/inactive filter
    if (filter === 'active' && !tool.isActive) return false;
    if (filter === 'inactive' && tool.isActive) return false;
    
    // Apply category filter
    if (categoryFilter !== 'all' && tool.category !== categoryFilter) return false;
    
    // Apply search term
    if (searchTerm && !tool.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !tool.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Get unique categories from tools
  const categories = ['all', ...new Set(tools.map(tool => tool.category))];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">OSINT Tools</h2>
        <button
          onClick={() => {
            setIsAddingTool(true);
            setEditingTool(null);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          <Plus size={16} className="mr-2" />
          Add Tool
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        {(isAddingTool || editingTool) ? (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingTool ? 'Edit Tool' : 'Add New Tool'}
            </h3>
            <ToolForm 
              tool={editingTool || undefined} 
              onSubmit={handleToolSubmit} 
              onCancel={handleCancel} 
            />
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tools..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white pl-3 pr-10 py-2"
                  />
                  <Filter 
                    size={16} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="all">All Tools</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="all">All Categories</option>
                  {Object.values(categories).map(category => (
                    category !== 'all' && (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    )
                  ))}
                </select>
              </div>
            </div>
            
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onEdit={handleEditTool}
                    onDelete={onDeleteTool}
                    onToggleActive={onToggleTool}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filter !== 'all' || categoryFilter !== 'all'
                    ? 'No tools match your current filters'
                    : 'No tools available. Add your first tool to get started!'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ToolList;