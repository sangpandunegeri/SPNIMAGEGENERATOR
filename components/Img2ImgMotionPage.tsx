import React, { useState, useRef } from 'react';
import { Loader2, Upload, Wand2, Bot, Copy, Trash2, Ratio, Maximize, X, Camera, RefreshCw, Video, Download } from 'lucide-react';
import { generateImageFromImageAndText, generateAnimationPromptFromFrames } from '../services/geminiService';
import TextAreaField from './ui/TextAreaField';

interface Img2ImgMotionPageProps {
    apiKey: string;
    onGenerateVideo: (prompt: string) => void;
}

interface Frame {
    id: string;
    imageUrl: string;
    mimeType: string;
    prompt: string;
    camera: {
        zoom: number;
        panX: number;
        panY: number;
        orbit: number;
    };
}

type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | 'original';

const Img2ImgMotionPage: React.FC<Img2ImgMotionPageProps> = ({ apiKey, onGenerateVideo }) => {
    const [frames, setFrames] = useState<Frame[]>([]);
    const [nextPrompt, setNextPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [animationPrompt, setAnimationPrompt] = useState('');
    const [isGeneratingAnimationPrompt, setIsGeneratingAnimationPrompt] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');
    const [isAspectRatioLocked, setIsAspectRatioLocked] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeCameraControl, setActiveCameraControl] = useState<string | null>(null);

    // State for Outpainting Modal
    const [isOutpaintModalOpen, setIsOutpaintModalOpen] = useState(false);
    const [selectedFrameForOutpaint, setSelectedFrameForOutpaint] = useState<Frame | null>(null);
    const [outpaintPrompt, setOutpaintPrompt] = useState('');
    const [isOutpainting, setIsOutpainting] = useState(false);

    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 4000);
    };

    const handleDownloadFrame = (imageUrl: string, index: number) => {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `frame-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showMessage(`Frame ${index + 1} diunduh!`, 'success');
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showMessage("Prompt berhasil disalin!", 'success');
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newFrame: Frame = {
                    id: crypto.randomUUID(),
                    imageUrl: reader.result as string,
                    mimeType: file.type,
                    prompt: 'Gambar awal',
                    camera: { zoom: 1, panX: 0, panY: 0, orbit: 0 },
                };
                setFrames([newFrame]);
                setAnimationPrompt('');
                setAspectRatio('original');
                setIsAspectRatioLocked(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteFrame = (idToDelete: string) => {
        setFrames(prevFrames => {
            const newFrames = prevFrames.filter(frame => frame.id !== idToDelete);
            if (newFrames.length < 2) {
                setAnimationPrompt('');
            }
            if (newFrames.length <= 1) {
                setIsAspectRatioLocked(false);
            }
            return newFrames;
        });
        showMessage('Frame berhasil dihapus.', 'success');
    };

    const handleReframe = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", 'error');
            return;
        }
        if (frames.length === 0 || aspectRatio === 'original') {
            return;
        }

        setLoading(true);
        showMessage(`Mengubah frame ke rasio ${aspectRatio}... Ini mungkin memakan waktu sebentar.`, 'info');

        try {
            const firstFrame = frames[0];
            const base64Data = firstFrame.imageUrl.split(',')[1];
            const prompt = `Expand this image to a ${aspectRatio} aspect ratio by filling in the surrounding areas with matching scenery and context. Do not change the original image content. This is an outpainting task.`;
            
            const newImageBase64 = await generateImageFromImageAndText(base64Data, firstFrame.mimeType, prompt, apiKey);

            const newFrame: Frame = {
                ...firstFrame,
                id: crypto.randomUUID(),
                imageUrl: `data:${firstFrame.mimeType};base64,${newImageBase64}`,
                prompt: `Diubah ke rasio ${aspectRatio}`,
                camera: { zoom: 1, panX: 0, panY: 0, orbit: 0 },
            };

            setFrames([newFrame]);
            setIsAspectRatioLocked(true);
            showMessage('Re-frame berhasil! Rasio aspek sekarang terkunci.', 'success');
        } catch(error) {
            console.error(error);
            showMessage(`Gagal melakukan re-frame: ${(error as Error).message}`, 'error');
        } finally {
            setLoading(false);
        }
    }

    const getCameraMovementPrompt = (camera: Frame['camera']): string => {
        const parts: string[] = [];
        if (camera.zoom > 1.05) parts.push('zoom in');
        else if (camera.zoom < 0.95) parts.push('zoom out');
        
        if (camera.panX < -5) parts.push('pan left');
        else if (camera.panX > 5) parts.push('pan right');
        
        if (camera.panY < -5) parts.push('pan up');
        else if (camera.panY > 5) parts.push('pan down');
        
        if (Math.abs(camera.orbit) > 5) {
            parts.push(`orbits around the subject ${camera.orbit > 0 ? 'to the right' : 'to the left'} by ${Math.abs(camera.orbit)} degrees`);
        }

        if (parts.length === 0) return '';
        return `Camera motion: ${parts.join(', ')}.`;
    };
    
    const handleGenerateNextFrame = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur. Silakan atur di halaman 'Pengaturan'.", 'error');
            return;
        }
        if (!nextPrompt.trim()) {
            showMessage('Prompt tidak boleh kosong.', 'error');
            return;
        }
        if (frames.length === 0) {
            showMessage('Unggah gambar awal terlebih dahulu.', 'error');
            return;
        }

        setLoading(true);
        if (!isAspectRatioLocked) {
            setIsAspectRatioLocked(true);
        }
        showMessage('Menghasilkan frame berikutnya...', 'info');

        try {
            const lastFrame = frames[frames.length - 1];
            const base64Data = lastFrame.imageUrl.split(',')[1];
            
            const cameraPrompt = getCameraMovementPrompt(lastFrame.camera);
            const fullPrompt = cameraPrompt ? `${cameraPrompt} ${nextPrompt}` : nextPrompt;
            
            const newImageBase64 = await generateImageFromImageAndText(base64Data, lastFrame.mimeType, fullPrompt, apiKey);

            const newFrame: Frame = {
                id: crypto.randomUUID(),
                imageUrl: `data:${lastFrame.mimeType};base64,${newImageBase64}`,
                mimeType: lastFrame.mimeType,
                prompt: nextPrompt,
                camera: { zoom: 1, panX: 0, panY: 0, orbit: 0 },
            };

            setFrames(prev => [...prev, newFrame]);
            setNextPrompt('');
            showMessage(`Frame ${frames.length + 1} berhasil dibuat!`, 'success');
        } catch (error) {
            console.error(error);
            showMessage(`Gagal membuat frame: ${(error as Error).message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAnimationPrompt = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", 'error');
            return;
        }
        if (frames.length < 2) {
            showMessage("Perlu setidaknya 2 frame untuk membuat prompt animasi.", 'error');
            return;
        }

        setIsGeneratingAnimationPrompt(true);
        setAnimationPrompt('');
        showMessage("Menganalisis rangkaian frame...", 'info');

        try {
            const framesInfo = frames
                .map((frame, index) => {
                    if (index === 0) return `Frame 1: Initial scene.`;
                    const cameraPrompt = getCameraMovementPrompt(frames[index - 1].camera);
                    return `Frame ${index + 1}: ${cameraPrompt} Then, the following change happens: "${frame.prompt}"`;
                })
                .join('\n');
            
            const fullInstruction = `Analisis rangkaian deskripsi perubahan dan gerakan kamera berikut yang digunakan untuk membuat animasi gambar frame-demi-frame. Sintesiskan informasi ini menjadi satu prompt video tunggal yang koheren dan mendeskripsikan keseluruhan gerakan atau transformasi dari awal hingga akhir. Buat prompt yang sinematik, jelas, dan menggabungkan gerakan kamera dengan perubahan adegan secara alami.\n\nBerikut adalah urutan perubahannya:\n${framesInfo}`;

            const result = await generateAnimationPromptFromFrames(fullInstruction, apiKey);
            setAnimationPrompt(result);
            showMessage("Prompt animasi berhasil dibuat!", 'success');
        } catch (error) {
            console.error(error);
            showMessage(`Gagal membuat prompt animasi: ${(error as Error).message}`, 'error');
        } finally {
            setIsGeneratingAnimationPrompt(false);
        }
    };

    const openOutpaintModal = (frame: Frame) => {
        setSelectedFrameForOutpaint(frame);
        setOutpaintPrompt('');
        setIsOutpaintModalOpen(true);
    };

    const handleGenerateOutpaint = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", 'error');
            return;
        }
        if (!selectedFrameForOutpaint) {
            showMessage("Tidak ada frame yang dipilih.", 'error');
            return;
        }
        if (!outpaintPrompt.trim()) {
            showMessage("Prompt perluasan tidak boleh kosong.", 'error');
            return;
        }

        setIsOutpainting(true);
        showMessage('Memperluas gambar... Ini mungkin memerlukan waktu.', 'info');

        try {
            const base64Data = selectedFrameForOutpaint.imageUrl.split(',')[1];
            const newImageBase64 = await generateImageFromImageAndText(
                base64Data,
                selectedFrameForOutpaint.mimeType,
                outpaintPrompt,
                apiKey
            );

            const newFrame: Frame = {
                id: crypto.randomUUID(),
                imageUrl: `data:${selectedFrameForOutpaint.mimeType};base64,${newImageBase64}`,
                mimeType: selectedFrameForOutpaint.mimeType,
                prompt: `Diperluas: ${outpaintPrompt}`,
                camera: { zoom: 1, panX: 0, panY: 0, orbit: 0 },
            };

            const originalIndex = frames.findIndex(f => f.id === selectedFrameForOutpaint.id);
            if (originalIndex !== -1) {
                const updatedFrames = [...frames];
                updatedFrames.splice(originalIndex + 1, 0, newFrame);
                setFrames(updatedFrames);
            }

            showMessage('Gambar berhasil diperluas!', 'success');
            setIsOutpaintModalOpen(false);
        } catch (error) {
            console.error(error);
            showMessage(`Gagal memperluas gambar: ${(error as Error).message}`, 'error');
        } finally {
            setIsOutpainting(false);
            setSelectedFrameForOutpaint(null);
            setOutpaintPrompt('');
        }
    };
    
    const handleCameraChange = (frameId: string, newSettings: Partial<Frame['camera']>) => {
        setFrames(currentFrames =>
            currentFrames.map(f =>
                f.id === frameId ? { ...f, camera: { ...f.camera, ...newSettings } } : f
            )
        );
    };

    const handleCameraPreset = (frameId: string, preset: 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' | 'panUp' | 'panDown') => {
        const currentFrame = frames.find(f => f.id === frameId);
        if (!currentFrame) return;
        let { zoom, panX, panY } = currentFrame.camera;
        switch (preset) {
            case 'zoomIn': zoom = Math.min(3, zoom + 0.1); break;
            case 'zoomOut': zoom = Math.max(0.5, zoom - 0.1); break;
            case 'panLeft': panX = Math.max(-50, panX - 5); break;
            case 'panRight': panX = Math.min(50, panX + 5); break;
            case 'panUp': panY = Math.max(-50, panY - 5); break;
            case 'panDown': panY = Math.min(50, panY + 5); break;
        }
        handleCameraChange(frameId, { zoom, panX, panY });
    };

    const getMessageBgColor = () => {
        if (messageType === 'success') return 'bg-green-500';
        if (messageType === 'error') return 'bg-red-500';
        return 'bg-blue-500';
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">Img2Img Motion 🎞️</h2>
            {message && <div className={`p-3 mb-4 rounded-md ${getMessageBgColor()} text-white`}>{message}</div>}

            {frames.length === 0 ? (
                <div className="bg-gray-700 p-8 rounded-lg shadow-inner text-center">
                    <h3 className="text-xl font-semibold mb-4">Mulai Rangkaian Animasi Anda</h3>
                    <p className="text-gray-400 mb-6">Unggah gambar awal untuk menjadi Frame 1.</p>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md mx-auto">
                        <Upload className="w-5 h-5" /> Unggah Gambar
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Frame Display */}
                    <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
                        <h3 className="text-xl font-semibold text-white mb-4">Rangkaian Frame ({frames.length})</h3>
                        <div className="flex overflow-x-auto space-x-4 pb-4">
                            {frames.map((frame, index) => (
                                <div key={frame.id} className="group relative flex-shrink-0 w-60 bg-gray-800 p-3 rounded-lg shadow-md">
                                    <div className="w-full h-32 rounded-md mb-2 border border-gray-600 bg-gray-900 overflow-hidden">
                                        <img 
                                            src={frame.imageUrl} 
                                            alt={`Frame ${index + 1}`} 
                                            className="w-full h-full object-contain transition-transform duration-300 ease-in-out"
                                            style={{ transform: `scale(${frame.camera.zoom}) translate(${frame.camera.panX}%, ${frame.camera.panY}%)` }}
                                        />
                                    </div>
                                    <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full font-mono">
                                        {index + 1}
                                    </div>
                                    <p 
                                        className="text-gray-300 text-xs italic line-clamp-2 h-8" 
                                        title={frame.prompt}
                                    >
                                        {frame.prompt}
                                    </p>
                                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={() => setActiveCameraControl(activeCameraControl === frame.id ? null : frame.id)}
                                            className="bg-green-700/80 hover:bg-green-600 text-white p-1.5 rounded-full shadow-md"
                                            title={`Kontrol Kamera Frame ${index + 1}`}
                                        >
                                            <Camera className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => openOutpaintModal(frame)}
                                            disabled={loading || isOutpainting}
                                            className="bg-blue-700/80 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-md disabled:opacity-50"
                                            title={`Perluas Frame ${index + 1}`}
                                        >
                                            <Maximize className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDownloadFrame(frame.imageUrl, index)}
                                            className="bg-gray-700/80 hover:bg-gray-600 text-white p-1.5 rounded-full shadow-md"
                                            title={`Unduh Frame ${index + 1}`}
                                        >
                                            <Download className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFrame(frame.id)}
                                            disabled={loading || isOutpainting}
                                            className="bg-red-700/80 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md disabled:opacity-50"
                                            title={`Hapus Frame ${index + 1}`}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {activeCameraControl === frame.id && (
                                        <div className="absolute inset-0 bg-gray-900/95 z-10 rounded-lg p-3 flex flex-col text-xs text-white" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold">Kamera Frame {index + 1}</span>
                                                <button onClick={() => setActiveCameraControl(null)} className="p-1"><X className="w-3 h-3"/></button>
                                            </div>
                                            <div className="flex-grow space-y-2 overflow-y-auto">
                                                <div className="grid grid-cols-2 gap-1">
                                                    <button onClick={() => handleCameraPreset(frame.id, 'zoomIn')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Zoom In</button>
                                                    <button onClick={() => handleCameraPreset(frame.id, 'zoomOut')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Zoom Out</button>
                                                    <button onClick={() => handleCameraPreset(frame.id, 'panLeft')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Pan Left</button>
                                                    <button onClick={() => handleCameraPreset(frame.id, 'panRight')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Pan Right</button>
                                                    <button onClick={() => handleCameraPreset(frame.id, 'panUp')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Pan Up</button>
                                                    <button onClick={() => handleCameraPreset(frame.id, 'panDown')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Pan Down</button>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block">Zoom: {frame.camera.zoom.toFixed(2)}x</label>
                                                    <input type="range" min="0.5" max="3" step="0.05" value={frame.camera.zoom} onChange={(e) => handleCameraChange(frame.id, { zoom: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block">Pan X: {frame.camera.panX}%</label>
                                                    <input type="range" min="-50" max="50" step="1" value={frame.camera.panX} onChange={(e) => handleCameraChange(frame.id, { panX: parseInt(e.target.value, 10) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block">Pan Y: {frame.camera.panY}%</label>
                                                    <input type="range" min="-50" max="50" step="1" value={frame.camera.panY} onChange={(e) => handleCameraChange(frame.id, { panY: parseInt(e.target.value, 10) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="block">Orbit: {frame.camera.orbit || 0}°</label>
                                                    <input type="range" min="-180" max="180" step="5" value={frame.camera.orbit || 0} onChange={(e) => handleCameraChange(frame.id, { orbit: parseInt(e.target.value, 10) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                                </div>
                                            </div>
                                            <button onClick={() => handleCameraChange(frame.id, { zoom: 1, panX: 0, panY: 0, orbit: 0 })} className="bg-red-800 hover:bg-red-700 p-1 mt-2 rounded flex items-center justify-center gap-1">
                                                <RefreshCw className="w-3 h-3" /> Reset
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                     {/* Aspect Ratio Changer */}
                    {frames.length === 1 && !isAspectRatioLocked && (
                        <div className="bg-gray-700 p-6 rounded-lg shadow-inner border-2 border-dashed border-cyan-500">
                             <h3 className="text-xl font-semibold text-white mb-4">Ubah Rasio Aspek (Opsional)</h3>
                             <p className="text-gray-400 mb-4 text-sm">Perluas gambar Anda ke rasio aspek baru menggunakan AI. Ini akan menggantikan frame awal.</p>
                             <div className="flex flex-wrap gap-2 mb-4">
                                {(['16:9', '9:16', '1:1', '4:3', '3:4'] as const).map(ratio => (
                                    <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-4 py-2 text-sm rounded-lg ${aspectRatio === ratio ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-600'}`}>
                                        {ratio}
                                    </button>
                                ))}
                             </div>
                             <div className="relative group mt-4 inline-block">
                                <button onClick={handleReframe} disabled={loading || aspectRatio === 'original'} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Ratio className="w-5 h-5"/> }
                                    Re-frame & Kunci Rasio
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Memperluas gambar Anda menggunakan AI dan mengunci rasio untuk frame berikutnya.</span>
                             </div>
                        </div>
                    )}
                    
                    {/* Next Frame Generator */}
                    { (frames.length > 0 && isAspectRatioLocked) || frames.length > 1 ? (
                        <div className="bg-gray-700 p-6 rounded-lg shadow-inner border-2 border-dashed border-blue-500">
                            <h3 className="text-xl font-semibold text-white mb-4">Frame Berikutnya (Frame {frames.length + 1})</h3>
                            <TextAreaField 
                                label="Deskripsikan perubahan dari frame sebelumnya"
                                name="nextPrompt"
                                value={nextPrompt}
                                onChange={(e) => setNextPrompt(e.target.value)}
                                rows={4}
                                placeholder="Contoh: tambahkan senyuman di wajahnya, buat matanya melihat ke kiri, angkat tangan kanannya..."
                                tooltip="Jelaskan perubahan yang Anda inginkan dari frame sebelumnya. AI akan mencoba menerapkan perubahan ini untuk membuat frame baru."
                            />
                            <div className="relative group mt-4 inline-block">
                                <button 
                                    onClick={handleGenerateNextFrame} 
                                    disabled={loading || isOutpainting} 
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                    {loading ? 'Menghasilkan...' : 'Hasilkan Frame'}
                                </button>
                                 <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Membuat frame berikutnya berdasarkan gambar terakhir dan prompt Anda.</span>
                            </div>
                        </div>
                     ) : (
                        <div className="bg-gray-700 p-6 rounded-lg shadow-inner text-center">
                            <p className="text-gray-300">Silakan kunci rasio aspek di atas untuk melanjutkan, atau langsung buat frame kedua untuk mengunci rasio aspek saat ini.</p>
                             <button 
                                onClick={() => setIsAspectRatioLocked(true)} 
                                className="mt-4 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg"
                            >
                                Gunakan Rasio Asli & Lanjutkan
                            </button>
                        </div>
                     )}
                </div>
            )}
            
            {/* Animation Prompt Generator */}
            {frames.length > 1 && (
                <div className="mt-8 bg-gray-700 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold text-white mb-4">Prompt Animasi Gabungan</h3>
                    <p className="text-gray-400 mb-4 text-sm">
                        Buat satu prompt video tunggal yang merangkum semua perubahan dari frame yang telah Anda buat.
                    </p>
                    <div className="relative group inline-block">
                        <button
                            onClick={handleGenerateAnimationPrompt}
                            disabled={isGeneratingAnimationPrompt}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGeneratingAnimationPrompt ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
                            Hasilkan Prompt Animasi
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Menganalisis semua frame dan membuat satu prompt video yang merangkum keseluruhan animasi.</span>
                    </div>

                    {animationPrompt && (
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold text-white mb-2">Hasil Prompt:</h4>
                            <div className="relative bg-gray-900 p-4 rounded-md border border-gray-600 mb-4">
                                <p className="text-gray-200 whitespace-pre-wrap">{animationPrompt}</p>
                                <button onClick={() => handleCopy(animationPrompt)} className="absolute top-2 right-2 p-2 rounded-full bg-gray-600 hover:bg-gray-500" title="Salin Prompt">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => onGenerateVideo(animationPrompt)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
                                >
                                    <Video className="w-5 h-5" /> Buat Video dengan Prompt Ini
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Outpainting Modal */}
            {isOutpaintModalOpen && selectedFrameForOutpaint && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsOutpaintModalOpen(false)}>
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-blue-400">Perluas Gambar</h3>
                            <button onClick={() => setIsOutpaintModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <img src={selectedFrameForOutpaint.imageUrl} alt="Frame untuk diperluas" className="w-full max-h-80 object-contain rounded-lg mb-4 bg-gray-900" />
                        <TextAreaField
                            label="Jelaskan bagaimana cara memperluas gambar"
                            name="outpaintPrompt"
                            value={outpaintPrompt}
                            onChange={(e) => setOutpaintPrompt(e.target.value)}
                            rows={3}
                            placeholder="Contoh: perluas ke kiri untuk menunjukkan jalan setapak hutan, perluas ke atas untuk menunjukkan lebih banyak langit malam berbintang..."
                        />
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setIsOutpaintModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Batal</button>
                            <button onClick={handleGenerateOutpaint} disabled={isOutpainting || !outpaintPrompt.trim()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {isOutpainting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Wand2 className="w-5 h-5" />}
                                Hasilkan Perluasan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Img2ImgMotionPage;