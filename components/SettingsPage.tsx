import React, { useState } from 'react';
import { Eye, EyeOff, Save } from 'lucide-react';

interface SettingsPageProps {
    apiKey: string;
    setApiKey: (key: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ apiKey, setApiKey }) => {
    const [localApiKey, setLocalApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [message, setMessage] = useState('');

    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleSave = () => {
        if (!localApiKey.trim()) {
            showMessage("API Key tidak boleh kosong.");
            return;
        }
        setApiKey(localApiKey);
        setLocalApiKey('');
        showMessage("API Key berhasil disimpan!");
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">Pengaturan ⚙️</h2>
            {message && (
                <div className="p-3 mb-4 rounded-md bg-green-500 text-white">
                    {message}
                </div>
            )}

            <div className="bg-gray-700 p-6 rounded-lg shadow-inner mb-8">
                <label className="block text-gray-300 text-lg font-semibold mb-3" htmlFor="apiKeyInput">
                    API Key Pribadi Anda (Gemini API)
                </label>
                <div className="relative mb-4">
                    <input
                        type={showApiKey ? "text" : "password"}
                        id="apiKeyInput"
                        value={localApiKey}
                        onChange={(e) => setLocalApiKey(e.target.value)}
                        placeholder="Masukkan API Key baru di sini..."
                        className="w-full p-3 pr-10 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        title={showApiKey ? "Sembunyikan" : "Tampilkan"}
                    >
                        {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!localApiKey.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5" /> Simpan API Key
                </button>
                <p className="text-gray-400 text-sm mt-4">
                    Kunci API Anda disimpan dengan aman di penyimpanan lokal peramban Anda.
                </p>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-white mb-4">API Key Tersimpan:</h3>
                {apiKey ? (
                    <p className="text-gray-200 font-mono break-all bg-gray-900 p-4 rounded-md border border-gray-600">
                        {`...${apiKey.slice(-6)}`}
                    </p>
                ) : (
                    <p className="text-gray-400">Belum ada API Key yang tersimpan.</p>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
