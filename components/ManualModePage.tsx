import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Trash2, Upload, Download } from 'lucide-react';
import { ManualFormData, Subject, GObject, Location, Action, EditableLocation, TargetEngine } from '../types';
import { visualStyleOptions, moodOptions, locationOptions, negativePromptCategories, actionLibraryOptions, cameraTypeAndLensOptions, typeShotOptions, lightingOptions, timeOptions, weatherOptions, createInitialManualFormData } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';
import PromptGeneratorBase from './ui/PromptGeneratorBase';
import Section from './ui/Section';
import SelectField from './ui/SelectField';
import TextAreaField from './ui/TextAreaField';
import SceneInputGroup from './ui/SceneInputGroup';
import NegativePromptDisplay from './ui/NegativePromptDisplay';
import { constructCinematicPrompt } from '../services/promptBuilderService';
import InputField from './ui/InputField';

interface ManualModePageProps {
    promptToLoad: any;
    onLoadComplete: () => void;
    actionToLoad: string | null;
    onActionLoadComplete: () => void;
    apiKey: string;
    onGenerateVideo: (prompt: string, imageFile: File | null) => void;
}

const ManualModePage: React.FC<ManualModePageProps> = ({ promptToLoad, onLoadComplete, actionToLoad, onActionLoadComplete, apiKey, onGenerateVideo }) => {
    const [subjects] = useLocalStorage<Subject[]>('subjects', []);
    const [objects] = useLocalStorage<GObject[]>('objects', []);
    const [locations] = useLocalStorage<Location[]>('locations', []);
    const [actions] = useLocalStorage<Action[]>('actions', []);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [enabledNegativePrompts, setEnabledNegativePrompts] = useState(
        Object.keys(negativePromptCategories).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    const importPromptRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState<ManualFormData>(() => {
        const initial = createInitialManualFormData();
        return { ...initial, scene: { ...initial.scene, id: crypto.randomUUID() } } as ManualFormData;
    });
    
    useEffect(() => {
        if (promptToLoad) {
            setFormData(promptToLoad);
            showMessage("Prompt berhasil dimuat!", "success");
            onLoadComplete();
        }
    }, [promptToLoad, onLoadComplete]);

    useEffect(() => {
        if (actionToLoad) {
            setFormData(prev => ({ ...prev, scene: { ...prev.scene, description: actionToLoad } }));
            showMessage("Aksi berhasil dimuat!", "success");
            onActionLoadComplete();
        }
    }, [actionToLoad, onActionLoadComplete]);

    const combinedLocationOptions = useMemo(() => {
        const customOptions = locations.map(l => ({ value: l.name, label: l.name }));
        const customGroup = customOptions.length > 0 ? [{ label: "Lokasi Kustom", options: customOptions }] : [];
        return [...customGroup, ...locationOptions];
    }, [locations]);

    const combinedActionOptions = useMemo(() => {
        const customActions = actions.map(a => ({ label: a.name, value: a.name }));
        const libraryGroups = actionLibraryOptions.map(g => ({
            label: g.genre,
            options: g.actions.map(a => ({ label: a, value: a }))
        }));
        if (customActions.length > 0) {
            return [{ label: "Aksi Kustom", options: customActions }, ...libraryGroups];
        }
        return libraryGroups;
    }, [actions]);
    
    const showMessage = (msg: string, type: 'success' | 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleGlobalChange = (name: keyof Omit<ManualFormData, 'scene' | 'location'>, value: string | string[]) => {
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
                location: { ...prev.location, name: name.trim(), keyElements: details.trim() }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, name: value, keyElements: '' }
            }));
        }
    };
    
    const handleSceneDataChange = (field: any, value: any) => {
        setFormData(prev => ({ ...prev, scene: { ...prev.scene, [field]: value } }));
    };
    
    const handleSupportingCharacterChange = (index: number, value: string) => {
        const newIds = [...formData.supportingCharacterIds];
        newIds[index] = value;
        handleGlobalChange('supportingCharacterIds', newIds);
    };

    const addSceneSequenceItem = (type: 'dialog' | 'pause' | 'sfx') => {
        let newItem;
        switch (type) {
            case 'dialog': newItem = { id: crypto.randomUUID(), type, characterId: '', dialogText: '', language: '', intonation: '' }; break;
            case 'pause': newItem = { id: crypto.randomUUID(), type, duration: '1' }; break;
            case 'sfx': newItem = { id: crypto.randomUUID(), type, description: '' }; break;
        }
        setFormData(prev => ({ ...prev, scene: { ...prev.scene, sceneSequence: [...prev.scene.sceneSequence, newItem] } }));
    };
    
    const constructManualPrompt = (targetEngine: TargetEngine) => {
        const prompt = constructCinematicPrompt(formData, subjects, objects, targetEngine);
        const activeNegatives = Object.entries(enabledNegativePrompts)
            .filter(([_, enabled]) => enabled)
            .flatMap(([category]) => negativePromptCategories[category]);

        if (activeNegatives.length > 0) {
            return `${prompt}\n\nNegative prompt:\n${activeNegatives.join(', ')}`;
        }
        return prompt;
    };

    const handleExportPrompt = () => {
        const dataToSave = JSON.stringify(formData, null, 2);
        const blob = new Blob([dataToSave], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `manual_prompt_setup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        showMessage("Pengaturan prompt berhasil diekspor!", "success");
    };

    const handlePromptFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target?.result as string);
                if (loadedData && typeof loadedData === 'object' && 'scene' in loadedData) {
                    setFormData(loadedData);
                    showMessage("Pengaturan prompt berhasil diimpor!", "success");
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
    
    return (
        <PromptGeneratorBase title="Mode Manual ✍🏻" mode="Manual Mode" getFormData={() => formData} apiKey={apiKey} onGenerateVideo={onGenerateVideo}>
            {(displayPrompt, _, targetEngine) => (
                <>
                    <input type="file" ref={importPromptRef} onChange={handlePromptFileChange} className="hidden" accept=".json" />
                    {message && <div className={`p-3 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>{message}</div>}
                    <div className="bg-gray-700 p-6 rounded-lg shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <Section title="Pengaturan Global">
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <SelectField label="Gaya Visual" name="visualStyle" value={formData.visualStyle} onChange={(e) => handleGlobalChange('visualStyle', e.target.value)} options={visualStyleOptions} tooltip="Tentukan gaya visual keseluruhan video, contoh: 'Sinematik' atau 'Gaya Anime'." />
                                        <SelectField label="Atmosfer" name="mood" value={formData.mood} onChange={(e) => handleGlobalChange('mood', e.target.value)} options={moodOptions} />
                                        <SelectField label="Pencahayaan" name="lighting" value={formData.lighting} onChange={(e) => handleGlobalChange('lighting', e.target.value)} options={lightingOptions} tooltip="Jenis pencahayaan sangat mempengaruhi mood adegan. 'Golden Hour' untuk nuansa hangat, 'Low-key' untuk adegan dramatis." />
                                        <SelectField label="Waktu" name="time" value={formData.time} onChange={(e) => handleGlobalChange('time', e.target.value)} options={timeOptions} />
                                        <SelectField label="Cuaca" name="weather" value={formData.weather} onChange={(e) => handleGlobalChange('weather', e.target.value)} options={weatherOptions} />
                                        <SelectField label="Tipe Lensa & Kamera" name="cameraTypeAndLens" value={formData.cameraTypeAndLens} onChange={(e) => handleGlobalChange('cameraTypeAndLens', e.target.value)} options={cameraTypeAndLensOptions} tooltip="Pilihan kamera dan lensa akan memberikan 'look' yang spesifik pada video Anda, contoh: 'ARRI Alexa' untuk nuansa sinematik."/>
                                        <SelectField label="Tipe Shot" name="typeShot" value={formData.typeShot} onChange={(e) => handleGlobalChange('typeShot', e.target.value)} options={typeShotOptions} tooltip="Tentukan seberapa 'dekat' kamera dengan subjek. 'Wide Shot' untuk menunjukkan lingkungan, 'Close-Up' untuk emosi." />
                                     </div>
                                     <TextAreaField label="Detail Visual Tambahan" name="additionalVisualDetails" value={formData.additionalVisualDetails} onChange={(e) => handleGlobalChange('additionalVisualDetails', e.target.value)} rows={2} placeholder="Contoh: nuansa warna sinematik, debu beterbangan di udara..." tooltip="Tambahkan detail visual lain yang tidak tercakup di atas, seperti color grading, efek lensa, dll."/>
                                </Section>

                                <Section title="Lokasi">
                                    <SelectField 
                                        label="Pilih Template Lokasi" 
                                        name="locationTemplate" 
                                        value={formData.location.name} 
                                        onChange={(e) => handleLocationTemplateChange(e.target.value)} 
                                        options={combinedLocationOptions} 
                                        tooltip="Pilih template untuk mengisi detail di bawah, lalu modifikasi sesuai kebutuhan." 
                                    />
                                    <InputField 
                                        label="Nama Lokasi" 
                                        name="locationName" 
                                        value={formData.location.name} 
                                        onChange={(e) => handleLocationDetailChange('name', e.target.value)} 
                                        placeholder="Contoh: Pusat Kota Siang Hari"
                                    />
                                    <InputField 
                                        label="Atmosfer / Suasana" 
                                        name="locationAtmosphere" 
                                        value={formData.location.atmosphere} 
                                        onChange={(e) => handleLocationDetailChange('atmosphere', e.target.value)} 
                                        placeholder="Contoh: Sibuk, Terik, Ramai"
                                    />
                                    <TextAreaField 
                                        label="Elemen Kunci" 
                                        name="locationKeyElements" 
                                        value={formData.location.keyElements} 
                                        onChange={(e) => handleLocationDetailChange('keyElements', e.target.value)} 
                                        placeholder="Contoh: Lampu lalu lintas, debu beterbangan, pejalan kaki"
                                        rows={2}
                                    />
                                </Section>
                                
                                <Section title="Karakter">
                                     <SelectField label="Karakter Utama" name="mainCharacterId" value={formData.mainCharacterId} onChange={(e) => handleGlobalChange('mainCharacterId', e.target.value)} options={subjects.map(s => ({ value: s.id, label: s.name }))} tooltip="Pilih karakter utama dari daftar subjek yang telah Anda buat." />
                                     {formData.supportingCharacterIds.map((id, index) => (
                                         <div key={index} className="flex items-center gap-2">
                                             <div className="flex-grow"><SelectField label={`Pendukung #${index + 1}`} name={`sc-${index}`} value={id} onChange={(e) => handleSupportingCharacterChange(index, e.target.value)} options={subjects.map(c => ({ value: c.id, label: c.name }))} defaultOption="Pilih Pendukung..." /></div>
                                             <button type="button" onClick={() => handleGlobalChange('supportingCharacterIds', formData.supportingCharacterIds.filter((_, i) => i !== index))} className="bg-red-600 p-2 rounded-full self-end mb-1"><Trash2 className="w-4 h-4" /></button>
                                         </div>
                                     ))}
                                     {formData.supportingCharacterIds.length < 3 && <button type="button" onClick={() => handleGlobalChange('supportingCharacterIds', [...formData.supportingCharacterIds, ''])} className="bg-green-600 font-bold py-2 px-4 rounded-lg flex items-center gap-2"><Plus className="w-5 h-5" /> Tambah Pendukung</button>}
                                </Section>
                            </div>
                            <div>
                                <Section title="Rangkaian Adegan">
                                    <SceneInputGroup 
                                        sceneData={formData.scene} 
                                        onChange={handleSceneDataChange} 
                                        availableCharacters={subjects.filter(s => s.id === formData.mainCharacterId || formData.supportingCharacterIds.includes(s.id))} 
                                        onAddSequenceItem={addSceneSequenceItem}
                                        onRemoveSequenceItem={index => handleSceneDataChange('sceneSequence', formData.scene.sceneSequence.filter((_, i) => i !== index))}
                                        onSequenceChange={(index, field, value) => {
                                            const newSeq = [...formData.scene.sceneSequence];
                                            (newSeq[index] as any)[field] = value;
                                            handleSceneDataChange('sceneSequence', newSeq);
                                        }}
                                        onAddObject={() => handleSceneDataChange('objects', [...formData.scene.objects, { id: crypto.randomUUID(), objectId: '' }])} 
                                        onRemoveObject={index => handleSceneDataChange('objects', formData.scene.objects.filter((_, i) => i !== index))} 
                                        onObjectChange={(index, value) => {
                                            const newObjs = [...formData.scene.objects];
                                            newObjs[index].objectId = value;
                                            handleSceneDataChange('objects', newObjs);
                                        }} 
                                        availableObjects={objects} 
                                        availableActions={combinedActionOptions}
                                    />
                                </Section>
                            </div>
                        </div>
                        <NegativePromptDisplay enabledCategories={enabledNegativePrompts} onToggleCategory={(cat) => setEnabledNegativePrompts(p => ({...p, [cat]: !p[cat]}))} />
                        <div className="flex flex-wrap items-center gap-4 mt-6">
                            <button onClick={() => displayPrompt(constructManualPrompt(targetEngine))} className="bg-blue-600 hover:bg-blue-700 font-bold py-2 px-6 rounded-lg">Hasilkan Prompt</button>
                            <div className="relative group">
                                <button type="button" onClick={() => importPromptRef.current?.click()} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                    <Upload className="w-5 h-5" /> Import Prompt
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Muat pengaturan prompt dari file .json.</span>
                            </div>
                             <div className="relative group">
                                <button type="button" onClick={handleExportPrompt} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                    <Download className="w-5 h-5" /> Export Prompt
                                </button>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Simpan semua pengaturan saat ini ke file .json.</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </PromptGeneratorBase>
    );
};

export default ManualModePage;