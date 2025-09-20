import React, { useState, useRef } from 'react';
import { Loader2, Upload, Wand2, Copy, Trash2, Clapperboard, Bot, Video } from 'lucide-react';
import { generateVeoPromptFromImage, combineStoryboardPrompts } from '../services/geminiService';
import TextAreaField from './ui/TextAreaField';

interface StoryboardGeneratorPageProps {
    apiKey: string;
    onGenerateVideo: (prompt: string) => void;
}

interface StoryboardPanel {
    id: string;
    file: File;
    previewUrl: string;
    generatedPrompt: string;
    isGenerating: boolean;
}

const StoryboardGeneratorPage: React.FC<StoryboardGeneratorPageProps> = ({ apiKey, onGenerateVideo }) => {
    const [panels, setPanels] = useState<StoryboardPanel[]>([]);
    const [finalPrompt, setFinalPrompt] = useState('');
    const [isGeneratingFinalPrompt, setIsGeneratingFinalPrompt] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newPanels: StoryboardPanel[] = Array.from(files).map(file => ({
                id: crypto.randomUUID(),
                file,
                previewUrl: URL.createObjectURL(file),
                generatedPrompt: '',
                isGenerating: false,
            }));
            setPanels(prev => [...prev, ...newPanels]);
            setFinalPrompt('');
        }
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleGeneratePanelPrompt = async (panelId: string) => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur. Silakan atur di halaman 'Pengaturan'.", 'error');
            return;
        }

        setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isGenerating: true } : p));
        
        const panel = panels.find(p => p.id === panelId);
        if (!panel) {
            setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isGenerating: false } : p));
            return;
        }

        try {
            const promptText = await generateVeoPromptFromImage(panel.file, apiKey);
            setPanels(prev => prev.map(p => p.id === panelId ? { ...p, generatedPrompt: promptText, isGenerating: false } : p));
        } catch (error) {
            console.error(error);
            showMessage(`Gagal membuat prompt untuk panel: ${(error as Error).message}`, 'error');
            setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isGenerating: false } : p));
        }
    };
    
    const handleUpdatePanelPrompt = (panelId: string, newText: string) => {
        setPanels(prev => prev.map(p => p.id === panelId ? { ...p, generatedPrompt: newText } : p));
    };
    
    const handleDeletePanel = (panelId: string) => {
        setPanels(prev => prev.filter(p => p.id !== panelId));
        showMessage("Panel berhasil dihapus.", "success");
    };

    const handleGenerateFinalPrompt = async () => {
        const panelPrompts = panels.map(p => p.generatedPrompt).filter(Boolean);
        if (panelPrompts.length < panels.length) {
            showMessage("Harap hasilkan prompt untuk semua panel terlebih dahulu.", 'error');
            return;
        }
        
        setIsGeneratingFinalPrompt(true);
        showMessage("Menggabungkan adegan menjadi satu storyboard...", 'info');
        try {
            const combinedPrompt = await combineStoryboardPrompts(panelPrompts, apiKey);
            setFinalPrompt(combinedPrompt);
            showMessage("Prompt storyboard gabungan berhasil dibuat!", 'success');
        } catch(error) {
            console.error(error);
            showMessage(`Gagal membuat prompt gabungan: ${(error as Error).message}`, 'error');
        } finally {
            setIsGeneratingFinalPrompt(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showMessage("Prompt berhasil disalin!", 'success');
    };

    const getMessageBgColor = () => {
        if (messageType === 'success') return 'bg-green-500';
        if (messageType === 'error') return 'bg-red-500';
        return 'bg-blue-500';
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">Storyboard Generator 🎬</h2>
            {message && <div className={`p-3 mb-4 rounded-md ${getMessageBgColor()} text-white`}>{message}</div>}

            <div className="bg-gray-700 p-6 rounded-lg shadow-inner space-y-6">
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Unggah Gambar untuk Storyboard Anda</h3>
                    <p className="text-gray-400 mb-4 text-sm">Anda dapat memilih beberapa gambar sekaligus.</p>
                    <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md mx-auto">
                        <Upload className="w-5 h-5" /> Unggah Gambar
                    </button>
                </div>

                {panels.length > 0 && (
                    <div className="space-y-4 border-t border-gray-600 pt-4">
                        {panels.map((panel, index) => (
                            <div key={panel.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-shrink-0 w-full md:w-48 text-center">
                                    <img src={panel.previewUrl} alt={`Panel ${index + 1}`} className="w-full h-auto rounded-lg shadow-md border border-gray-600" />
                                    <span className="text-xs font-bold text-gray-400 mt-2 block">ADEGAN {index + 1}</span>
                                </div>
                                <div className="flex-grow w-full">
                                    <TextAreaField
                                        label={`Prompt untuk Adegan ${index + 1}`}
                                        name={`prompt-${panel.id}`}
                                        value={panel.generatedPrompt}
                                        onChange={(e) => handleUpdatePanelPrompt(panel.id, e.target.value)}
                                        rows={4}
                                        placeholder="Klik 'Hasilkan Prompt' atau tulis manual di sini..."
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <button onClick={() => handleGeneratePanelPrompt(panel.id)} disabled={panel.isGenerating} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                                            {panel.isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                            Hasilkan Prompt
                                        </button>
                                        <button onClick={() => handleDeletePanel(panel.id)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full" title="Hapus Panel">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {panels.length > 0 && (
                <div className="mt-8 bg-gray-700 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold text-white mb-4">Prompt Storyboard Gabungan</h3>
                     <p className="text-gray-400 mb-4 text-sm">
                        Setelah semua prompt adegan siap, gabungkan menjadi satu narasi video yang utuh.
                    </p>
                    <button
                        onClick={handleGenerateFinalPrompt}
                        disabled={isGeneratingFinalPrompt || panels.some(p => !p.generatedPrompt)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGeneratingFinalPrompt ? <Loader2 className="w-5 h-5 animate-spin"/> : <Bot className="w-5 h-5"/>}
                        Hasilkan Prompt Storyboard Gabungan
                    </button>

                     {finalPrompt && (
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold text-white mb-2">Hasil Akhir:</h4>
                            <div className="relative bg-gray-900 p-4 rounded-md border border-gray-600 mb-4">
                                <p className="text-gray-200 whitespace-pre-wrap">{finalPrompt}</p>
                                <button onClick={() => handleCopy(finalPrompt)} className="absolute top-2 right-2 p-2 rounded-full bg-gray-600 hover:bg-gray-500" title="Salin Prompt">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => onGenerateVideo(finalPrompt)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                                >
                                    <Video className="w-5 h-5" /> Kirim ke Video Generator
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StoryboardGeneratorPage;
