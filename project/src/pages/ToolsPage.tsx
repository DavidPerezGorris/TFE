import React from 'react';
import ToolList from '../components/ToolManagement/ToolList';
import { OsintTool } from '../types';
import { getAllTools, addTool, updateTool, deleteTool, toggleToolActive } from '../services/toolService';

const ToolsPage: React.FC = () => {
  const tools = getAllTools();
  
  const handleAddTool = (tool: Omit<OsintTool, 'id'>) => {
    addTool(tool);
  };
  
  const handleUpdateTool = (id: string, updates: Partial<OsintTool>) => {
    updateTool(id, updates);
  };
  
  const handleDeleteTool = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tool?')) {
      deleteTool(id);
    }
  };
  
  const handleToggleTool = (id: string) => {
    toggleToolActive(id);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <ToolList
        tools={tools}
        onAddTool={handleAddTool}
        onUpdateTool={handleUpdateTool}
        onDeleteTool={handleDeleteTool}
        onToggleTool={handleToggleTool}
      />
    </div>
  );
};

export default ToolsPage;