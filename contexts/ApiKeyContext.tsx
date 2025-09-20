import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

export interface ApiKey {
  name: string;
  key: string;
}

interface ApiKeyContextType {
  apiKeys: ApiKey[];
  activeApiKey: string | null;
  addApiKey: (name: string, key: string) => void;
  removeApiKey: (key: string) => void;
  setActiveApiKey: (key: string | null) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const API_KEYS_STORAGE_KEY = 'gemini-api-keys-list';
const ACTIVE_API_KEY_STORAGE_KEY = 'gemini-active-api-key';

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    try {
      const storedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
      return storedKeys ? JSON.parse(storedKeys) : [];
    } catch (error) {
      console.error("Could not read API keys from local storage", error);
      return [];
    }
  });

  const [activeApiKey, setActiveApiKeyState] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_API_KEY_STORAGE_KEY) || null;
    } catch (error) {
      console.error("Could not read active API key from local storage", error);
      return null;
    }
  });
  
  // Set default active key if one doesn't exist but keys do
  useEffect(() => {
    if (!activeApiKey && apiKeys.length > 0) {
      setActiveApiKey(apiKeys[0].key);
    }
     if (apiKeys.length === 0) {
      setActiveApiKey(null);
    }
  }, [apiKeys, activeApiKey]);

  const addApiKey = useCallback((name: string, key: string) => {
    setApiKeys(prevKeys => {
      const newKeys = [...prevKeys, { name, key }];
      try {
        localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(newKeys));
      } catch (e) { console.error(e); }
      return newKeys;
    });
  }, []);

  const removeApiKey = useCallback((keyToRemove: string) => {
    setApiKeys(prevKeys => {
      const newKeys = prevKeys.filter(k => k.key !== keyToRemove);
      try {
        localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(newKeys));
        if (activeApiKey === keyToRemove) {
          const newActiveKey = newKeys.length > 0 ? newKeys[0].key : null;
          setActiveApiKey(newActiveKey);
        }
      } catch (e) { console.error(e); }
      return newKeys;
    });
  }, [activeApiKey]);
  
  const setActiveApiKey = useCallback((key: string | null) => {
    setActiveApiKeyState(key);
     try {
        if (key) {
            localStorage.setItem(ACTIVE_API_KEY_STORAGE_KEY, key);
        } else {
            localStorage.removeItem(ACTIVE_API_KEY_STORAGE_KEY);
        }
    } catch (error) {
        console.error("Could not write active key to local storage", error);
    }
  }, []);

  return (
    <ApiKeyContext.Provider value={{ apiKeys, activeApiKey, addApiKey, removeApiKey, setActiveApiKey }}>
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
