import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, GripVertical, Upload, Download } from 'lucide-react';
import { StopMotionFormData, Subject, Location, StopMotionAction, EditableLocation, TargetEngine } from '../types';
import { visualStyleOptions, locationOptions, timeOptions, weatherOptions, moodOptions, fullCameraMovementOptions, negativePromptCategories, createInitialStopMotionFormData } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import PromptGeneratorBase from './ui/PromptGeneratorBase';
import Section from './ui/Section';
import SelectField from './ui/SelectField';
import TextAreaField from './ui/TextAreaField';
import InputField from './ui/InputField';
import NegativePromptDisplay from './ui/NegativePromptDisplay';
import { constructCinematicStopMotionPrompt } from '../services/promptBuilderService';


interface StopMotionPageProps {
    promptToLoad: any;
    onLoadComplete: () => void;
    apiKey: string;
    onGenerateVideo: (prompt: string, imageFile: File | null) => void;
}

const StopMotionPage: React.FC<StopMotionPageProps> = ({ promptToLoad, onLoadComplete, apiKey, onGenerateVideo }) => {
    const [subjects] = useLocalStorage<Subject[]>('subjects', []);
    const [locations] = useLocalStorage<Location[]>('locations', []);
    const [formData, setFormData] = useState<StopMotionFormData>(() => {
        const initial = createInitialStopMotionFormData();
        return { ...initial, actions: initial.actions.map(a => ({...a, id: crypto.randomUUID()})) } as StopMotionFormData;
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [enabledNegativePrompts, setEnabledNegativePrompts] = useState(
        Object.keys(negativePromptCategories).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    const importPromptRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Drag and drop state
    const dragItem = useRef<number | null>(null);
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    useEffect(() => {
        if (promptToLoad) {
            setFormData(promptToLoad);
            setImageFile(null);
            setImagePreview(null);
            showMessage("Prompt berhasil dimuat!", "success");
            onLoadComplete();
        }
    }, [promptToLoad, onLoadComplete]);

    const combinedLocationOptions = useMemo(() => {
        const customOptions = locations.map(l => ({ value: l.name, label: l.name }));
        const customGroup = customOptions.length > 0 ? [{ label: "Lokasi Kustom", options: customOptions }] : [];
        return [...customGroup, ...locationOptions];
    }, [locations]);

    const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 3000);
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                showMessage('Ukuran file tidak boleh melebihi 4MB.', 'error');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if(imageInputRef.current) {
            imageInputRef.current.value = "";
        }
    };

    const handleGlobalChange = (name: keyof Omit<StopMotionFormData, 'actions' | 'location'>, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

     const handleLocationDetailChange = (field: keyof EditableLocation, value: string) => {
        setFormData(prev => ({
            ...prev,
            location: { ...prev.location, [field]: value }
        }));
    };

    const handleLocationTemplateChange = (value: string) => {
        const customLocation = locations.find(l => l.name === value);
        if (customLocation) {
            setFormData(prev => ({
                ...prev,
                location: {
                    name: customLocation.name || '',
                    atmosphere: customLocation.atmosphere || '',
                    keyElements: customLocation.keyElements || ''
                }
            }));
            return;
        }

        const match = value.match(/(.*?)\s*\((.*)\)/);
        if (match) {
            const [, name, details] = match;
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, name: name.trim(), keyElements: details.trim(), atmosphere: '' }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, name: value, keyElements: '', atmosphere: '' }
            }));
        }
    };

    const handleActionChange = (index: number, field: keyof Omit<StopMotionAction, 'id'>, value: string) => {
        const newActions = [...formData.actions];
        newActions[index] = { ...newActions[index], [field]: value };
        setFormData(prev => ({ ...prev, actions: newActions }));
    };

    const addAction = () => {
        setFormData(prev => ({
            ...prev,
            actions: [...prev.actions, { id: crypto.randomUUID(), description: '', duration: '2', cameraMovement: '' }]
        }));
    };

    const removeAction = (index: number) => {
        setFormData(prev => ({ ...prev, actions: prev.actions.filter((_, i) => i !== index) }));
    };
    
    // Drag and drop handlers
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        dragItem.current = index;
        setDraggingIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        if (index !== dragOverIndex) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
        e.preventDefault();
        if (dragItem.current !== null && dragItem.current !== dropIndex) {
            const newActions = [...formData.actions];
            const draggedItemContent = newActions.splice(dragItem.current, 1)[0];
            newActions.splice(dropIndex, 0, draggedItemContent);
            setFormData(prev => ({ ...prev, actions: newActions }));
        }
        handleDragEnd();
    };

    const handleDragEnd = () => {
        dragItem.current = null;
        setDraggingIndex(null);
        setDragOverIndex(null);
    };

    const constructStopMotionPrompt = (targetEngine: TargetEngine) => {
        const basePrompt = constructCinematicStopMotionPrompt(formData, subjects, !!imageFile, targetEngine);
        
        const activeNegatives = Object.entries(enabledNegativePrompts)
            .filter(([_, enabled]) => enabled)
            .flatMap(([category]) => negativePromptCategories[category]);
        if (activeNegatives.length > 0) {
            return `${basePrompt}\n\nNegative prompt:\n${activeNegatives.join(', ')}`;
        }
        return basePrompt;
    };

    const handleExportPrompt = () => {
        const dataToSave = JSON.stringify(formData, null, 2);
        const blob = new Blob([dataToSave], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `stopmotion_prompt_setup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        showMessage("Pengaturan stop motion berhasil diekspor!");
    };

    const handlePromptFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target?.result as string);
                if (loadedData && typeof loadedData === 'object' && 'actions' in loadedData && Array.isArray(loadedData.actions)) {
                    setFormData(loadedData);
                    showMessage("Pengaturan stop motion berhasil diimpor!");
                } else {
                    showMessage("Format file prompt tidak valid.", "error");
                }
            } catch (error) {
                showMessage("Gagal membaca file.", "error");
            }
        };
        reader.readAsText(file);
        if(event.target) event.target.value = ''; // Reset file input
    };

    const getActionItemClassName = (index: number) => {
        let classes = 'bg-gray-800 p-4 rounded-lg border flex gap-2 items-start transition-all duration-300 ';
        if (draggingIndex === index) {
            classes += 'opacity-50 scale-95 border-gray-600 ';
        } else {
            classes += 'opacity-100 scale-100 ';
        }
        if (dragOverIndex === index && draggingIndex !== index) {
            classes += 'border-blue-500 border-dashed';
        } else {
            classes += 'border-gray-600';
        }
        return classes;
    };


    return (
        <PromptGeneratorBase title="One Stop Motion Shot 📸" mode="One Stop Motion Shot" getFormData={() => formData} apiKey={apiKey} onGenerateVideo={onGenerateVideo} imageFile={imageFile}>
            {(displayPrompt, _, targetEngine) => (
                <>
                    <input type="file" ref={importPromptRef} onChange={handlePromptFileChange} className="hidden" accept=".json" />
                    {message && <div className={`p-3 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>{message}</div>}
                    <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Section title="Pengaturan Global">
                                    <SelectField label="Gaya Visual" name="visualStyle" value={formData.visualStyle} onChange={(e) => handleGlobalChange('visualStyle', e.target.value)} options={visualStyleOptions} />
                                    <SelectField label="Waktu" name="time" value={formData.time} onChange={(e) => handleGlobalChange('time', e.target.value)} options={timeOptions} />
                                    <SelectField label="Cuaca" name="weather" value={formData.weather} onChange={(e) => handleGlobalChange('weather', e.target.value)} options={weatherOptions} />
                                    <SelectField label="Suasana" name="mood" value={formData.mood} onChange={(e) => handleGlobalChange('mood', e.target.value)} options={moodOptions} />
                                </Section>
                                 <Section title="Lokasi">
                                    <SelectField 
                                        label="Pilih Template Lokasi" 
                                        name="locationTemplate" 
                                        value={formData.location.name} 
                                        onChange={(e) => handleLocationTemplateChange(e.target.value)} 
                                        options={combinedLocationOptions} 
                                        tooltip="Pilih template untuk mengisi detail di bawah, lalu modifikasi." 
                                    />
                                    <InputField 
                                        label="Nama Lokasi" 
                                        name="locationName" 
                                        value={formData.location.name} 
                                        onChange={(e) => handleLocationDetailChange('name', e.target.value)} 
                                    />
                                     <InputField 
                                        label="Atmosfer / Suasana" 
                                        name="locationAtmosphere" 
                                        value={formData.location.atmosphere} 
                                        onChange={(e) => handleLocationDetailChange('atmosphere', e.target.value)} 
                                    />
                                    <TextAreaField 
                                        label="Elemen Kunci" 
                                        name="locationKeyElements" 
                                        value={formData.location.keyElements} 
                                        onChange={(e) => handleLocationDetailChange('keyElements', e.target.value)} 
                                        rows={2}
                                    />
                                </Section>
                            </div>
                            <div>
                                <Section title="Subjek Utama">
                                     <SelectField label="Karakter (Opsional)" name="mainCharacterId" value={formData.mainCharacterId} onChange={(e) => handleGlobalChange('mainCharacterId', e.target.value)} options={subjects.map(c => ({ value: c.id, label: c.name }))} />
                                </Section>
                                <Section title="Referensi Visual (Opsional)">
                                    <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/jpeg, image/png, image/jpg" />
                                    {imagePreview ? (
                                        <div className="mt-2 relative w-full max-w-sm">
                                            <img src={imagePreview} alt="Pratinjau Referensi" className="w-full h-auto object-contain rounded-lg shadow-md border border-gray-600 bg-gray-800"/>
                                            <button onClick={removeImage} className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-700 text-white p-2 rounded-full" title="Hapus Gambar">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => imageInputRef.current?.click()}
                                            className="mt-2 w-full border-2 border-dashed border-gray-500 hover:border-blue-400 text-gray-400 hover:text-blue-400 font-bold py-6 px-4 rounded-lg flex flex-col items-center justify-center gap-2 transition-colors duration-200 cursor-pointer"
                                        >
                                            <Upload className="w-8 h-8" />
                                            <span>Unggah Gambar Referensi</span>
                                            <span className="text-xs text-center">Gunakan sebagai inspirasi visual untuk karakter, gaya, dan warna.</span>
                                        </div>
                                    )}
                                </Section>
                            </div>
                        </div>

                        <Section title="Rangkaian Aksi">
                            <div className="space-y-4">
                                {formData.actions.map((action, index) => (
                                    <div 
                                        key={action.id} 
                                        className={getActionItemClassName(index)}
                                        onDragOver={(e) => handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                    >
                                        <div 
                                            className="flex-shrink-0 pt-8 text-gray-500 cursor-grab touch-none" 
                                            title="Tahan dan seret untuk mengubah urutan"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <TextAreaField label={`Aksi #${index + 1}`} name="description" value={action.description} onChange={(e) => handleActionChange(index, 'description', e.target.value)} rows={3} placeholder="Contoh: berjalan ke depan..." />
                                            <InputField label="Durasi (detik)" name="duration" type="number" value={action.duration} onChange={(e) => handleActionChange(index, 'duration', e.target.value)} tooltip="Durasi dalam detik untuk aksi ini."/>
                                            <SelectField label="Gerakan Kamera" name="cameraMovement" value={action.cameraMovement} onChange={(e) => handleActionChange(index, 'cameraMovement', e.target.value)} options={fullCameraMovementOptions} tooltip="Gerakan kamera yang terjadi selama aksi ini."/>
                                        </div>
                                        <button onClick={() => removeAction(index)} className="flex-shrink-0 mt-8 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addAction} className="mt-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Tambah Aksi
                            </button>
                        </Section>
                        
                        <NegativePromptDisplay enabledCategories={enabledNegativePrompts} onToggleCategory={(cat) => setEnabledNegativePrompts(p => ({...p, [cat]: !p[cat]}))} />

                        <div className="flex flex-wrap items-center gap-4 mt-6">
                            <button onClick={() => displayPrompt(constructStopMotionPrompt(targetEngine))} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">Hasilkan Prompt</button>
                             <div className="relative group">
                                <button type="button" onClick={() => importPromptRef.current?.click()} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                    <Upload className="w-5 h-5" /> Import Prompt
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Muat rangkaian aksi dari file .json.</span>
                            </div>
                            <div className="relative group">
                                <button type="button" onClick={handleExportPrompt} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                    <Download className="w-5 h-5" /> Export Prompt
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Simpan rangkaian aksi saat ini ke file .json.</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </PromptGeneratorBase>
    );
};

export default StopMotionPage;