
import React from 'react';
import { Mode, BackgroundOption, ProductBackgroundOption, AspectRatio, PoseCategory } from '../types';
import ImageUploader from './ImageUploader';
import Button from './Button';
import { SettingsIcon } from './icons';

interface OptionsPanelProps {
    referenceFile: File | null;
    setReferenceFile: (file: File) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
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
    onOpenSettings: () => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = ({
    referenceFile,
    setReferenceFile,
    mode,
    setMode,
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
    onOpenSettings,
}) => {
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
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">Unggah Foto Referensi</h2>
                <ImageUploader onImageChange={setReferenceFile} />
            </div>

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

            {mode === Mode.PoseGenerator ? (
                <>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 mb-2">Opsi Latar</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(BackgroundOption).map(option => (
                                <button key={option} onClick={() => setBackgroundOption(option)}
                                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${backgroundOption === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                                    {option}
                                </button>
                            ))}
                        </div>
                        {backgroundOption === BackgroundOption.EditBackground && (
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
                        {Object.values(ProductBackgroundOption).map(option => (
                            <button key={option} onClick={() => setProductBackgroundOption(option)}
                                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${productBackgroundOption === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                    {productBackgroundOption === ProductBackgroundOption.CustomImage && (
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
                 <Button onClick={onGenerate} disabled={isLoading}>
                    {isLoading ? 'Generating...' : `Generate ${numberOfPhotos} ${mode === Mode.PoseGenerator ? 'Pose' : 'Foto'} Baru`}
                </Button>
                <Button variant="secondary" onClick={onDownloadAll} disabled={!isGenerated || isLoading}>
                    Unduh Semua
                </Button>
            </div>
        </div>
    );
};

export default OptionsPanel;
