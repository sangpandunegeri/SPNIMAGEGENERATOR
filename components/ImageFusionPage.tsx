import React, { useState, useRef } from 'react';
import { Loader2, Wand2, Download, Copy, Trash2, Image as ImageIcon, Ratio, X, Video } from 'lucide-react';
import { mergeImagesWithPrompt, generateImageFromImageAndText } from '../services/geminiService';
import TextAreaField from './ui/TextAreaField';

interface ImageFusionPageProps {
    apiKey: string;
    onGenerateVideo: (prompt: string, imageFile: File | null) => void;
}

const ImageUploader: React.FC<{ onUpload: (file: File, preview: string) => void; imagePreview: string | null; title: string; }> = ({ onUpload, imagePreview, title }) => {
    const inputRef = useRef<HTMLInputElement>(null);

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
        <div 
            className="w-full bg-gray-900/50 p-4 rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors text-center cursor-pointer"
            onClick={() => inputRef.current?.click()}
        >
            <input type="file" ref={inputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            {imagePreview ? (
                <img src={imagePreview} alt="Pratinjau" className="w-full h-48 object-contain rounded-md" />
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm">Klik untuk mengunggah</p>
                </div>
            )}
        </div>
    );
};

const ImageFusionPage: React.FC<ImageFusionPageProps> = ({ apiKey, onGenerateVideo }) => {
    const [image1, setImage1] = useState<{ file: File, preview: string } | null>(null);
    const [image2, setImage2] = useState<{ file: File, preview: string } | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isFaceswap, setIsFaceswap] = useState(false);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [videoPrompt, setVideoPrompt] = useState('');


    // State for ratio change modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageToEdit, setImageToEdit] = useState<{ which: 'image1' | 'image2', file: File, preview: string } | null>(null);
    const [targetRatio, setTargetRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3' | '3:4'>('16:9');
    const [userOutpaintPrompt, setUserOutpaintPrompt] = useState('');
    const [isGeneratingRatio, setIsGeneratingRatio] = useState(false);
    const [editedImagePreview, setEditedImagePreview] = useState<string | null>(null);

    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleMerge = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur. Silakan atur di halaman 'Pengaturan'.", 'error');
            return;
        }
        if (!image1 || !image2) {
            showMessage('Harap unggah kedua gambar.', 'error');
            return;
        }
        if (!prompt.trim() && !isFaceswap) {
            showMessage('Prompt tidak boleh kosong jika tidak dalam mode Faceswap.', 'error');
            return;
        }

        setLoading(true);
        setResultImage(null);
        showMessage('Menggabungkan gambar...', 'info');

        try {
            const resultBase64 = await mergeImagesWithPrompt(
                image1.file,
                image2.file,
                isFaceswap,
                prompt,
                apiKey
            );
            setResultImage(`data:image/png;base64,${resultBase64}`);
            setVideoPrompt(`Animate this image slightly for 3 seconds.`);
            showMessage('Gambar berhasil digabungkan!', 'success');
        } catch (error) {
            console.error(error);
            showMessage(`Gagal menggabungkan gambar: ${(error as Error).message}`, 'error');
        } finally {
            setLoading(false);
        }
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

    const handleGenerateVideo = () => {
        if (!resultImage) {
            showMessage("Harap hasilkan gambar gabungan terlebih dahulu.", 'error');
            return;
        }
        if (!videoPrompt.trim()) {
            showMessage("Harap masukkan prompt untuk video.", 'error');
            return;
        }
        const imageFile = dataURLtoFile(resultImage, `fused-image-${Date.now()}.png`);
        onGenerateVideo(videoPrompt, imageFile);
    };


    const handleReset = () => {
        setImage1(null);
        setImage2(null);
        setPrompt('');
        setIsFaceswap(false);
        setResultImage(null);
        setVideoPrompt('');
        showMessage("Area kerja telah direset.", "info");
    };
    
    const handleCopy = () => {
        if (resultImage) {
            fetch(resultImage)
                .then(res => res.blob())
                .then(blob => {
                    if (navigator.clipboard && 'write' in navigator.clipboard) {
                        navigator.clipboard.write([
                            new ClipboardItem({ 'image/png': blob })
                        ]);
                        showMessage("Gambar berhasil disalin ke clipboard!", 'success');
                    } else {
                         showMessage("Penyalinan gambar tidak didukung di browser ini.", "error");
                    }
                }).catch(err => {
                    console.error("Gagal menyalin gambar:", err);
                    showMessage("Gagal menyalin gambar.", "error");
                });
        }
    };

    const openRatioModal = (which: 'image1' | 'image2') => {
        const imageState = which === 'image1' ? image1 : image2;
        if (imageState) {
            setImageToEdit({ which, ...imageState });
            setIsModalOpen(true);
            setEditedImagePreview(null);
            setUserOutpaintPrompt('');
        }
    };

    const closeRatioModal = () => {
        setIsModalOpen(false);
        setImageToEdit(null);
        setEditedImagePreview(null);
        setUserOutpaintPrompt('');
        setIsGeneratingRatio(false);
    };

    const handleGenerateRatioChange = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur. Silakan atur di halaman 'Pengaturan'.", 'error');
            return;
        }
        if (!imageToEdit) {
            showMessage('Tidak ada gambar yang dipilih untuk diedit.', 'error');
            return;
        }

        setIsGeneratingRatio(true);
        setEditedImagePreview(null);
        showMessage(`Memperluas gambar ke rasio ${targetRatio}... Ini mungkin memakan waktu.`, 'info');

        try {
            const base64Data = imageToEdit.preview.split(',')[1];
            
            const baseOutpaintingPrompt = `This is an outpainting task. Expand the canvas of this image to a new aspect ratio of ${targetRatio}. Intelligently fill in the new, empty areas by extending the existing background and scenery. The original content of the image must remain unchanged and centered. Create a seamless and natural extension of the original picture.`;
            const finalOutpaintingPrompt = userOutpaintPrompt.trim() 
                ? `${baseOutpaintingPrompt} Additional user instructions: ${userOutpaintPrompt}` 
                : baseOutpaintingPrompt;

            const resultBase64 = await generateImageFromImageAndText(
                base64Data,
                imageToEdit.file.type,
                finalOutpaintingPrompt,
                apiKey
            );

            setEditedImagePreview(`data:${imageToEdit.file.type};base64,${resultBase64}`);
            showMessage('Pratinjau gambar yang diperluas berhasil dibuat! Klik Konfirmasi untuk menyimpan.', 'success');
        } catch (error) {
            console.error(error);
            showMessage(`Gagal memperluas gambar: ${(error as Error).message}`, 'error');
        } finally {
            setIsGeneratingRatio(false);
        }
    };

    const handleConfirmRatioChange = () => {
        if (!editedImagePreview || !imageToEdit) return;

        fetch(editedImagePreview)
            .then(res => res.blob())
            .then(blob => {
                const newFile = new File([blob], imageToEdit.file.name, { type: imageToEdit.file.type });
                const updatedImage = { file: newFile, preview: editedImagePreview };

                if (imageToEdit.which === 'image1') {
                    setImage1(updatedImage);
                } else {
                    setImage2(updatedImage);
                }
                
                closeRatioModal();
                showMessage('Rasio gambar berhasil diubah.', 'success');
            }).catch(err => {
                console.error("Error converting base64 to file:", err);
                showMessage('Gagal menyimpan perubahan gambar.', 'error');
            });
    };

    const getMessageBgColor = () => {
        if (messageType === 'success') return 'bg-green-500';
        if (messageType === 'error') return 'bg-red-500';
        return 'bg-blue-500';
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">Penggabung Gambar 🧩</h2>
            {message && <div className={`p-3 mb-4 rounded-md ${getMessageBgColor()} text-white`}>{message}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner space-y-6">
                    <h3 className="text-2xl font-bold text-white -mb-2">Input</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <ImageUploader title="Gambar 1 (Sumber Wajah)" imagePreview={image1?.preview || null} onUpload={(file, preview) => setImage1({ file, preview })} />
                            {image1 && (
                                <button
                                    onClick={() => openRatioModal('image1')}
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
                                >
                                    <Ratio className="w-5 h-5" /> Ubah Rasio
                                </button>
                            )}
                        </div>
                        <div className="space-y-2">
                            <ImageUploader title="Gambar 2 (Target Tubuh)" imagePreview={image2?.preview || null} onUpload={(file, preview) => setImage2({ file, preview })} />
                            {image2 && (
                                <button
                                    onClick={() => openRatioModal('image2')}
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md"
                                >
                                    <Ratio className="w-5 h-5" /> Ubah Rasio
                                </button>
                            )}
                        </div>
                    </div>
                    <TextAreaField
                        label="Instruksi Modifikasi Tambahan"
                        name="fusionPrompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                        placeholder="Contoh: ubah latar belakang menjadi pemandangan fantasi, tambahkan efek pencahayaan dramatis."
                    />
                    <div className="relative group">
                        <label className="flex items-center gap-3 text-gray-300 cursor-pointer p-2 rounded-md hover:bg-gray-600/50 transition-colors">
                            <input
                                type="checkbox"
                                checked={isFaceswap}
                                onChange={(e) => setIsFaceswap(e.target.checked)}
                                className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 rounded text-cyan-500 focus:ring-cyan-500"
                            />
                            <span>Aktifkan Faceswap (Wajah Gbr 1 → Tubuh Gbr 2)</span>
                        </label>
                        <span className="absolute bottom-full left-0 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">
                            Jika dicentang, AI akan memprioritaskan untuk menukar wajah dari Gambar 1 ke tubuh di Gambar 2 sebelum menerapkan instruksi tambahan Anda.
                        </span>
                    </div>
                     <div className="flex flex-wrap gap-4">
                        <button
                            onClick={handleMerge}
                            disabled={loading || !image1 || !image2 }
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                            {loading ? 'Memproses...' : 'Gabungkan Gambar'}
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={loading}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 shadow-md disabled:opacity-50"
                            title="Reset"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Output Section */}
                <div className="bg-gray-700 p-6 rounded-lg shadow-inner flex flex-col items-center justify-center min-h-[400px]">
                    <h3 className="text-2xl font-bold text-white mb-4">Hasil</h3>
                    {loading ? (
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto" />
                            <p className="mt-4 text-white text-lg font-semibold">AI sedang bekerja...</p>
                        </div>
                    ) : resultImage ? (
                        <div className="w-full text-center">
                            <img src={resultImage} alt="Hasil Penggabungan" className="w-full max-h-[400px] object-contain rounded-lg shadow-lg border-2 border-gray-600 mb-4 bg-black" />
                            <div className="flex justify-center gap-4">
                                <a
                                    href={resultImage}
                                    download={`fused-image-${Date.now()}.png`}
                                    className="inline-flex bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg items-center justify-center gap-2 transition-colors duration-200 shadow-md text-sm"
                                >
                                    <Download className="w-4 h-4" /> Unduh
                                </a>
                                <button
                                    onClick={handleCopy}
                                    className="inline-flex bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg items-center justify-center gap-2 transition-colors duration-200 shadow-md text-sm"
                                >
                                    <Copy className="w-4 h-4" /> Salin
                                </button>
                            </div>
                             <div className="mt-6 border-t border-gray-600 pt-4">
                                <h4 className="text-xl font-bold text-white mb-2">Buat Video dari Gambar Ini</h4>
                                <TextAreaField 
                                    label="Prompt Video"
                                    name="videoPrompt"
                                    value={videoPrompt}
                                    onChange={(e) => setVideoPrompt(e.target.value)}
                                    rows={2}
                                    placeholder="Contoh: buat gambar ini menjadi video 3 detik, dengan sedikit hembusan angin pada rambut karakter."
                                />
                                <button
                                    onClick={handleGenerateVideo}
                                    className="mt-4 inline-flex bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg items-center justify-center gap-2"
                                >
                                    <Video className="w-5 h-5" /> Hasilkan Video
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">
                            <ImageIcon className="w-16 h-16 mx-auto mb-4"/>
                            <p className="mt-2 text-sm">Hasil penggabungan akan muncul di sini.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && imageToEdit && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeRatioModal}>
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-3xl border border-gray-700" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-blue-400">Ubah Rasio Aspek (Outpainting)</h3>
                            <button onClick={closeRatioModal} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center p-2">
                                {isGeneratingRatio ? (
                                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin"/>
                                ) : (
                                    <img src={editedImagePreview || imageToEdit.preview} alt="Pratinjau" className="max-w-full max-h-full object-contain" />
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-300 mb-2 font-semibold">1. Pilih Rasio Target:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(['16:9', '9:16', '1:1', '4:3', '3:4'] as const).map(ratio => (
                                            <button 
                                                key={ratio} 
                                                onClick={() => setTargetRatio(ratio)} 
                                                className={`px-4 py-2 text-sm rounded-lg ${targetRatio === ratio ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <TextAreaField
                                    label="Instruksi Tambahan (Opsional)"
                                    name="userOutpaintPrompt"
                                    value={userOutpaintPrompt}
                                    onChange={(e) => setUserOutpaintPrompt(e.target.value)}
                                    rows={2}
                                    placeholder="Contoh: perluas langit biru di atas..."
                                />

                                <div>
                                    <p className="text-gray-300 mb-2 font-semibold">2. Hasilkan Perluasan:</p>
                                     <button onClick={handleGenerateRatioChange} disabled={isGeneratingRatio} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50">
                                        {isGeneratingRatio ? <Loader2 className="w-5 h-5 animate-spin"/> : <Wand2 className="w-5 h-5" />}
                                        {isGeneratingRatio ? 'Memperluas...' : 'Hasilkan Perluasan'}
                                    </button>
                                </div>
                                 <p className="text-xs text-gray-400">AI akan memperluas latar belakang gambar Anda agar sesuai dengan rasio baru tanpa memotong subjek utama.</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6 border-t border-gray-700 pt-4">
                            <button onClick={closeRatioModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Batal</button>
                            <button onClick={handleConfirmRatioChange} disabled={!editedImagePreview} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                                Konfirmasi & Ganti Gambar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageFusionPage;