import React, { useState, createContext, useContext } from 'react';

interface TabsContextType {
  selectedTab: string;
  setSelectedTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs compound components must be used within Tabs");
  }
  return context;
}

interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className = ""
}) => {
  const [selectedTab, setSelectedTab] = useState(defaultValue);
  
  const handleTabChange = (value: string) => {
    if (onValueChange) {
      onValueChange(value);
    } else {
      setSelectedTab(value);
    }
  };
  
  return (
    <TabsContext.Provider
      value={{
        selectedTab: value ?? selectedTab,
        setSelectedTab: handleTabChange
      }}
    >
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

const TabsList: React.FC<TabsListProps> = ({ children, className = "" }) => {
  return (
    <div className={`inline-flex items-center justify-center rounded-md bg-gray-100 p-1 dark:bg-gray-800 ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
  className = "",
  disabled = false
}) => {
  const { selectedTab, setSelectedTab } = useTabsContext();
  const isSelected = selectedTab === value;
  
  return (
    <button
      role="tab"
      type="button"
      aria-selected={isSelected}
      disabled={disabled}
      onClick={() => setSelectedTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isSelected
          ? "bg-white text-blue-700 shadow-sm dark:bg-gray-700 dark:text-blue-100"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      } ${className}`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
  className = ""
}) => {
  const { selectedTab } = useTabsContext();
  const isSelected = selectedTab === value;
  
  if (!isSelected) return null;
  
  return <div className={className}>{children}</div>;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };