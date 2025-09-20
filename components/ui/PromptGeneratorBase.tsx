import React, { useState } from 'react';
import { Copy, Banknote, Sparkles, Wand2, Languages, Loader2, Video, X } from 'lucide-react';
import { Prompt, TargetEngine } from '../../types';
import useLocalStorage from '../../hooks/useLocalStorage';
import { translatePrompt, refinePrompt } from '../../services/geminiService';
import TextAreaField from './TextAreaField';
import SelectField from './SelectField';

const targetEngineOptions = [
    {
        label: "Model Video",
        options: [
            { value: 'veo', label: 'Google VEO' },
            { value: 'runway', label: 'Runway ML' },
            { value: 'kling', label: 'Kling' },
        ]
    }
];

interface PromptGeneratorBaseProps {
    title: string;
    mode: string;
    children: (displayPrompt: (prompt: string) => void, loading: boolean, targetEngine: TargetEngine) => React.ReactNode;
    getFormData: () => any;
    apiKey: string;
    onGenerateVideo: (prompt: string, imageFile: File | null) => void;
    imageFile?: File | null;
}

const PromptGeneratorBase: React.FC<PromptGeneratorBaseProps> = ({ title, mode, children, getFormData, apiKey, onGenerateVideo, imageFile }) => {
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [prompts, setPrompts] = useLocalStorage<Prompt[]>('prompts', []);
    
    const [translatedPrompt, setTranslatedPrompt] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
    const [refineInstruction, setRefineInstruction] = useState('');
    const [isRefining, setIsRefining] = useState(false);
    
    const [targetEngine, setTargetEngine] = useState<TargetEngine>('veo');


    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 4000);
    };
    
    const displayPrompt = (finalPrompt: string) => {
        setGeneratedPrompt(finalPrompt);
        setTranslatedPrompt('');
        showMessage("Prompt video berhasil dibuat!", "success");
    };

    const handleCopy = (textToCopy: string, type: string) => {
        navigator.clipboard.writeText(textToCopy);
        showMessage(`${type} berhasil disalin!`, "success");
    };

    const savePromptToBank = () => {
        if (!generatedPrompt) {
            showMessage("Tidak ada prompt untuk disimpan.", "error");
            return;
        }
        const newPrompt = {
            id: crypto.randomUUID(),
            promptText: generatedPrompt,
            sourceData: getFormData(),
            mode: mode,
            timestamp: { toDate: () => new Date() }, // Simulate Firestore timestamp
        };
        setPrompts([newPrompt, ...prompts]);
        showMessage("Prompt berhasil disimpan ke Bank!", "success");
    };

    const handleTranslatePrompt = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", "error");
            return;
        }
        const textToTranslate = generatedPrompt;
        if (!textToTranslate) {
            showMessage("Tidak ada prompt untuk diterjemahkan.", "error");
            return;
        }
        setIsTranslating(true);
        showMessage("Menerjemahkan...", "info");
        try {
            const result = await translatePrompt(textToTranslate, apiKey);
            setTranslatedPrompt(result);
            showMessage("Berhasil diterjemahkan!", "success");
        } catch (error) {
            showMessage(`Gagal menerjemahkan: ${(error as Error).message}`, "error");
        } finally {
            setIsTranslating(false);
        }
    };

    const handleRefinePrompt = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", "error");
            return;
        }
        if (!refineInstruction.trim()) {
            showMessage("Instruksi perbaikan tidak boleh kosong.", "error");
            return;
        }
        setIsRefining(true);
        showMessage("AI sedang memperbaiki prompt Anda...", "info");
        try {
            const newPrompt = await refinePrompt(generatedPrompt, refineInstruction, apiKey);
            setGeneratedPrompt(newPrompt);
            showMessage("Prompt berhasil diperbaiki!", "success");
            setIsRefineModalOpen(false);
            setRefineInstruction('');
        } catch (error) {
            showMessage(`Gagal memperbaiki prompt: ${(error as Error).message}`, "error");
        } finally {
            setIsRefining(false);
        }
    };

    const getMessageBgColor = () => {
        if (messageType === 'success') return 'bg-green-500';
        if (messageType === 'error') return 'bg-red-500';
        return 'bg-blue-500';
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">{title}</h2>
            {message && <div className={`p-3 mb-4 rounded-md ${getMessageBgColor()} text-white`}>{message}</div>}

            <div className="mb-6 max-w-sm">
                <SelectField 
                    label="Target Model Video" 
                    name="targetEngine" 
                    value={targetEngine} 
                    onChange={(e) => setTargetEngine(e.target.value as TargetEngine)}
                    options={targetEngineOptions}
                    tooltip="Pilih model AI tujuan. Prompt yang dihasilkan akan dioptimalkan untuk model ini."
                />
            </div>

            {children(displayPrompt, false, targetEngine)}

            {generatedPrompt && (
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner mt-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Hasil Prompt (untuk {targetEngine.toUpperCase()}):</h3>
                    <div className="relative bg-gray-900 p-4 rounded-md border border-gray-600 mb-4">
                        <p className="text-gray-200 whitespace-pre-wrap">{generatedPrompt}</p>
                        <button onClick={() => handleCopy(generatedPrompt, 'Prompt')} className="absolute top-2 right-2 p-2 rounded-full bg-gray-600 hover:bg-gray-500"><Copy className="w-4 h-4" /></button>
                    </div>

                    {translatedPrompt && (
                         <div className="mt-6">
                             <h3 className="text-xl font-semibold text-white mb-4">Terjemahan:</h3>
                             <div className="relative bg-gray-900 p-4 rounded-md border border-gray-600">
                                 <p className="text-gray-200 whitespace-pre-wrap">{translatedPrompt}</p>
                                  <button onClick={() => handleCopy(translatedPrompt, 'Terjemahan')} className="absolute top-2 right-2 p-2 rounded-full bg-gray-600 hover:bg-gray-500"><Copy className="w-4 h-4" /></button>
                             </div>
                         </div>
                    )}
                    
                    <div className="flex flex-wrap gap-4 justify-end items-center mt-6">
                         <button onClick={handleTranslatePrompt} disabled={isTranslating} className="bg-cyan-600 hover:bg-cyan-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                            {isTranslating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Languages className="w-5 h-5" />} {isTranslating ? 'Menerjemahkan...' : 'Terjemahkan'}
                        </button>
                        <button onClick={() => setIsRefineModalOpen(true)} className="bg-yellow-600 hover:bg-yellow-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5" /> Perbaiki Prompt
                        </button>
                        <div className="relative group">
                            <button onClick={() => onGenerateVideo(generatedPrompt, imageFile || null)} className="bg-purple-600 hover:bg-purple-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                <Video className="w-5 h-5" /> Buat Video
                            </button>
                             <span className="absolute bottom-full right-0 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Buka halaman Video Generator dengan prompt ini.</span>
                        </div>
                         <div className="relative group">
                            <button onClick={savePromptToBank} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                <Banknote className="w-5 h-5" /> Simpan ke Bank
                            </button>
                             <span className="absolute bottom-full right-0 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Simpan hasil prompt video dan semua pengaturannya ke Bank Prompt untuk digunakan lagi nanti.</span>
                        </div>
                    </div>
                </div>
            )}

            {isRefineModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setIsRefineModalOpen(false)}>
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 animate-zoomIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-blue-400">Perbaiki Prompt dengan AI</h3>
                             <button onClick={() => setIsRefineModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Prompt Saat Ini:</label>
                                <div className="bg-gray-900 p-3 rounded-md text-gray-400 text-sm max-h-32 overflow-y-auto border border-gray-600">
                                    {generatedPrompt}
                                </div>
                            </div>
                            <TextAreaField
                                label="Instruksi Perbaikan Anda"
                                name="refineInstruction"
                                value={refineInstruction}
                                onChange={(e) => setRefineInstruction(e.target.value)}
                                rows={4}
                                placeholder="Contoh: buat lebih dramatis, fokus pada ekspresi karakter, ganti gaya menjadi horor."
                            />
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setIsRefineModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Batal</button>
                            <button onClick={handleRefinePrompt} disabled={isRefining || !refineInstruction.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {isRefining ? <Loader2 className="w-5 h-5 animate-spin"/> : <Wand2 className="w-5 h-5" />}
                                {isRefining ? 'Memperbaiki...' : 'Hasilkan Perbaikan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PromptGeneratorBase;