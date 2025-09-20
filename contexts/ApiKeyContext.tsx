
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const API_KEY_STORAGE_KEY = 'gemini-api-key';

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    try {
      const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      return storedKey || process.env.API_KEY || null;
    } catch (error) {
      console.error("Could not read from local storage", error);
      return process.env.API_KEY || null;
    }
  });

  useEffect(() => {
    try {
        if (apiKey) {
            localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        } else {
            localStorage.removeItem(API_KEY_STORAGE_KEY);
        }
    } catch (error) {
        console.error("Could not write to local storage", error);
    }
  }, [apiKey]);

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
