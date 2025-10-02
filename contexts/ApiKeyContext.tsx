import React, { createContext, useContext, ReactNode } from 'react';

// The API key is now sourced exclusively from environment variables.
// The UI for managing keys is removed, simplifying this context significantly.

interface ApiKeyContextType {
  activeApiKey: string | null;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // As per guidelines, the API key MUST come from process.env.API_KEY.
  // We assume this is configured in the execution environment.
  const activeApiKey = process.env.API_KEY || null;

  return (
    <ApiKeyContext.Provider value={{ activeApiKey }}>
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
