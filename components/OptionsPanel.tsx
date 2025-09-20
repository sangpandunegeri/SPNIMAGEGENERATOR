
import React from 'react';
import { Mode, BackgroundOption, ProductBackgroundOption, AspectRatio, PoseCategory, ImageModel } from '../types';
import ImageUploader from './ImageUploader';
import Button from './Button';
import { SettingsIcon } from './icons';
import { useUsage } from '../contexts/UsageContext';
import { FREE_TIER_DAILY_LIMIT } from '../constants';

interface OptionsPanelProps {
    referenceFile: File | null;
    setReferenceFile: (file: File) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    imageModel: ImageModel;
    setImageModel: (model: ImageModel) => void;
    backgroundOption: BackgroundOption;
    setBackgroundOption: (option: BackgroundOption) => void;
    productBackgroundOption: ProductBackgroundOption;
    setProductBackgroundOption: (option: ProductBackgroundOption) => void;
    poseCategory: PoseCategory;
    setPoseCategory: (category: PoseCategory) => void;
    stylePrompt: string;
    setStylePrompt: (prompt: string) => void;
    numberOfPhotos: number;
    setNumberOfPhotos: (num: number) => void;
    delay: number;
    setDelay: (num: number) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    onGenerate: () => void;
    onDownloadAll: () => void;
    isLoading: boolean;
    isGenerated: boolean;
    customBackgroundFile: File | null;
    setCustomBackgroundFile: (file: File) => void;
    modelFile: File | null;
    setModelFile: (file: File) => void;
    onOpenSettings: () => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
    referenceFile,
    setReferenceFile,
    mode,
    setMode,
    imageModel,
    setImageModel,
    backgroundOption,
    setBackgroundOption,
    productBackgroundOption,
    setProductBackgroundOption,
    poseCategory,
    setPoseCategory,
    stylePrompt,
    setStylePrompt,
    numberOfPhotos,
    setNumberOfPhotos,
    delay,
    setDelay,
    aspectRatio,
    setAspectRatio,
    onGenerate,
    onDownloadAll,
    isLoading,
    isGenerated,
    customBackgroundFile,
    setCustomBackgroundFile,
    modelFile,
    setModelFile,
    onOpenSettings,
}) => {
    const isImageInputDisabled = imageModel === ImageModel.Imagen4;
    const { usageCount } = useUsage();

    const renderModelDescription = () => {
        if (imageModel === ImageModel.Imagen4) {
            return "Membuat gambar baru dari teks, tidak perlu foto referensi.";
        }
        return "Mengedit foto referensi yang ada untuk pose atau produk baru.";
    };
    
    return (
        <div className="w-full bg-white p-6 rounded-2xl shadow-sm space-y-6 relative">
             <div className="absolute top-4 right-4">
                <button 
                    onClick={onOpenSettings} 
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Pengaturan"
                    title="Pengaturan"
                >
                    <SettingsIcon className="w-6 h-6" />
                </button>
            </div>
            
            {mode === Mode.PoseGenerator ? (
                <div className={`transition-opacity duration-300 ${isImageInputDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Unggah Foto Referensi</h2>
                    <div className="relative">
                        <ImageUploader onImageChange={setReferenceFile} />
                        {isImageInputDisabled && <div className="absolute inset-0 bg-gray-50/50" title="Model Imagen 4 tidak memerlukan gambar referensi."></div>}
                    </div>
                </div>
            ) : ( // Product Photo Mode
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Unggah Gambar</h2>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity duration-300 ${isImageInputDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <div className="relative">
                            <ImageUploader 
                                onImageChange={setReferenceFile} 
                                title="Unggah Foto Produk"
                                subtitle="Wajib untuk Gemini Flash"
                            />
                            {isImageInputDisabled && <div className="absolute inset-0 bg-gray-50/50" title="Model Imagen 4 tidak memerlukan gambar."></div>}
                        </div>
                        <div className="relative">
                            <ImageUploader 
                                onImageChange={setModelFile}
                                title="Unggah Foto Model"
                                subtitle="Opsional"
                            />
                            {isImageInputDisabled && <div className="absolute inset-0 bg-gray-50/50" title="Model Imagen 4 tidak memerlukan gambar."></div>}
                        </div>
                    </div>
                </div>
            )}


            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Mode</h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setMode(Mode.PoseGenerator)}
                        className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${mode === Mode.PoseGenerator ? 'bg-teal-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                        {Mode.PoseGenerator}
                    </button>
                    <button 
                        onClick={() => setMode(Mode.ProductPhoto)}
                        className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-colors ${mode === Mode.ProductPhoto ? 'bg-teal-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                        {Mode.ProductPhoto}
                    </button>
                </div>
            </div>

             <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Penggunaan Hari Ini</h2>
                <div className="text-center bg-gray-100 p-3 rounded-lg">
                    <p className="text-2xl font-mono font-bold text-teal-600">
                        {usageCount} <span className="text-gray-500 text-lg">/ {FREE_TIER_DAILY_LIMIT}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        Batas direset setiap hari. Ini adalah perkiraan untuk tingkat gratis.
                    </p>
                </div>
            </div>
            
            <div>
                 <label htmlFor="image-model" className="text-lg font-bold text-gray-800 mb-2 block">Model Gambar</label>
                 <select
                    id="image-model"
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value as ImageModel)}
                    className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                 >
                    <option value={ImageModel.GeminiFlash}>Gemini Flash (Edit Cepat)</option>
                    <option value={ImageModel.Imagen4}>Imagen 4 (Generasi Baru)</option>
                 </select>
                 <p className="text-xs text-gray-500 mt-1">{renderModelDescription()}</p>
            </div>

            {mode === Mode.PoseGenerator ? (
                <>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Opsi Latar</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(BackgroundOption).map(option => {
                                const isDisabled = isImageInputDisabled && (option === BackgroundOption.Reference || option === BackgroundOption.EditBackground);
                                return (
                                <button key={option} onClick={() => setBackgroundOption(option)}
                                    disabled={isDisabled}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${backgroundOption === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {option}
                                </button>
                                );
                            })}
                        </div>
                        {backgroundOption === BackgroundOption.EditBackground && !isImageInputDisabled && (
                            <div className="mt-4">
                                <h3 className="text-md font-bold text-gray-800 mb-2">Unggah Latar Kustom</h3>
                                <ImageUploader
                                    onImageChange={setCustomBackgroundFile}
                                    title="Unggah Gambar Latar"
                                    subtitle="Drag & drop or click"
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Kategori Pose</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(PoseCategory).map(category => (
                                <button key={category} onClick={() => setPoseCategory(category)}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${poseCategory === category ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                 <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">Opsi Latar</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {Object.values(ProductBackgroundOption).map(option => {
                            const isDisabled = isImageInputDisabled && option === ProductBackgroundOption.CustomImage;
                             return (
                                <button key={option} onClick={() => setProductBackgroundOption(option)}
                                    disabled={isDisabled}
                                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${productBackgroundOption === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                    {productBackgroundOption === ProductBackgroundOption.CustomImage && !isImageInputDisabled && (
                        <div className="mt-4">
                            <h3 className="text-md font-bold text-gray-800 mb-2">Unggah Latar Kustom</h3>
                             <ImageUploader 
                                onImageChange={setCustomBackgroundFile}
                                title="Unggah Gambar Latar"
                                subtitle="Drag & drop or click"
                             />
                        </div>
                    )}
                </div>
            )}

            <div>
                <label htmlFor="style-prompt" className="text-lg font-bold text-gray-800 mb-2 block">Prompt Gaya (Opsional)</label>
                <textarea
                    id="style-prompt"
                    value={stylePrompt}
                    onChange={(e) => setStylePrompt(e.target.value)}
                    placeholder="misalnya, foto hitam putih, gaya sinematik, pencahayaan dramatis..."
                    className="w-full p-2 bg-white text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors placeholder-gray-400"
                    rows={2}
                />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label htmlFor="photo-count" className="font-semibold text-gray-700">Jumlah Foto</label>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 font-mono text-sm rounded">{numberOfPhotos}</span>
                </div>
                <input id="photo-count" type="range" min="1" max="12" value={numberOfPhotos} onChange={(e) => setNumberOfPhotos(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
            </div>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label htmlFor="delay" className="font-semibold text-gray-700">Jeda</label>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 font-mono text-sm rounded">{delay}s</span>
                </div>
                <input id="delay" type="range" min="0" max="5" value={delay} onChange={(e) => setDelay(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
            </div>

            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Rasio Aspek</h2>
                <div className="grid grid-cols-5 gap-2">
                    {Object.values(AspectRatio).map(ratio => (
                        <button key={ratio} onClick={() => setAspectRatio(ratio)}
                            className={`py-2 text-xs font-semibold rounded-md transition-colors ${aspectRatio === ratio ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                            {ratio}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex space-x-3 pt-2">
                 <Button onClick={onGenerate} disabled={isLoading} className="w-full">
                    {isLoading ? 'Generating...' : `Generate ${numberOfPhotos} ${mode === Mode.PoseGenerator ? 'Pose' : 'Foto'} Baru`}
                </Button>
                <Button variant="secondary" onClick={onDownloadAll} disabled={!isGenerated || isLoading} className="w-full">
                    Unduh Semua
                </Button>
            </div>
        </div>
    );
};

export default OptionsPanel;
