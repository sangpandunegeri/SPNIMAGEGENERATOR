
import React, { useState, useEffect } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import Button from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useApiKey();
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');

  useEffect(() => {
    setLocalApiKey(apiKey || '');
  }, [apiKey, isOpen]);

  const handleSave = () => {
    setApiKey(localApiKey);
    onClose();
  };

  const handleClearKey = () => {
    setApiKey(null);
    setLocalApiKey('');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="settings-title" className="text-xl font-bold text-white">Pengaturan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-1">
              Kunci API Gemini
            </label>
            <input
              type="password"
              id="api-key"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="Masukkan kunci API Anda di sini"
              className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors placeholder-gray-400"
            />
             <p className="text-xs text-gray-400 mt-2">
                Dapatkan kunci API Anda dari{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                    Google AI Studio
                </a>.
                <br />
                Kunci Anda disimpan dengan aman di browser Anda dan tidak pernah dibagikan.
            </p>
             <p className="text-xs text-yellow-400 font-medium mt-2">
                Peringatan: Jangan bagikan atau ekspos kunci API ini kepada siapa pun.
            </p>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 mt-6">
          <Button variant="danger" onClick={handleClearKey} className="mr-auto">Hapus Kunci</Button>
          <Button variant="secondary" onClick={onClose}>Batal</Button>
          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
