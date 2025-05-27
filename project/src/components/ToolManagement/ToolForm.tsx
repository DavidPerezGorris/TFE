import React, { useState, useEffect } from 'react';
import { OsintTool, ToolCategory, ToolCapability } from '../../types';

interface ToolFormProps {
  tool?: OsintTool;
  onSubmit: (tool: Omit<OsintTool, 'id'>) => void;
  onCancel: () => void;
}

const defaultTool: Omit<OsintTool, 'id'> = {
  name: '',
  description: '',
  url: '',
  isActive: true,
  category: ToolCategory.GENERAL,
  capabilities: [],
  responseFormat: 'JSON'
};

const ToolForm: React.FC<ToolFormProps> = ({ tool, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<OsintTool, 'id'>>(
    tool ? { ...tool } : { ...defaultTool }
  );
  
  useEffect(() => {
    if (tool) {
      setFormData({ ...tool });
    } else {
      setFormData({ ...defaultTool });
    }
  }, [tool]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleCapabilityChange = (capability: ToolCapability) => {
    setFormData(prev => {
      const capabilities = [...prev.capabilities];
      
      if (capabilities.includes(capability)) {
        return {
          ...prev,
          capabilities: capabilities.filter(c => c !== capability)
        };
      } else {
        return {
          ...prev,
          capabilities: [...capabilities, capability]
        };
      }
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Tool Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          API URL
        </label>
        <input
          type="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          API Key (optional)
        </label>
        <input
          type="password"
          name="apiKey"
          value={formData.apiKey || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          This key will be stored securely and used for API requests.
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          {Object.values(ToolCategory).map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Capabilities
        </label>
        <div className="space-y-2">
          {Object.values(ToolCapability).map(capability => (
            <div key={capability} className="flex items-center">
              <input
                type="checkbox"
                id={`capability-${capability}`}
                checked={formData.capabilities.includes(capability)}
                onChange={() => handleCapabilityChange(capability)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-700"
              />
              <label
                htmlFor={`capability-${capability}`}
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                {capability}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Response Format
        </label>
        <select
          name="responseFormat"
          value={formData.responseFormat}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="JSON">JSON</option>
          <option value="XML">XML</option>
        </select>
      </div>
      
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-700"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Active (available for investigations)
          </span>
        </label>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {tool ? 'Update Tool' : 'Add Tool'}
        </button>
      </div>
    </form>
  );
};

export default ToolForm;