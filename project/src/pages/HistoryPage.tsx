import React from 'react';
import InvestigationHistory from '../components/History/InvestigationHistory';
import { Investigation } from '../types';
import { getAllInvestigations, deleteInvestigation } from '../services/investigationService';

interface HistoryPageProps {
  onSelectInvestigation: (id: string) => void;
  onDeleteInvestigation: (id: string) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectInvestigation,
  onDeleteInvestigation
}) => {
  const investigations = getAllInvestigations();
  
  const handleDeleteInvestigation = (id: string) => {
    if (window.confirm('Are you sure you want to delete this investigation? This action cannot be undone.')) {
      const success = deleteInvestigation(id);
      
      if (success) {
        onDeleteInvestigation(id);
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Investigation History
      </h2>
      
      <InvestigationHistory 
        investigations={investigations}
        onSelectInvestigation={onSelectInvestigation}
        onDeleteInvestigation={handleDeleteInvestigation}
      />
    </div>
  );
};

export default HistoryPage;