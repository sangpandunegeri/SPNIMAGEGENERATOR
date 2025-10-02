

import React from 'react';
import Button from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // Fix: The API key management UI has been removed as per the new guidelines.
  // The API key must be provided via the `process.env.API_KEY` environment variable.
  // This component now displays a message informing the user about this change.
  // This resolves the errors caused by trying to access deprecated properties
  // from the `useApiKey` hook.
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
        
        <div>
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Konfigurasi Kunci API</h3>
            <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                <p className="text-gray-300">
                    Untuk meningkatkan keamanan, pengelolaan kunci API sekarang ditangani melalui variabel lingkungan.
                </p>
                <p className="text-gray-300">
                    Aplikasi ini secara otomatis menggunakan kunci yang disediakan di <code>process.env.API_KEY</code>. Tidak ada lagi konfigurasi yang diperlukan di dalam aplikasi.
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
