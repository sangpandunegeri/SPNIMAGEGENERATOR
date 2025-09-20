import React, { useState } from 'react';
import { Loader2, Wand2, Download, Video, Image as ImageIcon } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import TextAreaField from './ui/TextAreaField';
import SelectField from './ui/SelectField';

interface ImageGeneratorPageProps {
    apiKey: string;
    onGenerateVideo: (prompt: string, imageFile: File | null) => void;
}

const ImageGeneratorPage: React.FC<ImageGeneratorPageProps> = ({ apiKey, onGenerateVideo }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3' | '3:4'>('16:9');
    const [result, setResult] = useState<{ url: string, file: File } | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };
    
    const dataURLtoFile = (dataurl: string, filename: string): File => {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) throw new Error('Tidak dapat menentukan tipe mime dari data URL');
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur. Silakan atur di halaman 'Pengaturan'.", 'error');
            return;
        }
        if (!prompt.trim()) {
            showMessage('Prompt tidak boleh kosong.', 'error');
            return;
        }

        setLoading(true);
        setResult(null);
        showMessage('Membuat gambar...', 'info');

        try {
            const base64Image = await generateImage(prompt, aspectRatio, apiKey);
            const imageUrl = `data:image/png;base64,${base64Image}`;
            const imageFile = dataURLtoFile(imageUrl, `generated-image-${Date.now()}.png`);
            setResult({ url: imageUrl, file: imageFile });
            showMessage('Gambar berhasil dibuat!', 'success');
        } catch (error) {
            console.error(error);
            showMessage(`Gagal membuat gambar: ${(error as Error).message}`, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleSendToVideo = () => {
        if (!result) {
            showMessage('Buat gambar terlebih dahulu.', 'error');
            return;
        }
        // Kirim prompt asli yang membuat gambar, dan file gambar itu sendiri.
        onGenerateVideo(prompt, result.file);
    };

    const getMessageBgColor = () => {
        if (messageType === 'success') return 'bg-green-500';
        if (messageType === 'error') return 'bg-red-500';
        return 'bg-blue-500';
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">Image Generator ✨</h2>
            {message && <div className={`p-3 mb-4 rounded-md ${getMessageBgColor()} text-white`}>{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bagian Input */}
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner space-y-6">
                    <h3 className="text-2xl font-bold text-white -mb-2">Prompt Gambar</h3>
                     <TextAreaField
                        label="Masukkan prompt Anda"
                        name="imagePrompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={8}
                        placeholder="Contoh: A cinematic, photorealistic portrait of an astronaut on a neon-lit alien planet, high detail, shot on ARRI Alexa."
                    />
                    <SelectField
                        label="Aspek Rasio"
                        name="aspectRatio"
                        value={aspectRatio}
                        options={[
                            { value: '16:9', label: '16:9 (Landscape)' },
                            { value: '9:16', label: '9:16 (Portrait)' },
                            { value: '1:1', label: '1:1 (Square)' },
                            { value: '4:3', label: '4:3 (Standard)' },
                            { value: '3:4', label: '3:4 (Tall)' },
                        ]}
                        onChange={(e) => setAspectRatio(e.target.value as any)}
                    />
                     <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {loading ? 'Memproses...' : 'Hasilkan Gambar'}
                    </button>
                </div>

                {/* Bagian Output */}
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center min-h-[400px]">
                    <h3 className="text-2xl font-bold text-white mb-4">Hasil</h3>
                    {loading ? (
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
                            <p className="mt-4 text-white text-lg font-semibold">AI sedang melukis...</p>
                        </div>
                    ) : result ? (
                        <div className="w-full text-center">
                            <img src={result.url} alt="Gambar yang Dihasilkan" className="w-full max-h-[400px] object-contain rounded-lg shadow-lg border-2 border-gray-600 mb-4 bg-black" />
                            <div className="flex flex-wrap justify-center gap-4">
                                <a
                                    href={result.url}
                                    download={`promptgen-image-${Date.now()}.png`}
                                    className="inline-flex bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg items-center justify-center gap-2 transition-colors duration-200 shadow-md text-sm"
                                >
                                    <Download className="w-4 h-4" /> Unduh
                                </a>
                                <button
                                    onClick={handleSendToVideo}
                                    className="inline-flex bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg items-center justify-center gap-2 transition-colors duration-200 shadow-md text-sm"
                                >
                                    <Video className="w-4 h-4" /> Kirim ke Video Generator
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4"/>
                            <p className="mt-2 text-sm">Hasil gambar Anda akan muncul di sini.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGeneratorPage;