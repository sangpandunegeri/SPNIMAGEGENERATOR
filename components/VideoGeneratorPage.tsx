import React, { useState, useEffect } from 'react';
import { Loader2, Upload, Wand2, Download, Trash2, Video, RefreshCw, Plus } from 'lucide-react';
import { generateVideo } from '../services/geminiService';
import TextAreaField from './ui/TextAreaField';
import SelectField from './ui/SelectField';

const loadingMessages = [
    "Menginisialisasi VEO...",
    "Menganalisis prompt Anda...",
    "Menyusun narasi visual...",
    "Proses ini bisa memakan waktu beberapa menit, harap tunggu.",
    "Merender frame awal...",
    "Menambahkan detail gerakan...",
    "Hampir selesai, menggabungkan audio visual...",
    "Masih bekerja keras, terima kasih atas kesabaran Anda.",
];

interface VideoJob {
    id: string;
    prompt: string;
    imageFile: File | null;
    imagePreview: string | null;
}

interface VideoResult {
    jobId: string;
    originalPrompt: string;
    urls: string[];
    error?: string;
}

interface VideoGeneratorPageProps {
    apiKey: string;
    promptData: { prompt: string, imageFile: File | null } | null;
    onLoadComplete: () => void;
}

const VideoGeneratorPage: React.FC<VideoGeneratorPageProps> = ({ apiKey, promptData, onLoadComplete }) => {
    const [jobs, setJobs] = useState<VideoJob[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);
    const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
    const [results, setResults] = useState<VideoResult[]>([]);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    
    // Global settings for the batch
    const [numberOfVideos, setNumberOfVideos] = useState(1);
    const [quality, setQuality] = useState('1080p');
    const [model, setModel] = useState('veo-2.0-generate-001');
    const [aspectRatio, setAspectRatio] = useState('16:9');

    // Effect to handle prompt loaded from another page
    useEffect(() => {
        if (promptData) {
            const newJob: VideoJob = {
                id: crypto.randomUUID(),
                prompt: promptData.prompt,
                imageFile: promptData.imageFile,
                imagePreview: null
            };

            if (promptData.imageFile) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newJob.imagePreview = reader.result as string;
                    setJobs([newJob]); // Set jobs after preview is created
                };
                reader.readAsDataURL(promptData.imageFile);
            } else {
                setJobs([newJob]);
            }
            
            showMessage("Prompt berhasil dimuat!", "success");
            onLoadComplete();
        } else if (jobs.length === 0) {
            // Add one empty job by default if the page is opened directly
            addJob();
        }
    }, [promptData, onLoadComplete]);

    // Loading message rotator
    useEffect(() => {
        let interval: ReturnType<typeof setTimeout>;
        if (isLoading) {
            let messageIndex = 0;
            interval = setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[messageIndex]);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };
    
    const addJob = () => {
        setJobs(prev => [...prev, {
            id: crypto.randomUUID(),
            prompt: '',
            imageFile: null,
            imagePreview: null
        }]);
    };

    const removeJob = (id: string) => {
        setJobs(prev => prev.filter(job => job.id !== id));
    };

    const updateJob = (id: string, updates: Partial<VideoJob>) => {
        setJobs(prev => prev.map(job => job.id === id ? { ...job, ...updates } : job));
    };

    const handleImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                showMessage('Ukuran file tidak boleh melebihi 4MB.', 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                updateJob(id, { imageFile: file, imagePreview: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleReset = () => {
        setJobs([]);
        addJob(); // Add one fresh job
        setResults([]);
        showMessage("Formulir telah direset.", "info");
    };

    const handleGenerateVideo = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", 'error'); return;
        }
        const validJobs = jobs.filter(j => j.prompt.trim());
        if (validJobs.length === 0) {
            showMessage('Setidaknya satu prompt harus diisi.', 'error'); return;
        }
    
        setIsLoading(true);
        setResults([]);
        setProgress({ completed: 0, total: validJobs.length });
        setLoadingMessage(loadingMessages[0]);
        showMessage(`Memulai pembuatan ${validJobs.length} video... Ini akan memakan waktu.`, 'info');
    
        const generationPromises = validJobs.map(job => 
            generateVideo(job.prompt, job.imageFile, numberOfVideos, model, aspectRatio, quality, apiKey)
                .then(async (downloadLinks) => {
                    const fetchedUrls = await Promise.all(
                        downloadLinks.map(async (link) => {
                            const response = await fetch(`${link}&key=${apiKey}`);
                            if (!response.ok) throw new Error(`Gagal mengunduh: ${response.statusText}`);
                            return URL.createObjectURL(await response.blob());
                        })
                    );
                    return { status: 'fulfilled' as const, value: { jobId: job.id, originalPrompt: job.prompt, urls: fetchedUrls } };
                })
                .catch(error => {
                    return { status: 'rejected' as const, reason: { jobId: job.id, originalPrompt: job.prompt, error: (error as Error).message } };
                })
                .finally(() => {
                    setProgress(prev => prev ? { ...prev, completed: prev.completed + 1 } : null);
                })
        );
        
        const settledResults = await Promise.allSettled(generationPromises);
        
        const finalResults: VideoResult[] = settledResults.map(res => {
            if (res.status === 'fulfilled' && res.value.status === 'fulfilled') {
                return res.value.value;
            } else {
                const reason = (res.status === 'rejected' ? res.reason : (res.value as any).reason) as any;
                return { ...reason, urls: [] };
            }
        });
        
        setResults(finalResults);
        const successCount = finalResults.filter(r => r.urls.length > 0).length;
        showMessage(`${successCount} dari ${validJobs.length} video berhasil dibuat!`, 'success');
        setIsLoading(false);
        setProgress(null);
    };
    
    const handleDeleteResult = (jobId: string) => {
        setResults(prev => prev.filter(r => r.jobId !== jobId));
        showMessage("Hasil yang gagal telah dihapus.", "info");
    };
    
    const handleContinueStory = (videoUrl: string) => {
        const videoElement = document.createElement('video');
        videoElement.src = videoUrl;
        videoElement.crossOrigin = "anonymous";
        videoElement.onloadedmetadata = () => { videoElement.currentTime = videoElement.duration; };
        videoElement.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
                if (!blob) return;
                const file = new File([blob], 'last_frame.png', { type: 'image/png' });
                const newJob: VideoJob = {
                    id: crypto.randomUUID(),
                    prompt: '',
                    imageFile: file,
                    imagePreview: canvas.toDataURL('image/png')
                };
                setJobs(prev => [...prev, newJob]);
                showMessage("Frame terakhir ditambahkan sebagai prompt baru. Tulis prompt Anda!", "success");
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }, 'image/png', 1.0);
        };
    };

    const getMessageBgColor = () => {
        if (messageType === 'success') return 'bg-green-500';
        if (messageType === 'error') return 'bg-red-500';
        return 'bg-blue-500';
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">Video Generator (Batch) 🎥</h2>
            {message && <div className={`p-3 mb-4 rounded-md ${getMessageBgColor()} text-white`}>{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner space-y-6">
                    <h3 className="text-2xl font-bold text-white -mb-2">Daftar Prompt</h3>
                    
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {jobs.map((job, index) => (
                            <div key={job.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600 relative">
                                <button onClick={() => removeJob(job.id)} className="absolute top-2 right-2 text-red-400 hover:text-white p-1" title="Hapus Prompt"><Trash2 className="w-4 h-4" /></button>
                                <h4 className="text-lg font-semibold text-white mb-2">Prompt #{index + 1}</h4>
                                <TextAreaField
                                    label=""
                                    name={`prompt-${job.id}`}
                                    value={job.prompt}
                                    onChange={(e) => updateJob(job.id, { prompt: e.target.value })}
                                    rows={3}
                                    placeholder="Potret sinematik seekor harimau..."
                                />
                                <div className="mt-2">
                                    {job.imagePreview ? (
                                        <div className="relative w-full max-w-xs">
                                            <img src={job.imagePreview} alt="Pratinjau" className="w-full h-auto max-h-32 object-contain rounded-md border border-gray-500"/>
                                            <button onClick={() => updateJob(job.id, { imageFile: null, imagePreview: null })} className="absolute top-1 right-1 bg-red-600/80 p-1.5 rounded-full" title="Hapus Gambar"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    ) : (
                                        <label className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            <span>Unggah Gambar (Opsional)</span>
                                            <input type="file" onChange={(e) => handleImageChange(job.id, e)} className="hidden" accept="image/jpeg, image/png, image/jpg" />
                                        </label>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addJob} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                        <Plus className="w-5 h-5"/> Tambah Prompt
                    </button>

                    <div className="border-t border-gray-600 pt-4">
                        <h3 className="text-xl font-bold text-white mb-4">Pengaturan Global</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <SelectField
                                label="Model"
                                name="model"
                                value={model}
                                options={[
                                    { value: 'veo-2.0-generate-001', label: 'VEO 2.0' },
                                    { value: 'veo-3.0-generate-preview', label: 'VEO 3.0 (Preview)' },
                                    { value: 'veo-3.0-fast-generate-preview', label: 'VEO 3.0 Fast (Preview)' },
                                ]}
                                onChange={(e) => setModel(e.target.value)}
                                tooltip="Pilih model VEO untuk pembuatan video."
                            />
                             <SelectField 
                                label="Kualitas" 
                                name="quality" 
                                value={quality} 
                                options={[
                                    {value: '720p', label: '720p'}, 
                                    {value: '1080p', label: '1080p'}, 
                                    {value: '4k', label: '4K'}
                                ]} 
                                onChange={(e) => setQuality(e.target.value)} 
                            />
                             <SelectField
                                label="Aspek Rasio"
                                name="aspectRatio"
                                value={aspectRatio}
                                options={[
                                    {value: '16:9', label: '16:9 (Landscape)'},
                                    {value: '9:16', label: '9:16 (Portrait)'},
                                    {value: '1:1', label: '1:1 (Square)'},
                                ]}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                tooltip="Pilih aspek rasio untuk semua video dalam batch ini."
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <button onClick={handleGenerateVideo} disabled={isLoading || jobs.filter(j => j.prompt.trim()).length === 0} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                            Hasilkan ({jobs.filter(j => j.prompt.trim()).length}) Video
                        </button>
                        <button onClick={handleReset} disabled={isLoading} className="bg-gray-500 hover:bg-gray-600 p-3 rounded-lg disabled:opacity-50" title="Reset Form">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col min-h-[400px]">
                    {isLoading ? (
                        <div className="text-center m-auto">
                            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
                            <p className="mt-4 text-white text-lg font-semibold">{loadingMessage}</p>
                            {progress && (
                                <div className="mt-4 w-full max-w-sm mx-auto">
                                    <p className="text-gray-300 mb-2">{progress.completed} / {progress.total} video selesai</p>
                                    <div className="w-full bg-gray-600 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                                            style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            <p className="mt-4 text-gray-400 text-sm">Harap tetap di halaman ini.</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="w-full h-full flex flex-col">
                             <h3 className="text-2xl font-bold text-white mb-4 text-center">Hasil Pembuatan Video</h3>
                             <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                                {results.map((result) => (
                                    <div key={result.jobId} className="bg-gray-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-300 italic mb-2 line-clamp-2" title={result.originalPrompt}>Prompt: "{result.originalPrompt}"</p>
                                        {result.error ? (
                                            <div className="flex justify-between items-start">
                                                <p className="text-red-400 text-sm flex-1 break-words pr-2">Gagal: {result.error}</p>
                                                <button 
                                                    onClick={() => handleDeleteResult(result.jobId)} 
                                                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full flex-shrink-0"
                                                    title="Hapus hasil ini"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {result.urls.map((url, index) => (
                                                    <div key={index} className="flex flex-col gap-2">
                                                        <video src={url} controls loop autoPlay playsInline className="w-full rounded-md bg-black aspect-video border border-gray-600" />
                                                        <div className="flex gap-2 justify-center">
                                                            <a href={url} download={`promptgen-${result.jobId.slice(0, 4)}-${index}.mp4`} className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 text-xs rounded-md flex items-center gap-1"><Download className="w-3 h-3"/> Unduh</a>
                                                            <button onClick={() => handleContinueStory(url)} className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 text-xs rounded-md flex items-center gap-1"><Video className="w-3 h-3"/> Lanjutkan</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                             </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 m-auto">
                            <Video className="w-16 h-16 mx-auto mb-4"/>
                            <h3 className="text-xl font-semibold">Hasil Video Akan Tampil di Sini</h3>
                            <p className="mt-2 text-sm">Isi prompt di sebelah kiri dan klik 'Hasilkan Video'.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoGeneratorPage;