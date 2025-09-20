import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Upload, Wand2, Copy, Trash2, Bot, Video, Edit, Camera, X, RefreshCw, Save, FolderOpen } from 'lucide-react';
import { generateVeoPromptFromImage, combineStoryboardPrompts, generateImageFromImageAndText } from '../services/geminiService';
import useLocalStorage from '../hooks/useLocalStorage';
import TextAreaField from './ui/TextAreaField';

interface StoryboardGeneratorPageProps {
    apiKey: string;
    onGenerateVideo: (prompt: string, imageFile: File | null) => void;
}

interface StoryboardPanel {
    id: string;
    file: File;
    previewUrl: string;
    base64: string;
    generatedPrompt: string;
    isGenerating: boolean;
    camera: {
        zoom: number;
        panX: number;
        panY: number;
        orbit: number;
    };
}

interface SavedPanel {
    id: string;
    base64: string;
    generatedPrompt: string;
    isGenerating: boolean;
    camera: {
        zoom: number;
        panX: number;
        panY: number;
        orbit: number;
    };
    filename: string;
    mimeType: string;
}

/**
 * Menerapkan transformasi zoom & pan pada gambar base64 menggunakan canvas.
 * @param base64Image Data gambar base64 tanpa prefix.
 * @param mimeType Tipe MIME gambar.
 * @param camera Pengaturan kamera (zoom, panX, panY).
 * @returns Promise yang menghasilkan data base64 baru dari gambar yang telah ditransformasi.
 */
const applyCameraTransforms = (
    base64Image: string,
    mimeType: string,
    camera: StoryboardPanel['camera']
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Tidak dapat memperoleh konteks canvas'));
            }

            canvas.width = img.width;
            canvas.height = img.height;

            // Hitung persegi sumber (bagian yang akan dipotong dari gambar asli)
            const sourceWidth = img.width / camera.zoom;
            const sourceHeight = img.height / camera.zoom;

            // Hitung offset pan berdasarkan persentase
            // Area yang dapat di-pan adalah (img.width - sourceWidth)
            const panXOffset = (camera.panX / 100) * (img.width - sourceWidth);
            const panYOffset = (camera.panY / 100) * (img.height - sourceHeight);
            
            // Mulai dari tengah dan terapkan offset pan
            const sourceX = (img.width - sourceWidth) / 2 - panXOffset;
            const sourceY = (img.height - sourceHeight) / 2 - panYOffset;

            // Bersihkan canvas dan gambar gambar yang telah ditransformasi
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                img,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0, // destinationX
                0, // destinationY
                canvas.width, // destinationWidth
                canvas.height // destinationHeight
            );

            resolve(canvas.toDataURL(mimeType).split(',')[1]); // Kembalikan hanya data base64
        };
        img.onerror = reject;
        img.src = `data:${mimeType};base64,${base64Image}`;
    });
};


const StoryboardGeneratorPage: React.FC<StoryboardGeneratorPageProps> = ({ apiKey, onGenerateVideo }) => {
    const [panels, setPanels] = useState<StoryboardPanel[]>([]);
    const [savedStoryboard, setSavedStoryboard] = useLocalStorage<SavedPanel[] | null>('savedStoryboard', null);
    const [finalPrompt, setFinalPrompt] = useState('');
    const [isGeneratingFinalPrompt, setIsGeneratingFinalPrompt] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // State untuk Modal Edit
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPanelForEdit, setSelectedPanelForEdit] = useState<StoryboardPanel | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Cleanup blob URLs to prevent memory leaks when the component unmounts or panels change.
        return () => {
            panels.forEach(panel => URL.revokeObjectURL(panel.previewUrl));
        };
    }, [panels]);

    const showMessage = (msg: string, type: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const previewUrl = URL.createObjectURL(file);
                    const base64 = (reader.result as string).split(',')[1];
                    const newPanel: StoryboardPanel = {
                        id: crypto.randomUUID(),
                        file,
                        previewUrl,
                        base64,
                        generatedPrompt: '',
                        isGenerating: false,
                        camera: { zoom: 1, panX: 0, panY: 0, orbit: 0 },
                    };
                    setPanels(prev => [...prev, newPanel]);
                };
                reader.readAsDataURL(file);
            });
            setFinalPrompt('');
        }
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleGeneratePanelPrompt = async (panelId: string) => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", 'error');
            return;
        }
        setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isGenerating: true } : p));
        const panel = panels.find(p => p.id === panelId);
        if (!panel) return;

        try {
            const promptText = await generateVeoPromptFromImage(panel.file, apiKey);
            setPanels(prev => prev.map(p => p.id === panelId ? { ...p, generatedPrompt: promptText, isGenerating: false } : p));
        } catch (error) {
            console.error(error);
            showMessage(`Gagal membuat prompt: ${(error as Error).message}`, 'error');
            setPanels(prev => prev.map(p => p.id === panelId ? { ...p, isGenerating: false } : p));
        }
    };
    
    const handleDeletePanel = (panelId: string) => {
        const panelToDelete = panels.find(p => p.id === panelId);
        if (panelToDelete) {
            URL.revokeObjectURL(panelToDelete.previewUrl);
        }
        setPanels(prev => prev.filter(p => p.id !== panelId));
        showMessage("Panel berhasil dihapus.", "success");
    };

    const getCameraMovementPrompt = (camera: StoryboardPanel['camera']): string => {
        const parts: string[] = [];
        if (camera.zoom > 1.05) parts.push(`zooms in ${camera.zoom.toFixed(1)}x`);
        else if (camera.zoom < 0.95) parts.push(`zooms out ${camera.zoom.toFixed(1)}x`);
        if (Math.abs(camera.panX) > 5) parts.push(`pans ${camera.panX > 0 ? 'right' : 'left'}`);
        if (Math.abs(camera.panY) > 5) parts.push(`pans ${camera.panY > 0 ? 'down' : 'up'}`);
        if (Math.abs(camera.orbit) > 5) {
            parts.push(`orbits around the subject ${camera.orbit > 0 ? 'to the right' : 'to the left'} by ${Math.abs(camera.orbit)} degrees`);
        }
        return parts.length > 0 ? `The camera ${parts.join(', ')}.` : '';
    };

    const handleGenerateFinalPrompt = async () => {
        const panelPrompts = panels.map(p => {
            const camPrompt = getCameraMovementPrompt(p.camera);
            return camPrompt ? `${p.generatedPrompt} ${camPrompt}` : p.generatedPrompt;
        }).filter(Boolean);
        if (panelPrompts.length < panels.length) {
            showMessage("Harap hasilkan prompt untuk semua panel terlebih dahulu.", 'error');
            return;
        }
        
        setIsGeneratingFinalPrompt(true);
        showMessage("Menggabungkan adegan...", 'info');
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
    
    const openEditModal = (panel: StoryboardPanel) => {
        setSelectedPanelForEdit(panel);
        setEditPrompt('');
        setIsEditModalOpen(true);
    };

    const handleModalCameraChange = (newSettings: Partial<StoryboardPanel['camera']>) => {
        setSelectedPanelForEdit(prevPanel => {
            if (!prevPanel) return null;
            return {
                ...prevPanel,
                camera: { ...prevPanel.camera, ...newSettings },
            };
        });
    };

    const handleGenerateEdit = async () => {
        if (!apiKey) {
            showMessage("Kunci API Gemini belum diatur.", 'error');
            return;
        }
        if (!selectedPanelForEdit) {
            showMessage("Tidak ada panel yang dipilih untuk diedit.", 'error');
            return;
        }
        if (!editPrompt.trim()) {
            showMessage("Prompt modifikasi tidak boleh kosong.", 'error');
            return;
        }
        setIsEditing(true);
        showMessage('Menerapkan transformasi kamera dan memodifikasi AI...', 'info');
    
        try {
            // Langkah 1: Terapkan transformasi sisi klien untuk zoom dan pan
            const transformedBase64 = await applyCameraTransforms(
                selectedPanelForEdit.base64,
                selectedPanelForEdit.file.type,
                selectedPanelForEdit.camera
            );
    
            // Langkah 2: Buat prompt untuk AI yang hanya menyertakan hal-hal yang tidak bisa dilakukan klien (orbit) + teks pengguna
            const orbitPrompt = Math.abs(selectedPanelForEdit.camera.orbit) > 5
                ? `The camera orbits around the subject ${selectedPanelForEdit.camera.orbit > 0 ? 'to the right' : 'to the left'}.`
                : '';
            
            const fullEditPromptForAI = [orbitPrompt, editPrompt].filter(Boolean).join(' In addition, ');
    
            // Langkah 3: Panggil AI dengan gambar yang sudah ditransformasi dan prompt yang disederhanakan
            const newImageBase64 = await generateImageFromImageAndText(
                transformedBase64,
                selectedPanelForEdit.file.type,
                fullEditPromptForAI || "no change", // Kirim prompt non-kosong jika keduanya kosong
                apiKey
            );
            
            // Langkah 4: Buat panel baru dengan gambar yang dihasilkan
            const newImageDataUrl = `data:${selectedPanelForEdit.file.type};base64,${newImageBase64}`;
            const response = await fetch(newImageDataUrl);
            const newBlob = await response.blob();
            const newFile = new File([newBlob], `edited_${selectedPanelForEdit.file.name}`, { type: selectedPanelForEdit.file.type });
            
            const newPanel: StoryboardPanel = {
                id: crypto.randomUUID(),
                file: newFile,
                previewUrl: URL.createObjectURL(newFile),
                base64: newImageBase64,
                generatedPrompt: `Modifikasi: ${editPrompt}`,
                isGenerating: false,
                camera: { zoom: 1, panX: 0, panY: 0, orbit: 0 }, // Kamera direset karena transformasi sudah "tercetak"
            };
    
            const originalIndex = panels.findIndex(p => p.id === selectedPanelForEdit.id);
            if (originalIndex !== -1) {
                const updatedPanels = [...panels];
                updatedPanels.splice(originalIndex + 1, 0, newPanel);
                setPanels(updatedPanels);
            }
    
            showMessage('Gambar berhasil dimodifikasi dan ditambahkan sebagai panel baru!', 'success');
            setIsEditModalOpen(false);
            setSelectedPanelForEdit(null);
        } catch (error) {
            console.error(error);
            showMessage(`Gagal memodifikasi: ${(error as Error).message}`, 'error');
        } finally {
            setIsEditing(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showMessage("Prompt berhasil disalin!", 'success');
    };

    const handleSaveStoryboard = () => {
        if (panels.length === 0) {
            showMessage("Tidak ada storyboard untuk disimpan.", 'error');
            return;
        }
        const storablePanels: SavedPanel[] = panels.map(p => ({
            id: p.id,
            base64: p.base64,
            generatedPrompt: p.generatedPrompt,
            isGenerating: false, // Don't save a generating state
            camera: p.camera,
            filename: p.file.name,
            mimeType: p.file.type,
        }));
        setSavedStoryboard(storablePanels);
        showMessage("Storyboard berhasil disimpan di browser Anda!", 'success');
    };

    const handleLoadStoryboard = () => {
        if (!savedStoryboard || savedStoryboard.length === 0) {
            showMessage("Tidak ada storyboard yang tersimpan untuk dimuat.", 'info');
            return;
        }

        const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
            const byteCharacters = atob(base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });
            return new File([blob], filename, { type: mimeType });
        };

        const loadedPanels: StoryboardPanel[] = savedStoryboard.map(sp => {
            const file = base64ToFile(sp.base64, sp.filename, sp.mimeType);
            const previewUrl = URL.createObjectURL(file);
            const { rotation, ...restOfCamera } = (sp.camera || {}) as any;
            return {
                ...sp,
                file,
                previewUrl,
                camera: { zoom: 1, panX: 0, panY: 0, orbit: 0, ...restOfCamera }
            };
        });
        setPanels(loadedPanels);
        showMessage("Storyboard berhasil dimuat!", 'success');
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
                <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">Mulai atau Lanjutkan Storyboard Anda</h3>
                    <p className="text-gray-400 mb-4 text-sm">Unggah gambar, atau muat sesi terakhir Anda.</p>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" multiple />
                    <div className="flex flex-wrap justify-center gap-4">
                        <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2">
                            <Upload className="w-5 h-5" /> Unggah Gambar
                        </button>
                        <button onClick={handleSaveStoryboard} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2">
                            <Save className="w-5 h-5" /> Simpan Storyboard
                        </button>
                        <button onClick={handleLoadStoryboard} disabled={!savedStoryboard} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            <FolderOpen className="w-5 h-5" /> Muat Storyboard
                        </button>
                    </div>
                </div>

                {panels.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 border-t border-gray-600 pt-4">
                        {panels.map((panel, index) => {
                             return (
                                <div key={panel.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4 items-start relative group">
                                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <button onClick={() => handleDeletePanel(panel.id)} className="bg-red-700/80 p-1.5 rounded-full" title="Hapus Panel"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="flex-shrink-0 w-full md:w-48 text-center">
                                        <div className="w-full h-auto rounded-lg border border-gray-600 bg-gray-900 overflow-hidden">
                                            <img src={panel.previewUrl} alt={`Panel ${index + 1}`} className="w-full h-full object-contain"/>
                                        </div>
                                        <span className="text-sm font-bold text-gray-400 mt-2 block">ADEGAN {index + 1}</span>
                                        
                                        <button onClick={() => handleGeneratePanelPrompt(panel.id)} disabled={panel.isGenerating} className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm w-full">
                                            {panel.isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />} {panel.isGenerating ? 'Menghasilkan...' : 'Hasilkan Deskripsi'}
                                        </button>
                                        
                                        <button onClick={() => openEditModal(panel)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm w-full">
                                            <Edit className="w-4 h-4" /> Edit dengan AI
                                        </button>
                                    </div>
                                    <div className="flex-grow w-full">
                                        <TextAreaField
                                            label={`Deskripsi Adegan ${index + 1}`}
                                            name={`prompt-${panel.id}`}
                                            value={panel.generatedPrompt}
                                            onChange={(e) => setPanels(prev => prev.map(p => p.id === panel.id ? { ...p, generatedPrompt: e.target.value } : p))}
                                            rows={6} placeholder="Deskripsi untuk adegan ini akan muncul di sini..."
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            
            {panels.length > 0 && (
                <div className="mt-8 bg-gray-700 p-6 rounded-lg shadow-inner">
                    <h3 className="text-xl font-semibold text-white mb-4">Prompt Storyboard Gabungan</h3>
                    <p className="text-gray-400 mb-4 text-sm">Gabungkan semua adegan dan gerakan kamera menjadi satu narasi video yang utuh.</p>
                    <button onClick={handleGenerateFinalPrompt} disabled={isGeneratingFinalPrompt || panels.some(p => !p.generatedPrompt)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50">
                        {isGeneratingFinalPrompt ? <Loader2 className="w-5 h-5 animate-spin"/> : <Bot className="w-5 h-5"/>} {isGeneratingFinalPrompt ? 'Menggabungkan...' : 'Hasilkan Prompt Gabungan'}
                    </button>
                    {finalPrompt && (
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold text-white mb-2">Hasil Akhir:</h4>
                            <div className="relative bg-gray-900 p-4 rounded-md border border-gray-600 mb-4">
                                <p className="text-gray-200 whitespace-pre-wrap">{finalPrompt}</p>
                                <button onClick={() => handleCopy(finalPrompt)} className="absolute top-2 right-2 p-2 rounded-full bg-gray-600 hover:bg-gray-500"><Copy className="w-4 h-4" /></button>
                            </div>
                            <button onClick={() => onGenerateVideo(finalPrompt, panels[0]?.file || null)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Video className="w-5 h-5"/> Kirim ke Video Generator</button>
                        </div>
                    )}
                </div>
            )}

            {isEditModalOpen && selectedPanelForEdit && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-4xl border border-gray-700" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-blue-400">Edit dengan AI & Kamera</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-6 h-6"/></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col items-center">
                                <div className="w-full h-auto rounded-lg border border-gray-600 bg-gray-900 overflow-hidden mb-2">
                                    <img 
                                        src={selectedPanelForEdit.previewUrl} 
                                        alt="Panel untuk diedit" 
                                        className="w-full h-full object-contain transition-transform duration-300"
                                        style={{ transform: `scale(${selectedPanelForEdit.camera.zoom}) translate(${selectedPanelForEdit.camera.panX}%, ${selectedPanelForEdit.camera.panY}%)` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-400">Pratinjau Gerakan Kamera</span>
                            </div>
                            <div>
                                <TextAreaField 
                                    label="Jelaskan modifikasi visual" 
                                    name="editPrompt" 
                                    value={editPrompt} 
                                    onChange={e => setEditPrompt(e.target.value)} 
                                    rows={4} 
                                    placeholder="Contoh: tambahkan kuda di samping karakter, ubah langit menjadi senja..."
                                />
                                <div className="mt-4 border-t border-gray-600 pt-4">
                                    <h4 className="text-lg font-semibold text-white mb-2">Kontrol Kamera untuk Frame Berikutnya</h4>
                                    <div className="space-y-3 text-sm text-gray-300">
                                        <div>
                                            <label>Zoom: {selectedPanelForEdit.camera.zoom.toFixed(2)}x</label>
                                            <input type="range" min="0.5" max="2" step="0.05" value={selectedPanelForEdit.camera.zoom} onChange={e => handleModalCameraChange({ zoom: parseFloat(e.target.value) })} className="w-full" />
                                        </div>
                                        <div>
                                            <label>Pan X: {selectedPanelForEdit.camera.panX}%</label>
                                            <input type="range" min="-50" max="50" step="1" value={selectedPanelForEdit.camera.panX} onChange={e => handleModalCameraChange({ panX: parseInt(e.target.value, 10) })} className="w-full" />
                                        </div>
                                        <div>
                                            <label>Pan Y: {selectedPanelForEdit.camera.panY}%</label>
                                            <input type="range" min="-50" max="50" step="1" value={selectedPanelForEdit.camera.panY} onChange={e => handleModalCameraChange({ panY: parseInt(e.target.value, 10) })} className="w-full" />
                                        </div>
                                        <div>
                                            <label>Orbit: {selectedPanelForEdit.camera.orbit || 0}°</label>
                                            <input type="range" min="-180" max="180" step="5" value={selectedPanelForEdit.camera.orbit || 0} onChange={e => handleModalCameraChange({ orbit: parseInt(e.target.value, 10) })} className="w-full" />
                                        </div>
                                        <button onClick={() => handleModalCameraChange({ zoom: 1, panX: 0, panY: 0, orbit: 0 })} className="bg-gray-600 hover:bg-gray-500 p-1 rounded text-xs w-full flex items-center justify-center gap-1">
                                            <RefreshCw className="w-3 h-3"/> Reset Kamera
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setIsEditModalOpen(false)} className="bg-gray-600 font-bold py-2 px-4 rounded-lg">Batal</button>
                            <button onClick={handleGenerateEdit} disabled={isEditing || !editPrompt.trim()} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-4 rounded-lg flex items-center gap-2 disabled:opacity-50">
                                {isEditing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Wand2 className="w-5 h-5"/>} {isEditing ? 'Memproses...' : 'Hasilkan & Tambah Panel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryboardGeneratorPage;