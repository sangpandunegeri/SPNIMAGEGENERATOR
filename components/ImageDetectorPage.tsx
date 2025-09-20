import React, { useState } from 'react';
import { Loader2, Copy, Users, Box, MapPin, Film, Video } from 'lucide-react';
import { Page } from '../types';
import { detectPromptFromImage, extractDetailsFromPrompt } from '../services/geminiService';

interface ImageDetectorPageProps {
    setCurrentPage: (page: Page) => void;
    setLastDetectionData: (data: any) => void;
    apiKey: string;
    onGenerateVideo: (prompt: string, imageFile: File | null) => void;
}

const ImageDetectorPage: React.FC<ImageDetectorPageProps> = ({ setCurrentPage, setLastDetectionData, apiKey, onGenerateVideo }) => {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    // New state for video processing
    const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 4000);
    };

    const handleCopyPrompt = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(generatedPrompt);
            showMessage("Prompt berhasil disalin!", "success");
        } else {
            showMessage("Gagal menyalin prompt.", "error");
        }
    };

    const dataURLtoFile = (dataurl: string, filename: string): File => {
        const arr = dataurl.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch) {
            throw new Error("Tidak dapat menentukan tipe mime dari data URL");
        }
        const mime = mimeMatch[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    const extractFramesFromVideo = async (videoFile: File) => {
        setIsVideoLoading(true);
        showMessage('Mengekstrak frame dari video...', 'info');

        const videoUrl = URL.createObjectURL(videoFile);
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsVideoLoading(false);
            showMessage('Browser tidak mendukung ekstraksi frame.', 'error');
            URL.revokeObjectURL(videoUrl);
            return;
        }

        const frames: string[] = [];
        const frameCount = 6; // Number of frames to extract

        video.onloadedmetadata = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const duration = video.duration;
            // Avoid extracting the very first and last frames which can be black
            const interval = duration / (frameCount + 1); 

            let processedFrames = 0;

            const seekAndCapture = (time: number) => {
                video.currentTime = time;
            };
            
            video.onseeked = () => {
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL('image/jpeg'));
                }
                processedFrames++;
                if (processedFrames < frameCount) {
                    seekAndCapture(interval * (processedFrames + 1));
                } else {
                    setExtractedFrames(frames);
                    setIsVideoLoading(false);
                    showMessage('Pilih frame untuk dideteksi.', 'success');
                    URL.revokeObjectURL(videoUrl); // Clean up
                }
            };

            // Start the process
            seekAndCapture(interval);
        };

        video.onerror = () => {
            setIsVideoLoading(false);
            showMessage('Gagal memuat video.', 'error');
            URL.revokeObjectURL(videoUrl); // Clean up
        };

        video.src = videoUrl;
        await video.play().catch(() => {}); // Play is needed on some browsers to enable seeking
        video.pause();
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset state for new upload
        setSelectedImage(null);
        setImagePreview(null);
        setGeneratedPrompt('');
        setExtractedFrames([]);

        if (file.type.startsWith('image/')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            extractFramesFromVideo(file);
        } else {
            showMessage('Tipe file tidak didukung. Silakan unggah gambar atau video.', 'error');
        }
    };

    const handleFrameSelect = (frameDataUrl: string) => {
        setImagePreview(frameDataUrl);
        const frameFile = dataURLtoFile(frameDataUrl, `frame-${Date.now()}.jpg`);
        setSelectedImage(frameFile);
        setGeneratedPrompt('');
    };


    const handleDetectImage = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur. Silakan atur di halaman 'Pengaturan'.", "error");
            return;
        }
        if (!selectedImage) {
            showMessage("Silakan pilih gambar atau frame video terlebih dahulu.", "error");
            return;
        }

        setLoading(true);
        setGeneratedPrompt('');
        showMessage("Mendeteksi prompt dari frame...", "info");

        try {
            const text = await detectPromptFromImage(selectedImage, apiKey);
            setGeneratedPrompt(text);
            showMessage("Deteksi prompt berhasil!", "success");
        } catch (error) {
            console.error("Error detecting image:", error);
            showMessage(`Gagal mendeteksi: ${(error as Error).message}`, "error");
        } finally {
            setLoading(false);
        }
    };
    
    const handleGenerateVideo = () => {
        if (!generatedPrompt) {
            showMessage("Tidak ada prompt untuk dianalisis.", "error");
            return;
        }
        if (!selectedImage) {
            showMessage("Tidak ada gambar yang dipilih untuk video.", "error");
            return;
        }
        onGenerateVideo(generatedPrompt, selectedImage);
    };

    const handleExtractAndNavigate = async (assetType: 'subjek' | 'objek' | 'lokasi' | 'aksi') => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur. Silakan atur di halaman 'Pengaturan'.", "error");
            return;
        }
        if (!generatedPrompt) {
            showMessage("Tidak ada prompt untuk dianalisis.", "error");
            return;
        }

        setIsParsing(true);
        showMessage(`Mengekstrak detail untuk ${assetType} builder...`, "info");
        
        try {
            const parsedResult = await extractDetailsFromPrompt(generatedPrompt, assetType, apiKey);
            setLastDetectionData({ type: assetType, details: parsedResult });
            showMessage(`Ekstraksi berhasil! Mengarahkan...`, "success");
            
            let targetPage: Page;
            switch(assetType) {
                case 'subjek': targetPage = 'subjectBuilder'; break;
                case 'objek': targetPage = 'objectBuilder'; break;
                case 'lokasi': targetPage = 'locationBuilder'; break;
                case 'aksi': targetPage = 'actionBuilder'; break;
            }
            setTimeout(() => setCurrentPage(targetPage), 1000);
        } catch (error) {
            console.error("Error parsing prompt:", error);
            showMessage(`Gagal mengekstrak detail: ${(error as Error).message}`, "error");
        } finally {
            setIsParsing(false);
        }
    };

    const getMessageBgColor = () => {
        if (messageType === 'success') return 'bg-green-500';
        if (messageType === 'error') return 'bg-red-500';
        return 'bg-blue-500';
    };
    
    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">Image & Video Detector 🖼</h2>
            {message && <div className={`p-3 mb-4 rounded-md ${getMessageBgColor()} text-white`}>{message}</div>}

            <div className="bg-gray-700 p-6 rounded-lg shadow-inner mb-8">
                <label className="block text-gray-300 text-lg font-semibold mb-3" htmlFor="fileUpload">Unggah Gambar atau Video</label>
                <input
                    type="file" id="fileUpload" accept="image/*,video/*" onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />

                {isVideoLoading && (
                    <div className="mt-6 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
                        <p className="mt-2 text-gray-300">Mengekstrak frame dari video...</p>
                    </div>
                )}
                
                {extractedFrames.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Pilih Frame Kunci</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {extractedFrames.map((frame, index) => (
                                <div 
                                    key={index} 
                                    className={`cursor-pointer border-4 rounded-lg overflow-hidden transition-all duration-200 ${imagePreview === frame ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-500'}`} 
                                    onClick={() => handleFrameSelect(frame)}
                                >
                                    <img src={frame} alt={`Frame ${index + 1}`} className="w-full h-auto object-cover block" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {imagePreview && (
                    <div className="mt-6 flex flex-col items-center">
                        <h3 className="text-xl font-semibold text-white mb-4">Pratinjau Gambar / Frame Terpilih</h3>
                        <img src={imagePreview} alt="Pratinjau" className="max-w-full h-auto max-h-80 rounded-lg shadow-md border border-gray-600" />
                        <button onClick={handleDetectImage} disabled={loading} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                            {loading ? 'Mendeteksi...' : 'Deteksi Prompt dari Frame'}
                        </button>
                    </div>
                )}
            </div>

            {generatedPrompt && (
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold text-white mb-4">Prompt yang Dihasilkan:</h3>
                     <div className="relative bg-gray-900 p-4 rounded-md border border-gray-600 mb-4">
                         <textarea
                             value={generatedPrompt}
                             onChange={(e) => setGeneratedPrompt(e.target.value)}
                             className="w-full h-48 p-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                             placeholder="Hasil deteksi..."
                         />
                         <button onClick={handleCopyPrompt} className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full" title="Salin Prompt">
                             <Copy className="w-4 h-4" />
                         </button>
                     </div>
                    <div className="flex flex-wrap gap-4 justify-end">
                        <div className="relative group">
                             <button onClick={handleGenerateVideo} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                 <Video className="w-5 h-5" /> Buat Video
                             </button>
                             <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Kirim prompt dan gambar ini ke Halaman Video Generator.</span>
                        </div>
                        <div className="relative group">
                             <button onClick={() => handleExtractAndNavigate('subjek')} disabled={isParsing} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                                 {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />} {isParsing ? 'Mengekstrak...' : 'Jadikan Subjek'}
                             </button>
                             <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Ekstrak detail subjek dan buka di Subject Builder.</span>
                        </div>
                        <div className="relative group">
                             <button onClick={() => handleExtractAndNavigate('objek')} disabled={isParsing} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                                {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Box className="w-5 h-5" />} {isParsing ? 'Mengekstrak...' : 'Jadikan Objek'}
                             </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Ekstrak detail objek dan buka di Object Builder.</span>
                        </div>
                        <div className="relative group">
                             <button onClick={() => handleExtractAndNavigate('lokasi')} disabled={isParsing} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                                 {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />} {isParsing ? 'Mengekstrak...' : 'Jadikan Lokasi'}
                             </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Ekstrak detail lokasi dan buka di Location Builder.</span>
                        </div>
                        <div className="relative group">
                             <button onClick={() => handleExtractAndNavigate('aksi')} disabled={isParsing} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                                 {isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />} {isParsing ? 'Mengekstrak...' : 'Jadikan Aksi'}
                             </button>
                             <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Ekstrak deskripsi aksi dan buka di Action Builder.</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageDetectorPage;