import React from 'react';
import { OsintTool } from '../../types';
import { Settings, Trash2, Power } from 'lucide-react';

interface ToolCardProps {
  tool: OsintTool;
  onEdit: (tool: OsintTool) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ 
  tool, 
  onEdit, 
  onDelete, 
  onToggleActive 
}) => {
  return (
    <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${
      tool.isActive 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
        : 'border-gray-300 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700'
    }`}>
      <div className="p-4 flex justify-between items-start">
        <div>
          <h3 className={`text-lg font-semibold ${
            tool.isActive 
              ? 'text-blue-700 dark:text-blue-400' 
              : 'text-gray-700 dark:text-gray-400'
          }`}>
            {tool.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{tool.description}</p>
          
          <div className="mt-2 space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              <span className="font-medium">Category:</span> {tool.category}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              <span className="font-medium">Capabilities:</span> {tool.capabilities.join(', ')}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              <span className="font-medium">Response Format:</span> {tool.responseFormat}
            </p>
          </div>
          
          <div className="mt-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              tool.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              {tool.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => onToggleActive(tool.id)} 
            className={`p-2 rounded-full transition-colors ${
              tool.isActive 
                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
            }`}
            title={tool.isActive ? "Deactivate tool" : "Activate tool"}
          >
            <Power size={16} />
          </button>
          
          <button 
            onClick={() => onEdit(tool)} 
            className="p-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
            title="Edit tool"
          >
            <Settings size={16} />
          </button>
          
          <button 
            onClick={() => onDelete(tool.id)} 
            className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            title="Delete tool"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;