import React, { useState } from 'react';
import { Search, Copy, FileInput, Trash2 } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Prompt } from '../types';

interface PromptBankPageProps {
    onPromptLoad: (promptData: any) => void;
}

const PromptBankPage: React.FC<PromptBankPageProps> = ({ onPromptLoad }) => {
    const [prompts, setPrompts] = useLocalStorage<Prompt[]>('prompts', []);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMode, setFilterMode] = useState('all');
    const [message, setMessage] = useState('');

    const showMessage = (msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleCopyPrompt = (text: string) => {
        navigator.clipboard.writeText(text);
        showMessage("Prompt berhasil disalin!");
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Anda yakin ingin menghapus prompt ini?")) {
            setPrompts(prompts.filter(p => p.id !== id));
            showMessage("Prompt berhasil dihapus!");
        }
    };

    const filteredPrompts = prompts
        .filter(prompt => {
            const matchesSearch = prompt.promptText.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMode = filterMode === 'all' || prompt.mode === filterMode;
            return matchesSearch && matchesMode;
        })
        .sort((a, b) => new Date(b.timestamp.toDate()).getTime() - new Date(a.timestamp.toDate()).getTime());

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">Bank Prompt 🏦</h2>
            {message && <div className="p-3 mb-4 rounded-md bg-green-500 text-white">{message}</div>}

            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-700 p-4 rounded-lg shadow-inner">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Cari prompt..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 bg-gray-800 rounded-lg border border-gray-600"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
                <select
                    value={filterMode}
                    onChange={(e) => setFilterMode(e.target.value)}
                    className="p-3 bg-gray-800 rounded-lg border border-gray-600"
                >
                    <option value="all">Semua Mode</option>
                    <option value="Manual Mode">Mode Manual</option>
                    <option value="One Stop Motion Shot">One Stop Motion Shot</option>
                </select>
            </div>

            {filteredPrompts.length === 0 ? (
                <p className="text-gray-400">Tidak ada prompt yang ditemukan.</p>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredPrompts.map(prompt => (
                        <div key={prompt.id} className="bg-gray-700 p-5 rounded-lg shadow-md flex flex-col">
                            <div>
                                <p className="text-sm text-blue-300 font-semibold">{prompt.mode}</p>
                                <p className="text-xs text-gray-400 mb-2">
                                    {new Date(prompt.timestamp.toDate()).toLocaleString()}
                                </p>
                                <p className="text-white whitespace-pre-wrap text-sm mb-4 line-clamp-4">{prompt.promptText}</p>
                            </div>
                            <div className="flex gap-2 mt-auto pt-4 border-t border-gray-600">
                                <button onClick={() => handleCopyPrompt(prompt.promptText)} className="bg-blue-600 text-sm py-2 px-3 rounded-lg flex items-center gap-1"><Copy className="w-4 h-4" /> Salin</button>
                                {prompt.sourceData && (
                                    <div className="relative group">
                                        <button onClick={() => onPromptLoad(prompt)} className="bg-purple-600 text-sm py-2 px-3 rounded-lg flex items-center gap-1"><FileInput className="w-4 h-4" /> Muat</button>
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Muat ulang semua pengaturan prompt ini ke halaman generatornya.</span>
                                    </div>
                                )}
                                <button onClick={() => handleDelete(prompt.id)} className="bg-red-600 text-sm py-2 px-3 rounded-lg flex items-center gap-1"><Trash2 className="w-4 h-4" /> Hapus</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromptBankPage;