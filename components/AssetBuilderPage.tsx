import React, { useState, useEffect, useRef } from 'react';
import { Plus, Save, X, Edit2, Trash2, Upload, Download } from 'lucide-react';
import { AssetType, FormField, Asset, Subject, GObject, Location, Action } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import InputField from './ui/InputField';
import TextAreaField from './ui/TextAreaField';
import SelectField from './ui/SelectField';

type FormData = Omit<Subject, 'id'> | Omit<GObject, 'id'> | Omit<Location, 'id'> | Omit<Action, 'id'>;

interface AssetBuilderPageProps {
    assetType: AssetType;
    collectionName: string;
    formFields: FormField[];
    initialFormData: FormData;
    lastDetectionData: any;
    setLastDetectionData: (data: any) => void;
    apiKey: string;
}

const AssetBuilderPage: React.FC<AssetBuilderPageProps> = ({ assetType, collectionName, formFields, initialFormData, lastDetectionData, setLastDetectionData }) => {
    const [assets, setAssets] = useLocalStorage<Asset[]>(collectionName, []);
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const isDataRelevant = lastDetectionData && lastDetectionData.type.toLowerCase() === assetType.toLowerCase();
        if (isDataRelevant) {
            setFormData(prev => ({ ...initialFormData, ...lastDetectionData.details }));
            showMessage(`Data ${assetType} dari gambar berhasil dimuat!`, 'success');
            setLastDetectionData(null); // Clear data after loading
        }
    }, [lastDetectionData, assetType, setLastDetectionData, initialFormData]);
    
    const showMessage = (msg: string, type: 'success' | 'error') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const assetName = (formData as any).name;
        if (!assetName || !assetName.trim()) {
            showMessage("Nama tidak boleh kosong.", "error");
            return;
        }

        if (isEditing && editId) {
            setAssets(assets.map(asset => asset.id === editId ? { id: editId, ...formData } as Asset : asset));
            showMessage(`${assetType} berhasil diperbarui!`, "success");
        } else {
            const newAsset: Asset = { id: crypto.randomUUID(), ...formData } as Asset;
            setAssets([...assets, newAsset]);
            showMessage(`${assetType} berhasil ditambahkan!`, "success");
        }
        resetForm();
    };

    const handleEdit = (asset: Asset) => {
        const { id, ...dataToEdit } = asset;
        setFormData(dataToEdit as FormData);
        setIsEditing(true);
        setEditId(id);
    };

    const handleDelete = (id: string) => {
        setAssets(assets.filter(asset => asset.id !== id));
        showMessage(`${assetType} berhasil dihapus!`, "success");
    };

    const handleDeleteAll = () => {
        if (window.confirm(`Anda yakin ingin menghapus semua ${assetType}?`)) {
            setAssets([]);
            showMessage(`Semua ${assetType} berhasil dihapus!`, "success");
        }
    };

    const resetForm = () => {
        setFormData(initialFormData);
        setIsEditing(false);
        setEditId(null);
    };
    
    const handleSaveToFile = () => {
        const dataToSave = JSON.stringify(formData, null, 2);
        const blob = new Blob([dataToSave], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${(formData as any).name || assetType.toLowerCase()}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
        showMessage(`${assetType} berhasil diekspor!`, "success");
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const loadedData = JSON.parse(e.target?.result as string);
                if (loadedData && typeof loadedData === 'object' && 'name' in loadedData) {
                    const dataToImport = { ...initialFormData };
                    for (const key in dataToImport) {
                        if (loadedData.hasOwnProperty(key)) {
                            (dataToImport as any)[key] = loadedData[key];
                        }
                    }
                    const newAsset: Asset = { id: crypto.randomUUID(), ...dataToImport } as Asset;
                    setAssets(prev => [...prev, newAsset]);
                    showMessage(`${assetType} "${newAsset.name || 'tanpa nama'}" berhasil diimpor!`, "success");
                } else {
                    showMessage("Format file tidak valid.", "error");
                }
            } catch (error) {
                showMessage("Gagal membaca file.", "error");
            }
        };
        reader.readAsText(file);
        if (event.target) event.target.value = '';
    };

    return (
        <div className="p-6 bg-gray-800 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-400 mb-6">{assetType} Builder</h2>
            {message && <div className={`p-3 mb-4 rounded-md ${messageType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>{message}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-700 p-6 rounded-lg shadow-inner">
                {formFields.map((field, index) => {
                    if (field.type === 'heading') {
                        return <h3 key={index} className="col-span-full text-xl font-semibold text-white mt-4 mb-2">{field.label}</h3>;
                    }
                    const fieldName = field.name as keyof FormData;
                    const value = formData[fieldName] as string || '';

                    if (field.type === 'textarea') {
                        return <TextAreaField key={fieldName} {...field} name={fieldName} value={value} onChange={handleChange} tooltip={field.tooltip} />;
                    }
                    if (field.type === 'select') {
                        return <SelectField key={fieldName} {...field} name={fieldName} value={value} onChange={handleChange} options={field.options || []} tooltip={field.tooltip} />;
                    }
                    return <InputField key={fieldName} {...field} name={fieldName} value={value} onChange={handleChange} tooltip={field.tooltip} />;
                })}
                <div className="col-span-full flex flex-wrap justify-end gap-4 mt-6">
                    <div className="relative group">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"><Upload className="w-5 h-5" /> Import</button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Impor aset dari file .json.</span>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                    <div className="relative group">
                        <button type="button" onClick={handleSaveToFile} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"><Download className="w-5 h-5" /> Export</button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-700 rounded-md shadow-lg invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none">Ekspor data dari form saat ini ke file .json.</span>
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md">
                        {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        {isEditing ? `Perbarui ${assetType}` : `Tambah ${assetType}`}
                    </button>
                    {isEditing && <button type="button" onClick={resetForm} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md"><X className="w-5 h-5" /> Batal</button>}
                </div>
            </form>
            
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-blue-400">Koleksi {assetType} Anda</h3>
                {assets.length > 0 && <button onClick={handleDeleteAll} className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-md text-sm"><Trash2 className="w-4 h-4" /> Hapus Semua</button>}
            </div>
            {assets.length === 0 ? <p className="text-gray-400">Belum ada {assetType.toLowerCase()} yang tersimpan.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assets.map(asset => {
                        const isAction = assetType === AssetType.Aksi;
                        
                        // Menentukan judul dan deskripsi untuk konsistensi
                        const title = isAction
                            ? `Aksi: ${(asset as Action).genre || 'Tanpa Genre'}`
                            : asset.name;

                        const description = isAction
                            ? asset.name // Untuk Aksi, 'nama' adalah deskripsinya
                            : (asset as GObject).uniqueFeatures ||
                              (asset as Location).keyElements ||
                              Object.values(asset)
                                  .slice(2)
                                  .filter(v => typeof v === 'string' && v.trim())
                                  .join(', ');

                        return (
                            <div key={asset.id} className="bg-gray-700 p-5 rounded-lg shadow-md flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xl font-semibold text-white mb-2 truncate" title={title}>
                                        {title || `${assetType} Tanpa Nama`}
                                    </h4>
                                    <p className="text-gray-300 text-sm break-words line-clamp-3" title={description}>
                                        {description}
                                    </p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleEdit(asset)} className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm"><Edit2 className="w-4 h-4" /> Edit</button>
                                    <button onClick={() => handleDelete(asset.id)} className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg flex items-center gap-1 text-sm"><Trash2 className="w-4 h-4" /> Hapus</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AssetBuilderPage;