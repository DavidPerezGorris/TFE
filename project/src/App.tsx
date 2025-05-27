import React, { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import ToolsPage from './pages/ToolsPage';
import InvestigationsPage from './pages/InvestigationsPage';
import HistoryPage from './pages/HistoryPage';
import { Investigation } from './types';
import { getInvestigationById } from './services/investigationService';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation | null>(null);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  
  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };
  
  const handleInvestigationComplete = (investigation: Investigation) => {
    setCurrentInvestigation(investigation);
    
    // Update the investigations list
    setInvestigations(prev => {
      const index = prev.findIndex(inv => inv.id === investigation.id);
      if (index !== -1) {
        // Replace existing investigation
        const updated = [...prev];
        updated[index] = investigation;
        return updated;
      } else {
        // Add new investigation
        return [investigation, ...prev];
      }
    });
    
    // Switch to investigations tab
    setActiveTab('investigations');
  };
  
  const handleSelectInvestigation = (id: string) => {
    const investigation = getInvestigationById(id);
    if (investigation) {
      setCurrentInvestigation(investigation);
      setActiveTab('investigations');
    }
  };
  
  const handleDeleteInvestigation = (id: string) => {
    // Remove from state
    setInvestigations(prev => prev.filter(inv => inv.id !== id));
    
    // If it's the current investigation, clear it
    if (currentInvestigation && currentInvestigation.id === id) {
      setCurrentInvestigation(null);
    }
  };
  
  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-200`}>
      <Header 
        activeTab={activeTab} 
        onChangeTab={setActiveTab} 
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            onInvestigationComplete={handleInvestigationComplete}
            recentInvestigations={investigations}
            onSelectInvestigation={handleSelectInvestigation}
          />
        )}
        
        {activeTab === 'tools' && <ToolsPage />}
        
        {activeTab === 'investigations' && (
          <InvestigationsPage 
            currentInvestigation={currentInvestigation}
            onInvestigationComplete={handleInvestigationComplete}
          />
        )}
        
        {activeTab === 'history' && (
          <HistoryPage 
            onSelectInvestigation={handleSelectInvestigation}
            onDeleteInvestigation={handleDeleteInvestigation}
          />
        )}
      </main>
      
      <footer className="bg-white dark:bg-gray-900 shadow mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            OSINT Compare © {new Date().getFullYear()} - Compare and analyze AI-powered OSINT tools
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;