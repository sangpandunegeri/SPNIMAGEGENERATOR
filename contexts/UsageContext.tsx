import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

interface UsageData {
  date: string; // YYYY-MM-DD
  count: number;
}

interface UsageContextType {
  usageCount: number;
  incrementUsage: (count: number) => void;
}

const UsageContext = createContext<UsageContextType | undefined>(undefined);

const USAGE_STORAGE_KEY = 'gemini-usage-tracker';

export const UsageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usageCount, setUsageCount] = useState<number>(0);

  useEffect(() => {
    // This effect runs once on mount to initialize the state from localStorage
    try {
      const storedData = localStorage.getItem(USAGE_STORAGE_KEY);
      const today = new Date().toISOString().split('T')[0];
      
      if (storedData) {
        const parsedData: UsageData = JSON.parse(storedData);
        if (parsedData.date === today) {
          setUsageCount(parsedData.count);
        } else {
          // It's a new day, reset the counter
          localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
        }
      } else {
        // No data stored, initialize for today
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
      }
    } catch (error) {
      console.error("Could not read or initialize usage data from local storage", error);
    }
  }, []);

  const incrementUsage = useCallback((count: number) => {
    setUsageCount(prevCount => {
      const newCount = prevCount + count;
      try {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));
      } catch (error) {
        console.error("Could not write usage data to local storage", error);
      }
      return newCount;
    });
  }, []);

  return (
    <UsageContext.Provider value={{ usageCount, incrementUsage }}>
      {children}
    </UsageContext.Provider>
  );
};

export const useUsage = (): UsageContextType => {
  const context = useContext(UsageContext);
  if (context === undefined) {
    throw new Error('useUsage must be used within a UsageProvider');
  }
  return context;
};
