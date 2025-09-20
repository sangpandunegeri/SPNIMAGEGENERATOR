import React, { useState, useRef } from 'react';
import { Loader2, Wand2, Trash2, GitMerge, Upload, Video, RefreshCw, Camera, X, Image as ImageIcon } from 'lucide-react';
import SelectField from './ui/SelectField';
import InputField from './ui/InputField';
import { videoFusionTransitionOptions } from '../constants';
import { mergeImagesWithPrompt } from '../services/geminiService';


interface VideoFusionPageProps {
    apiKey: string;
    onGenerateVideo: (prompt: string, imageFile: File | null) => void;
}

interface CameraSettings {
    zoom: number;
    panX: number;
    panY: number;
    orbit: number;
}

interface Scene {
    id: string;
    file: File;
    preview: string;
    camera: CameraSettings;
}

interface Transition {
    duration: string;
    effect: string;
}

const FrameUploader: React.FC<{
    onUpload: (file: File, preview: string) => void;
    onRemove: () => void;
    onCameraChange: (newSettings: Partial<CameraSettings>) => void;
    onCameraPreset: (preset: 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' | 'panUp' | 'panDown') => void;
    scene: Scene | null;
    title: string;
}> = ({ onUpload, onRemove, onCameraChange, onCameraPreset, scene, title }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isCameraPanelOpen, setIsCameraPanelOpen] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpload(file, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    return (
        <div className="flex-1 flex flex-col items-center">
            <div className="w-full aspect-square bg-gray-700 rounded-lg p-2 relative flex items-center justify-center">
                 <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                {scene ? (
                    <>
                        <div className="w-full h-full overflow-hidden rounded-md">
                             <img 
                                src={scene.preview} 
                                alt={title} 
                                className="w-full h-full object-contain transition-transform duration-300" 
                                style={{ transform: `scale(${scene.camera.zoom}) translate(${scene.camera.panX}%, ${scene.camera.panY}%)` }}
                            />
                        </div>
                         <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                            <button onClick={() => setIsCameraPanelOpen(!isCameraPanelOpen)} className="bg-black/50 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                            <button onClick={onRemove} className="bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                         {isCameraPanelOpen && (
                            <div className="absolute inset-0 bg-gray-900/90 z-20 rounded-lg p-3 flex flex-col text-xs text-white" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold">Kamera: {title}</span>
                                    <button onClick={() => setIsCameraPanelOpen(false)} className="p-1"><X className="w-3 h-3"/></button>
                                </div>
                                <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                                    <div className="grid grid-cols-2 gap-1">
                                        <button onClick={() => onCameraPreset('zoomIn')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Zoom In</button>
                                        <button onClick={() => onCameraPreset('zoomOut')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Zoom Out</button>
                                        <button onClick={() => onCameraPreset('panLeft')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Pan Left</button>
                                        <button onClick={() => onCameraPreset('panRight')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Pan Right</button>
                                        <button onClick={() => onCameraPreset('panUp')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Pan Up</button>
                                        <button onClick={() => onCameraPreset('panDown')} className="bg-gray-700 hover:bg-gray-600 p-1 rounded">Pan Down</button>
                                    </div>
                                    <div className="space-y-1">
                                        <label>Zoom: {scene.camera.zoom.toFixed(2)}x</label>
                                        <input type="range" min="0.5" max="3" step="0.05" value={scene.camera.zoom} onChange={(e) => onCameraChange({ zoom: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="space-y-1">
                                        <label>Pan X: {scene.camera.panX}%</label>
                                        <input type="range" min="-50" max="50" step="1" value={scene.camera.panX} onChange={(e) => onCameraChange({ panX: parseInt(e.target.value, 10) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="space-y-1">
                                        <label>Pan Y: {scene.camera.panY}%</label>
                                        <input type="range" min="-50" max="50" step="1" value={scene.camera.panY} onChange={(e) => onCameraChange({ panY: parseInt(e.target.value, 10) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                    <div className="space-y-1">
                                        <label>Orbit: {scene.camera.orbit}°</label>
                                        <input type="range" min="-180" max="180" step="5" value={scene.camera.orbit} onChange={(e) => onCameraChange({ orbit: parseInt(e.target.value, 10) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                    </div>
                                </div>
                                <button onClick={() => onCameraChange({ zoom: 1, panX: 0, panY: 0, orbit: 0 })} className="bg-red-800 hover:bg-red-700 p-1 mt-2 rounded flex items-center justify-center gap-1 text-xs w-full">
                                    <RefreshCw className="w-3 h-3" /> Reset
                                </button>
                            </div>
                         )}
                    </>
                ) : (
                    <div 
                        className="w-full h-full border-2 border-dashed border-gray-500 hover:border-blue-500 rounded-md flex flex-col items-center justify-center text-gray-400 cursor-pointer transition-colors"
                        onClick={() => inputRef.current?.click()}
                    >
                        <Upload className="w-10 h-10 mb-2"/>
                        <p>Unggah Gambar</p>
                    </div>
                )}
            </div>
            <p className="text-white font-semibold mt-3 text-lg glow-text">{title}</p>
        </div>
    )
};


const VideoFusionPage: React.FC<VideoFusionPageProps> = ({ apiKey, onGenerateVideo }) => {
    const defaultCamera: CameraSettings = { zoom: 1, panX: 0, panY: 0, orbit: 0 };
    const [scene1, setScene1] = useState<Scene | null>(null);
    const [scene2, setScene2] = useState<Scene | null>(null);
    const [transition, setTransition] = useState<Transition>({ duration: '4', effect: '' });
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleScene1Upload = (file: File, preview: string) => {
        if (scene1) URL.revokeObjectURL(scene1.preview);
        setScene1({ id: crypto.randomUUID(), file, preview, camera: defaultCamera });
    };

    const handleScene2Upload = (file: File, preview: string) => {
        if (scene2) URL.revokeObjectURL(scene2.preview);
        setScene2({ id: crypto.randomUUID(), file, preview, camera: defaultCamera });
    };
    
    const handleTransitionChange = (field: keyof Transition, value: string) => {
        setTransition(prev => ({ ...prev, [field]: value }));
    };

    const combineImages = (image1: HTMLImageElement, image2: HTMLImageElement): Promise<File> => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject('Could not get canvas context');

            const height = Math.max(image1.height, image2.height);
            const width = image1.width + image2.width;
            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(image1, 0, (height - image1.height) / 2);
            ctx.drawImage(image2, image1.width, (height - image2.height) / 2);

            canvas.toBlob((blob) => {
                if (!blob) return reject('Canvas toBlob failed');
                const file = new File([blob], 'fused-image.png', { type: 'image/png' });
                resolve(file);
            }, 'image/png');
        });
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };
    
    const getCameraDeltaDescription = (cam1: CameraSettings, cam2: CameraSettings): string => {
        const parts: string[] = [];
        const zoomDiff = cam2.zoom - cam1.zoom;
        const panXDiff = cam2.panX - cam1.panX;
        const panYDiff = cam2.panY - cam1.panY;
        const orbitDiff = cam2.orbit - cam1.orbit;

        if (zoomDiff > 0.1) parts.push(`zooms in from ${cam1.zoom.toFixed(1)}x to ${cam2.zoom.toFixed(1)}x`);
        else if (zoomDiff < -0.1) parts.push(`zooms out from ${cam1.zoom.toFixed(1)}x to ${cam2.zoom.toFixed(1)}x`);

        if (panXDiff > 5) parts.push('pans to the right');
        else if (panXDiff < -5) parts.push('pans to the left');
        
        if (panYDiff > 5) parts.push('pans down');
        else if (panYDiff < -5) parts.push('pans up');

        if (orbitDiff > 5) parts.push('orbits right');
        else if (orbitDiff < -5) parts.push('orbits left');

        return parts.length > 0 ? `The camera smoothly ${parts.join(', ')}.` : '';
    };

    const handleGenerateAndNavigate = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur. Silakan atur di halaman 'Pengaturan'.", 'error');
            return;
        }
        if (!scene1 || !scene2) {
            showMessage('Harap unggah gambar untuk Frame Pertama dan Frame Terakhir.', 'error');
            return;
        }

        setIsProcessing(true);
        showMessage('Menggabungkan gambar dan membuat prompt video...', 'info');

        try {
            const [img1, img2] = await Promise.all([loadImage(scene1.preview), loadImage(scene2.preview)]);
            const combinedImageFile = await combineImages(img1, img2);
            
            const cameraDeltaPrompt = getCameraDeltaDescription(scene1.camera, scene2.camera);

            let instructionText = `This is a high-concept visual effects task. The provided image is a film strip containing two keyframes: the left is the start, the right is the end. Your primary goal is to create a seamless video that transitions between them over approximately ${transition.duration || '4'} seconds. `;
            
            if (transition.effect) {
                instructionText += `The transition MUST be executed with the following specific visual effect: "${transition.effect}". This effect is the main creative direction. `;
            }
            
            if (cameraDeltaPrompt) {
                instructionText += `While the transition effect is happening, the camera should also perform this movement: ${cameraDeltaPrompt}`;
            }
            
            instructionText += ` The final video must feel like a single, continuous, and professionally executed visual effect shot.`

            showMessage('Prompt berhasil dibuat! Mengarahkan ke Video Generator...', 'success');
            onGenerateVideo(instructionText, combinedImageFile);
        } catch (error) {
            console.error(error);
            showMessage(`Gagal memproses gambar: ${(error as Error).message}`, 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePreviewGeneration = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur. Silakan atur di halaman 'Pengaturan'.", 'error');
            return;
        }
        if (!scene1 || !scene2) {
            showMessage('Harap unggah kedua gambar.', 'error');
            return;
        }

        setIsPreviewLoading(true);
        showMessage('Membuat pratinjau...', 'info');

        try {
            const cameraDeltaPrompt = getCameraDeltaDescription(scene1.camera, scene2.camera);
            let previewPrompt = `This is a high-concept image generation task. Analyze the two provided keyframe images. Your goal is to create a single, static, cinematic image that represents the *midpoint* of a transition from the first image to the second.`;
            if (transition.effect) {
                previewPrompt += ` The transition is creatively driven by this specific visual effect: "${transition.effect}". The final image should embody the essence of this effect in a frozen moment.`;
            }
            if (cameraDeltaPrompt) {
                previewPrompt += ` The camera is also in motion during this transition: ${cameraDeltaPrompt}. Reflect this camera perspective in the final image.`;
            }
            previewPrompt += ` The output must be a single, beautiful, high-quality still frame that perfectly captures the fusion of the two images and the specified effects.`;

            const resultBase64 = await mergeImagesWithPrompt(scene1.file, scene2.file, false, previewPrompt, apiKey);
            setPreviewImageUrl(`data:image/png;base64,${resultBase64}`);
            setIsPreviewModalOpen(true);
        } catch (error) {
            console.error(error);
            showMessage(`Gagal membuat pratinjau: ${(error as Error).message}`, 'error');
        } finally {
            setIsPreviewLoading(false);
        }
    };
    
    const handleReset = () => {
        if(scene1) URL.revokeObjectURL(scene1.preview);
        if(scene2) URL.revokeObjectURL(scene2.preview);
        setScene1(null);
        setScene2(null);
        setTransition({ duration: '4', effect: '' });
        setMessage('');
    };
    
    const getMessageBgColor = () => {
        if (messageType === 'success') return 'bg-green-500';
        if (messageType === 'error') return 'bg-red-500';
        return 'bg-blue-500';
    };

    const handleCameraPreset = (
        scene: Scene | null, 
        setScene: React.Dispatch<React.SetStateAction<Scene | null>>, 
        preset: 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' | 'panUp' | 'panDown'
    ) => {
        if (!scene) return;
        const currentCam = scene.camera;
        const newCam = { ...currentCam };
        const panStep = 5;
        const panLimit = 50;
        switch (preset) {
            case 'zoomIn': newCam.zoom = Math.min(3, currentCam.zoom + 0.1); break;
            case 'zoomOut': newCam.zoom = Math.max(0.5, currentCam.zoom - 0.1); break;
            case 'panLeft': newCam.panX = Math.max(-panLimit, currentCam.panX - panStep); break;
            case 'panRight': newCam.panX = Math.min(panLimit, currentCam.panX + panStep); break;
            case 'panUp': newCam.panY = Math.max(-panLimit, currentCam.panY - panStep); break;
            case 'panDown': newCam.panY = Math.min(panLimit, currentCam.panY + panStep); break;
        }
        setScene({ ...scene, camera: newCam });
    };

    return (
        <div className="p-6 bg-gray-900 rounded-xl shadow-lg flex flex-col h-full">
            <style>{`.glow-text { text-shadow: 0 0 8px rgba(255, 255, 255, 0.3); }`}</style>
            <div className="text-center mb-8">
                 <h2 className="text-5xl font-extrabold text-white">Video Fusion</h2>
                 <p className="text-lg text-gray-400 mt-2">Buat transisi mulus antara dua gambar.</p>
            </div>
            {message && <div className={`p-3 mb-4 rounded-md ${getMessageBgColor()} text-white`}>{message}</div>}
            
            <div className="flex flex-col md:flex-row gap-8 items-start justify-center mb-8">
                <FrameUploader 
                    scene={scene1} 
                    onUpload={handleScene1Upload} 
                    onRemove={() => setScene1(null)}
                    onCameraChange={(newSettings) => setScene1(s => s ? { ...s, camera: { ...s.camera, ...newSettings } } : null)}
                    onCameraPreset={(preset) => handleCameraPreset(scene1, setScene1, preset)}
                    title="Frame Pertama" 
                />
                 <div className="text-5xl text-gray-500 font-thin mx-4 mt-24 hidden md:block">→</div>
                <FrameUploader 
                    scene={scene2} 
                    onUpload={handleScene2Upload} 
                    onRemove={() => setScene2(null)}
                    onCameraChange={(newSettings) => setScene2(s => s ? { ...s, camera: { ...s.camera, ...newSettings } } : null)}
                    onCameraPreset={(preset) => handleCameraPreset(scene2, setScene2, preset)}
                    title="Frame Terakhir" 
                />
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mt-auto">
                <div className="border-b border-gray-600 mb-4 pb-2">
                     <div className="flex items-center justify-between">
                        <button className="flex items-center gap-2 text-white font-semibold py-2 px-3 border-b-2 border-red-500">
                            <GitMerge className="w-5 h-5"/>
                            <span>Transisi</span>
                        </button>
                        <button onClick={handleReset} title="Reset Form" className="p-2 text-gray-400 hover:text-white"><RefreshCw className="w-5 h-5"/></button>
                    </div>
                </div>
                
                <div className="flex flex-col lg:flex-row items-start gap-6">
                    <div className="flex-grow w-full">
                         <SelectField
                            label="Efek Transisi"
                            name="effect"
                            value={transition.effect}
                            onChange={(e) => handleTransitionChange('effect', e.target.value)}
                            options={videoFusionTransitionOptions}
                            defaultOption="Pilih Efek..."
                            tooltip="Pilih efek visual profesional untuk transisi antara dua gambar."
                        />
                    </div>
                    <div className="flex-shrink-0 w-full lg:w-72">
                         <InputField
                            label="Durasi (detik)"
                            name="duration"
                            type="number"
                            value={transition.duration}
                            onChange={(e) => handleTransitionChange('duration', e.target.value)}
                            placeholder="Contoh: 4"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap justify-end items-center mt-6 border-t border-gray-600 pt-4 gap-4">
                    <button
                        onClick={handlePreviewGeneration}
                        disabled={isProcessing || isPreviewLoading || !scene1 || !scene2}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md disabled:opacity-50"
                    >
                        {isPreviewLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                        Pratinjau Gambar
                    </button>
                     <button
                        onClick={handleGenerateAndNavigate}
                        disabled={isProcessing || isPreviewLoading || !scene1 || !scene2}
                        className="bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {isProcessing ? 'Memproses...' : 'Hasilkan & Kirim ke Video Gen'}
                    </button>
                </div>
            </div>
            
            {isPreviewModalOpen && previewImageUrl && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setIsPreviewModalOpen(false)}>
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-700 animate-zoomIn" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-blue-400">Pratinjau Penggabungan</h3>
                            <button onClick={() => setIsPreviewModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                        </div>
                        <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                            <img src={previewImageUrl} alt="Pratinjau Penggabungan" className="max-w-full max-h-full object-contain rounded-md" />
                        </div>
                         <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setIsPreviewModalOpen(false)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Tutup</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoFusionPage;
