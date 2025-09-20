import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Wand2, Copy, Video, Bot, Trash2, Image as ImageIcon, Camera, Film, Upload } from 'lucide-react';
import { generateStoryboardFromIdea, continueStoryboardFromFrames, suggestShotsFromDescription, generateImage, suggestCameraMovementFromDescription } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';
import TextAreaField from './ui/TextAreaField';
import SelectField from './ui/SelectField';
import { visualStyleOptions } from '../constants';

interface StoryGeneratorPageProps {
    apiKey: string;
    onGenerateVideo: (prompt: string, imageFile?: File | null) => void;
}

interface StoryFrame {
    sceneNumber: number;
    shotType: string;
    cameraMovement: string;
    mood: string;
    sceneDescription: string;
}

// State for visualization feature, keyed by scene number
interface SuggestedShotsState { [key: number]: string[] }

interface GeneratedImage {
    url: string;
    base64: string;
    mimeType: string;
}
interface GeneratedImagesState { [key: number]: GeneratedImage | undefined }

interface LoadingStates {
    [key: number]: {
        suggestions: boolean;
        image: boolean;
        cameraDetect: boolean;
    }
}

const StoryGeneratorPage: React.FC<StoryGeneratorPageProps> = ({ apiKey, onGenerateVideo }) => {
    const [storyIdea, setStoryIdea] = useLocalStorage('storyGeneratorIdea', '');
    const [visualStyle, setVisualStyle] = useLocalStorage('storyGeneratorVisualStyle', '');
    const [frames, setFrames] = useLocalStorage<StoryFrame[]>('storyGeneratorFrames', []);
    const [finalPrompt, setFinalPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [isContinuing, setIsContinuing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [referenceImage, setReferenceImage] = useState<{ file: File; preview: string; } | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    // State for visualization
    const [suggestedShots, setSuggestedShots] = useLocalStorage<SuggestedShotsState>('storyGeneratorSuggestedShots', {});
    const [generatedImages, setGeneratedImages] = useLocalStorage<GeneratedImagesState>('storyGeneratorGeneratedImages', {});
    const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');


    const formatStoryboardToPrompt = (storyFrames: StoryFrame[], style: string): string => {
        if (storyFrames.length === 0) return '';
        const stylePrefix = style ? `A cinematic video in a ${style} style. ` : '';
        const storyBody = storyFrames
            .map(frame =>
                `Scene ${frame.sceneNumber}: ${frame.sceneDescription}. The shot is a ${frame.shotType}. The camera performs a ${frame.cameraMovement}. The mood is ${frame.mood}.`
            )
            .join(' It then transitions to the next scene. ');
        return stylePrefix + storyBody;
    };

    // Auto-update final prompt whenever frames change
    useEffect(() => {
        const formattedPrompt = formatStoryboardToPrompt(frames, visualStyle);
        setFinalPrompt(formattedPrompt);
    }, [frames, visualStyle]);


    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                showMessage('Ukuran file gambar tidak boleh melebihi 4MB.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setReferenceImage({ file, preview: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
        if (e.target) e.target.value = ''; // Reset file input
    };

    const removeImage = () => {
        setReferenceImage(null);
    };


    const handleGenerate = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur. Silakan atur di halaman 'Pengaturan'.", 'error');
            return;
        }
        if (!storyIdea.trim()) {
            showMessage('Ide cerita tidak boleh kosong.', 'error');
            return;
        }

        setLoading(true);
        setFrames([]);
        setSuggestedShots({});
        setGeneratedImages({});
        setLoadingStates({});
        setFinalPrompt('');
        showMessage('AI sedang menulis dan menyutradarai cerita Anda...', 'info');

        try {
            const generatedFrames: StoryFrame[] = await generateStoryboardFromIdea(storyIdea, visualStyle, apiKey, referenceImage?.file ?? null);
            setFrames(generatedFrames);
            showMessage('Storyboard sinematik berhasil dibuat!', 'success');
        } catch (error) {
            console.error(error);
            showMessage(`Gagal membuat storyboard: ${(error as Error).message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", 'error');
            return;
        }
        if (frames.length === 0) {
            showMessage("Hasilkan storyboard awal terlebih dahulu.", 'error');
            return;
        }

        setIsContinuing(true);
        showMessage("AI sedang melanjutkan cerita Anda...", 'info');
        try {
            const newFrames: StoryFrame[] = await continueStoryboardFromFrames(storyIdea, frames, visualStyle, apiKey, referenceImage?.file ?? null);
            setFrames(prev => [...prev, ...newFrames]);
            showMessage('Cerita berhasil dilanjutkan!', 'success');
        } catch (error) {
            console.error(error);
            showMessage(`Gagal melanjutkan cerita: ${(error as Error).message}`, 'error');
        } finally {
            setIsContinuing(false);
        }
    };
    
    const handleFrameChange = (sceneNumber: number, newDescription: string) => {
        setFrames(prev => prev.map(f => f.sceneNumber === sceneNumber ? { ...f, sceneDescription: newDescription } : f));
    };

    const handleClear = () => {
        if (window.confirm("Anda yakin ingin menghapus storyboard saat ini dari penyimpanan?")) {
            setFrames([]);
            setStoryIdea('');
            setVisualStyle('');
            setSuggestedShots({});
            setGeneratedImages({});
            setLoadingStates({});
            setReferenceImage(null);
            showMessage("Storyboard telah dihapus.", "success");
        }
    };

    // --- Visualization Functions ---
    const handleSuggestShots = async (frame: StoryFrame) => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", 'error');
            return;
        }
        setLoadingStates(prev => ({ ...prev, [frame.sceneNumber]: { ...prev[frame.sceneNumber], suggestions: true } }));
        try {
            const shots = await suggestShotsFromDescription(frame.sceneDescription, apiKey, referenceImage?.file ?? null);
            setSuggestedShots(prev => ({ ...prev, [frame.sceneNumber]: shots }));
        } catch (error) {
            showMessage(`Gagal menyarankan shot: ${(error as Error).message}`, 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, [frame.sceneNumber]: { ...prev[frame.sceneNumber], suggestions: false } }));
        }
    };

    const handleGenerateImage = async (frame: StoryFrame, shot: string) => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", 'error');
            return;
        }
        setLoadingStates(prev => ({ ...prev, [frame.sceneNumber]: { ...prev[frame.sceneNumber], image: true } }));
        
        try {
            // Membuat prompt tunggal yang detail untuk pembuatan gambar dari teks.
            // Logika ini sekarang secara konsisten menggunakan model text-to-image untuk memastikan
            // rasio aspek yang dipilih selalu diterapkan, bahkan jika ada gambar referensi.
            const referenceHint = referenceImage ? `The visual style should be consistent with the main reference image provided for the story. ` : '';
            const imagePrompt = `Cinematic movie frame, ${visualStyle || 'photorealistic'}, ${frame.mood} mood. ${referenceHint}The scene is: "${frame.sceneDescription}". Specifically, visualize this moment: "${shot}".`;

            // Selalu gunakan layanan generateImage, yang mematuhi parameter aspectRatio.
            // Ini memperbaiki bug di mana rasio diabaikan saat gambar referensi ada.
            const newBase64Image = await generateImage(imagePrompt, aspectRatio, apiKey);
            const mimeType = 'image/png'; // generateImage selalu mengembalikan png
    
            const imageUrl = `data:${mimeType};base64,${newBase64Image}`;
            setGeneratedImages(prev => ({
                ...prev,
                [frame.sceneNumber]: {
                    url: imageUrl,
                    base64: newBase64Image,
                    mimeType: mimeType
                }
            }));
        } catch (error) {
            showMessage(`Gagal membuat gambar: ${(error as Error).message}`, 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, [frame.sceneNumber]: { ...prev[frame.sceneNumber], image: false } }));
        }
    };

    const handleDetectCamera = async (frame: StoryFrame) => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", 'error');
            return;
        }
        setLoadingStates(prev => ({ ...prev, [frame.sceneNumber]: { ...prev[frame.sceneNumber], cameraDetect: true } }));
        
        try {
            const result = await suggestCameraMovementFromDescription(frame.sceneDescription, apiKey);
            setFrames(prev => prev.map(f => 
                f.sceneNumber === frame.sceneNumber 
                    ? { ...f, shotType: result.shotType, cameraMovement: result.cameraMovement } 
                    : f
            ));
            showMessage(`Kamera untuk Adegan ${frame.sceneNumber} berhasil dideteksi!`, 'success');
        } catch (error) {
            showMessage(`Gagal mendeteksi kamera: ${(error as Error).message}`, 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, [frame.sceneNumber]: { ...prev[frame.sceneNumber], cameraDetect: false } }));
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
            <h2 className="text-3xl font-bold text-blue-400 mb-2">Pencerita AI ✍️</h2>
            <p className="text-gray-400 mb-6">Ubah satu kalimat ide menjadi storyboard sinematik yang siap diproduksi.</p>
            {message && <div className={`p-3 mb-4 rounded-md ${getMessageBgColor()} text-white`}>{message}</div>}

            <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <TextAreaField
                            label="Masukkan Ide Cerita Anda"
                            name="storyIdea"
                            value={storyIdea}
                            onChange={(e) => setStoryIdea(e.target.value)}
                            rows={4}
                            placeholder="Contoh: seorang detektif kesepian di kota cyberpunk yang menemukan petunjuk tentang android yang hilang..."
                        />
                         <div className="mt-4">
                            <SelectField
                                label="Gaya Visual (Opsional)"
                                name="visualStyle"
                                value={visualStyle}
                                onChange={(e) => setVisualStyle(e.target.value)}
                                options={visualStyleOptions}
                                defaultOption="Pilih Gaya Visual..."
                                tooltip="Gaya visual akan memengaruhi deskripsi yang dihasilkan AI untuk konsistensi."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-1">
                            Referensi Visual (Opsional)
                        </label>
                        <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        {referenceImage ? (
                            <div className="relative w-full">
                                <img src={referenceImage.preview} alt="Pratinjau Referensi" className="w-full h-auto max-h-64 object-contain rounded-lg shadow-md border border-gray-600 bg-gray-800"/>
                                <button onClick={removeImage} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white p-2 rounded-full" title="Hapus Gambar">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => imageInputRef.current?.click()}
                                className="w-full border-2 border-dashed border-gray-500 hover:border-blue-400 text-gray-400 hover:text-blue-400 font-bold py-6 px-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors duration-200 cursor-pointer h-full"
                            >
                                <Upload className="w-8 h-8" />
                                <span>Unggah Gambar Referensi</span>
                                <span className="text-xs text-center">Gunakan sebagai inspirasi visual untuk karakter, gaya, atau lingkungan.</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-6">
                    <button onClick={handleGenerate} disabled={loading || isContinuing} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                        {loading ? 'Menghasilkan...' : 'Hasilkan Storyboard Baru'}
                    </button>
                    {frames.length > 0 && (
                         <button onClick={handleContinue} disabled={loading || isContinuing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
                            {isContinuing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                            {isContinuing ? 'Melanjutkan...' : 'Lanjutkan Cerita'}
                        </button>
                    )}
                    <button onClick={handleClear} disabled={loading || isContinuing || frames.length === 0} className="bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
                        <Trash2 className="w-5 h-5" /> Hapus
                    </button>
                </div>
            </div>
            
            {(loading && frames.length === 0) && (
                <div className="text-center p-8"><Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" /></div>
            )}

            {frames.length > 0 && (
                <div className="mt-8 space-y-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">Storyboard yang Dihasilkan</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {frames.map((frame) => (
                                <div key={frame.sceneNumber} className="bg-gray-700 p-4 rounded-lg shadow-lg border-l-4 border-blue-500 flex flex-col">
                                    <h4 className="font-bold text-lg text-white mb-2">Adegan {frame.sceneNumber}</h4>
                                    <TextAreaField
                                        label="Deskripsi Adegan"
                                        name={`desc-${frame.sceneNumber}`}
                                        value={frame.sceneDescription}
                                        onChange={(e) => handleFrameChange(frame.sceneNumber, e.target.value)}
                                        rows={5}
                                        className="mb-1"
                                    />
                                    <button 
                                        onClick={() => handleDetectCamera(frame)} 
                                        disabled={!frame.sceneDescription.trim() || !!loadingStates[frame.sceneNumber]?.cameraDetect}
                                        className="bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-2 px-3 rounded-lg flex items-center gap-2 disabled:opacity-50 text-xs w-full justify-center mb-3"
                                    >
                                        {loadingStates[frame.sceneNumber]?.cameraDetect ? <Loader2 className="w-4 h-4 animate-spin"/> : <Film className="w-4 h-4"/>}
                                        {loadingStates[frame.sceneNumber]?.cameraDetect ? 'Mendeteksi...' : 'Deteksi Tipe Shot & Gerakan Kamera'}
                                    </button>
                                    <div className="text-xs text-gray-400 space-y-1 mb-4">
                                        <p><span className="font-semibold text-cyan-400">Shot:</span> {frame.shotType}</p>
                                        <p><span className="font-semibold text-cyan-400">Gerakan:</span> {frame.cameraMovement}</p>
                                        <p><span className="font-semibold text-cyan-400">Suasana:</span> {frame.mood}</p>
                                    </div>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-600">
                                        <h5 className="text-sm font-semibold text-white mb-2">Visualisasikan Frame</h5>
                                        
                                        <div className="flex items-center gap-2 mb-3">
                                            <label className="text-xs text-gray-400 font-semibold">Rasio Aspek:</label>
                                            <button 
                                                onClick={() => setAspectRatio('16:9')}
                                                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${aspectRatio === '16:9' ? 'bg-blue-600 text-white shadow' : 'bg-gray-600 hover:bg-gray-500'}`}
                                            >
                                                16:9
                                            </button>
                                            <button 
                                                onClick={() => setAspectRatio('9:16')}
                                                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${aspectRatio === '9:16' ? 'bg-blue-600 text-white shadow' : 'bg-gray-600 hover:bg-gray-500'}`}
                                            >
                                                9:16
                                            </button>
                                        </div>

                                        <div className="mb-3">
                                            {(() => {
                                                const isLoading = loadingStates[frame.sceneNumber]?.image;
                                                const image = generatedImages[frame.sceneNumber];
                                                if (isLoading) {
                                                    return (
                                                        <div className="flex justify-center items-center w-full aspect-video bg-gray-800 rounded-md">
                                                            <Loader2 className="w-8 h-8 animate-spin" />
                                                        </div>
                                                    );
                                                }
                                                if (image) {
                                                    return (
                                                        <img src={image.url} alt={`Visualisasi untuk adegan ${frame.sceneNumber}`} className="w-full h-auto rounded-md border-2 border-gray-500" />
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>

                                        <button onClick={() => handleSuggestShots(frame)} disabled={!!loadingStates[frame.sceneNumber]?.suggestions} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-lg flex items-center gap-2 disabled:opacity-50 text-xs">
                                            {loadingStates[frame.sceneNumber]?.suggestions ? <Loader2 className="w-4 h-4 animate-spin"/> : <Camera className="w-4 h-4"/>}
                                            {loadingStates[frame.sceneNumber]?.suggestions ? 'Menyarankan...' : (suggestedShots[frame.sceneNumber]?.length > 0 ? 'Sarankan Lagi' : 'Sarankan Shot')}
                                        </button>

                                        {suggestedShots[frame.sceneNumber]?.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {suggestedShots[frame.sceneNumber]?.map(shot => (
                                                    <button key={shot} onClick={() => handleGenerateImage(frame, shot)} disabled={!!loadingStates[frame.sceneNumber]?.image} className="bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded-full flex items-center gap-2 disabled:opacity-50 text-xs">
                                                        {loadingStates[frame.sceneNumber]?.image ? <Loader2 className="w-4 h-4 animate-spin"/> : <ImageIcon className="w-4 h-4"/>}
                                                        {shot}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
                        <h3 className="text-xl font-semibold text-white mb-4">Prompt Video Gabungan</h3>
                        <div className="relative bg-gray-900 p-4 rounded-md border border-gray-600 mb-4">
                            <p className="text-gray-200 whitespace-pre-wrap">{finalPrompt}</p>
                            <button onClick={() => handleCopy(finalPrompt)} className="absolute top-2 right-2 p-2 rounded-full bg-gray-600 hover:bg-gray-500" title="Salin Prompt">
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <button onClick={() => onGenerateVideo(finalPrompt, referenceImage?.file)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                            <Video className="w-5 h-5" /> Kirim ke Video Generator
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryGeneratorPage;