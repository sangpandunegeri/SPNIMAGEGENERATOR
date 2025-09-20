
import React, { useState, useEffect } from 'react';
import { useApiKey } from '../contexts/ApiKeyContext';
import Button from './Button';
import { TrashIcon, CheckIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKeys, activeApiKey, addApiKey, removeApiKey, setActiveApiKey } = useApiKey();
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewKeyName('');
      setNewKeyValue('');
    }
  }, [isOpen]);

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyName.trim() && newKeyValue.trim()) {
      addApiKey(newKeyName.trim(), newKeyValue.trim());
      setNewKeyName('');
      setNewKeyValue('');
    }
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
        className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="settings-title" className="text-xl font-bold text-white">Manajer Kunci API</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Kunci Tersimpan</h3>
            <div className="bg-gray-900/50 rounded-lg p-3 max-h-48 overflow-y-auto">
              {apiKeys.length > 0 ? (
                <ul className="divide-y divide-gray-700">
                  {apiKeys.map((key) => (
                    <li key={key.key} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setActiveApiKey(key.key)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${activeApiKey === key.key ? 'bg-teal-500 border-teal-400' : 'bg-gray-700 border-gray-600 hover:border-teal-500'}`}
                          title={activeApiKey === key.key ? "Aktif" : "Jadikan Aktif"}
                        >
                          {activeApiKey === key.key && <CheckIcon className="w-4 h-4 text-white" />}
                        </button>
                        <div>
                          <p className="font-semibold text-white">{key.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{`...${key.key.slice(-4)}`}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeApiKey(key.key)}
                        className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
                        title="Hapus Kunci"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-400 py-4">Tidak ada kunci API yang disimpan.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Tambah Kunci Baru</h3>
             <form onSubmit={handleAddKey} className="bg-gray-900/50 rounded-lg p-4 space-y-4">
               <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Nama Panggilan (misalnya, Akun Pribadi)"
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
               <input
                  type="password"
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  placeholder="Kunci API Gemini Anda"
                  className="w-full p-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
                <Button type="submit" className="w-full">Tambah Kunci</Button>
             </form>
             <p className="text-xs text-gray-400 mt-2">
                Dapatkan kunci dari{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                    Google AI Studio
                </a>. Kunci disimpan dengan aman di browser Anda.
            </p>
          </div>

        </div>

        <div className="flex justify-end items-center gap-3 mt-8">
          <Button variant="secondary" onClick={onClose}>Tutup</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
