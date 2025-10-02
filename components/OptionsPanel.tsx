import React from 'react';
import { 
    Mode, BackgroundOption, ProductBackgroundCategory, AspectRatio, PoseCategory, AttireOption, 
    ProductBackgroundSubOptions, ProductCategory, ProductEffects, ProfileIndustry, ProfileLighting, 
    ProfileExpression, PoseCameraAngle, WeddingTheme, WeddingMoment, WeddingTimeOfDay, ProductLighting, 
    PreWeddingTheme, PreWeddingMoment, PoseBackgroundOptions
} from '../types';
import ImageUploader from './ImageUploader';
import Button from './Button';
import { useUsage } from '../contexts/UsageContext';
import { FREE_TIER_DAILY_LIMIT } from '../constants';
import Accordion from './Accordion';
import StyleInspirator from './StyleInspirator';

interface OptionsPanelProps {
    // General
    referenceFile: File | null;
    setReferenceFile: (file: File) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    stylePrompt: string;
    setStylePrompt: (prompt: string) => void;
    numberOfPhotos: number;
    setNumberOfPhotos: (num: number) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    onGenerate: () => void;
    onDownloadAll: () => void;
    isLoading: boolean;
    isGenerated: boolean;
    selectedImagesCount: number;

    // Style Inspirator
    onGetInspiration: () => void;
    isInspiring: boolean;

    // Background
    backgroundOption: BackgroundOption;
    setBackgroundOption: (option: BackgroundOption) => void;
    customBackgroundFile: File | null;
    setCustomBackgroundFile: (file: File) => void;

    // Profile Photo
    profileIndustry: ProfileIndustry;
    setProfileIndustry: (industry: ProfileIndustry) => void;
    profileLighting: ProfileLighting;
    setProfileLighting: (lighting: ProfileLighting) => void;
    profileExpression: ProfileExpression;
    setProfileExpression: (expression: ProfileExpression) => void;
    
    // Pose Generator
    poseCategory: PoseCategory;
    setPoseCategory: (category: PoseCategory) => void;
    poseScenario: string;
    setPoseScenario: (scenario: string) => void;
    poseObjectInteraction: string;
    setPoseObjectInteraction: (interaction: string) => void;
    poseCameraAngle: PoseCameraAngle[];
    onPoseCameraAngleToggle: (angle: PoseCameraAngle) => void;
    poseBackground: string;
    setPoseBackground: (bg: string) => void;

    // Wedding
    partnerFile: File | null;
    setPartnerFile: (file: File) => void;
    attire: AttireOption;
    setAttire: (option: AttireOption) => void;
    weddingTheme: WeddingTheme;
    setWeddingTheme: (theme: WeddingTheme) => void;
    weddingMoment: WeddingMoment;
    setWeddingMoment: (moment: WeddingMoment) => void;
    weddingTimeOfDay: WeddingTimeOfDay;
    setWeddingTimeOfDay: (time: WeddingTimeOfDay) => void;
    preWeddingTheme: PreWeddingTheme;
    setPreWeddingTheme: (theme: PreWeddingTheme) => void;
    preWeddingMoment: PreWeddingMoment;
    setPreWeddingMoment: (moment: PreWeddingMoment) => void;

    // Product Photo
    modelFile: File | null;
    setModelFile: (file: File) => void;
    productBackgroundCategory: ProductBackgroundCategory;
    setProductBackgroundCategory: (option: ProductBackgroundCategory) => void;
    productBackgroundSubOption: string;
    setProductBackgroundSubOption: (subOption: string) => void;
    productPoseCategory: PoseCategory;
    setProductPoseCategory: (category: PoseCategory) => void;
    productCategory: ProductCategory | null;
    setProductCategory: (category: ProductCategory | null) => void;
    productEffects: string[];
    setProductEffects: React.Dispatch<React.SetStateAction<string[]>>;
    productLighting: ProductLighting;
    setProductLighting: (lighting: ProductLighting) => void;
    productProps: string;
    setProductProps: (props: string) => void;
}

const OptionsPanel: React.FC<OptionsPanelProps> = (props) => {
    const { 
        mode, setMode, referenceFile, setReferenceFile, partnerFile, setPartnerFile, modelFile, setModelFile,
        backgroundOption, setBackgroundOption, customBackgroundFile, setCustomBackgroundFile, stylePrompt, 
        setStylePrompt, numberOfPhotos, setNumberOfPhotos, aspectRatio, setAspectRatio, onGenerate,
        onDownloadAll, isLoading, isGenerated, attire, setAttire, poseCategory, setPoseCategory,
        productBackgroundCategory, setProductBackgroundCategory, productBackgroundSubOption, 
        setProductBackgroundSubOption, productPoseCategory, setProductPoseCategory, productCategory,
        setProductCategory, productEffects, setProductEffects, profileIndustry, setProfileIndustry,
        profileLighting, setProfileLighting, profileExpression, setProfileExpression, poseScenario,
        setPoseScenario, poseObjectInteraction, setPoseObjectInteraction, poseCameraAngle, onPoseCameraAngleToggle,
        weddingTheme, setWeddingTheme, weddingMoment, setWeddingMoment, weddingTimeOfDay, setWeddingTimeOfDay,
        preWeddingTheme, setPreWeddingTheme, preWeddingMoment, setPreWeddingMoment,
        productLighting, setProductLighting, productProps, setProductProps,
        onGetInspiration, isInspiring, selectedImagesCount, poseBackground, setPoseBackground
    } = props;

    const { usageCount } = useUsage();
    const isWeddingOrPreWedding = mode === Mode.WeddingPhoto || mode === Mode.PreWeddingPhoto;

    const handleEffectToggle = (effectToToggle: string) => {
        setProductEffects(prevEffects =>
            prevEffects.includes(effectToToggle)
                ? prevEffects.filter(e => e !== effectToToggle)
                : [...prevEffects, effectToToggle]
        );
    };

    const renderProfessionalOptions = () => {
        switch (mode) {
            case Mode.ProfilePhoto:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Industri</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(ProfileIndustry).map(option => (<button key={option} onClick={() => setProfileIndustry(option)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${profileIndustry === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Gaya Pencahayaan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {Object.values(ProfileLighting).map(option => (<button key={option} onClick={() => setProfileLighting(option)} className={`flex-1 py-2 px-1 text-xs font-semibold rounded-md transition-colors ${profileLighting === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Ekspresi</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {Object.values(ProfileExpression).map(option => (<button key={option} onClick={() => setProfileExpression(option)} className={`flex-1 py-2 px-1 text-xs font-semibold rounded-md transition-colors ${profileExpression === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))}
                            </div>
                        </div>
                    </div>
                );
            case Mode.PoseGenerator:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Kategori Pose</h3>
                            <div className="flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                {Object.values(PoseCategory).map(category => (
                                    <button 
                                        key={category} 
                                        onClick={() => setPoseCategory(category)} 
                                        className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                                            poseCategory === category 
                                                ? 'bg-teal-600 text-white shadow' 
                                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="scenario-prompt" className="text-md font-bold text-gray-800 mb-2 block">Skenario (Opsional)</label>
                            <textarea id="scenario-prompt" value={poseScenario} onChange={(e) => setPoseScenario(e.target.value)} placeholder="misalnya, berbicara di atas panggung, bekerja di kafe" className="w-full p-2 bg-white text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 transition-colors" rows={2}/>
                        </div>
                         <div>
                            <label htmlFor="object-prompt" className="text-md font-bold text-gray-800 mb-2 block">Interaksi Objek (Opsional)</label>
                            <input id="object-prompt" value={poseObjectInteraction} onChange={(e) => setPoseObjectInteraction(e.target.value)} placeholder="misalnya, memegang cangkir kopi" className="w-full p-2 bg-white text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 transition-colors" />
                        </div>
                    </div>
                );
            case Mode.WeddingPhoto:
            case Mode.PreWeddingPhoto:
                 return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Pilihan Pakaian</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(AttireOption)
                                    .filter(option => 
                                        mode === Mode.WeddingPhoto
                                            ? [AttireOption.FormalWedding, AttireOption.Traditional, AttireOption.AsPerReference].includes(option)
                                            : [AttireOption.CasualChic, AttireOption.Traditional, AttireOption.AsPerReference].includes(option)
                                    )
                                    .map(option => (<button key={option} onClick={() => setAttire(option)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${attire === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))}
                            </div>
                        </div>
                         <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Tema Visual</h3>
                            <div className={`grid ${mode === Mode.WeddingPhoto ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                                {mode === Mode.WeddingPhoto
                                    ? Object.values(WeddingTheme).map(option => (<button key={option} onClick={() => setWeddingTheme(option)} className={`flex-1 py-2 px-1 text-xs font-semibold rounded-md transition-colors ${weddingTheme === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))
                                    : Object.values(PreWeddingTheme).map(option => (<button key={option} onClick={() => setPreWeddingTheme(option)} className={`flex-1 py-2 px-1 text-xs font-semibold rounded-md transition-colors ${preWeddingTheme === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Momen Pasangan</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {mode === Mode.WeddingPhoto
                                    ? Object.values(WeddingMoment).map(option => (<button key={option} onClick={() => setWeddingMoment(option)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${weddingMoment === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))
                                    : Object.values(PreWeddingMoment).map(option => (<button key={option} onClick={() => setPreWeddingMoment(option)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${preWeddingMoment === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Waktu & Pencahayaan</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.values(WeddingTimeOfDay).map(option => (<button key={option} onClick={() => setWeddingTimeOfDay(option)} className={`flex-1 py-2 px-1 text-xs font-semibold rounded-md transition-colors ${weddingTimeOfDay === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))}
                            </div>
                        </div>
                    </div>
                );
            case Mode.ProductPhoto:
                return (
                     <div className="space-y-6">
                        {modelFile && (
                            <div>
                                <h3 className="text-md font-bold text-gray-800 mb-2">Kategori Pose Model</h3>
                                <div className="flex space-x-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                    {Object.values(PoseCategory).map(category => (
                                        <button 
                                            key={category} 
                                            onClick={() => setProductPoseCategory(category)} 
                                            className={`flex-shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                                                productPoseCategory === category 
                                                    ? 'bg-teal-600 text-white shadow' 
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Pencahayaan Produk</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(ProductLighting).map(option => (<button key={option} onClick={() => setProductLighting(option)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${productLighting === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))}
                            </div>
                        </div>
                         <div>
                            <label htmlFor="props-prompt" className="text-md font-bold text-gray-800 mb-2 block">Properti Pendukung (Opsional)</label>
                            <textarea id="props-prompt" value={productProps} onChange={(e) => setProductProps(e.target.value)} placeholder="misalnya, biji kopi, koran pagi" className="w-full p-2 bg-white text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 transition-colors" rows={2}/>
                        </div>
                        <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Efek Elemen <span className="text-sm font-normal text-gray-500">(Opsional)</span></h3>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.values(ProductCategory).map(category => (<button key={category} onClick={() => setProductCategory(productCategory === category ? null : category)} className={`w-full py-2 px-1 text-xs font-semibold rounded-md transition-colors ${productCategory === category ? 'bg-teal-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{category}</button>))}
                            </div>
                            {productCategory && ProductEffects[productCategory]?.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h3 className="text-md font-semibold text-gray-800 mb-2">Pilih Efek untuk {productCategory}</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ProductEffects[productCategory].map(effect => (
                                            <button 
                                                key={effect} 
                                                onClick={() => handleEffectToggle(effect)} 
                                                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${productEffects.includes(effect) ? 'bg-teal-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                {effect}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="w-full bg-white p-6 rounded-2xl shadow-sm space-y-0 divide-y divide-gray-200 relative">
            <Accordion title="1. Unggah Gambar" defaultOpen={true}>
                 <div className="space-y-4">
                    {mode === Mode.ProductPhoto ? (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ImageUploader onImageChange={setReferenceFile} title="Unggah Foto Produk" subtitle="Wajib"/>
                                <ImageUploader onImageChange={setModelFile} title="Unggah Foto Model" subtitle="Opsional"/>
                            </div>
                        </div>
                    ) : isWeddingOrPreWedding ? (
                        <div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ImageUploader onImageChange={setReferenceFile} title="Foto Orang 1"/>
                                <ImageUploader onImageChange={setPartnerFile} title="Foto Orang 2"/>
                            </div>
                        </div>
                    ) : (
                        <ImageUploader onImageChange={setReferenceFile} />
                    )}
                 </div>
            </Accordion>
            
            <Accordion title="2. Pilih Mode" defaultOpen={true}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.values(Mode).map(option => (<button key={option} onClick={() => setMode(option)} className={`w-full py-2 px-1 rounded-md text-xs font-semibold transition-colors ${mode === option ? 'bg-teal-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{option}</button>))}
                </div>
            </Accordion>
            
            <Accordion title="3. Opsi Profesional">
                {renderProfessionalOptions()}
            </Accordion>

            <Accordion title="4. Latar & Gaya">
                <div className="space-y-6">
                    {mode !== Mode.ProductPhoto ? (
                        <>
                            <div>
                                <h3 className="text-md font-bold text-gray-800 mb-2">Sudut Kamera</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.values(PoseCameraAngle).map(option => (
                                        <button key={option} onClick={() => onPoseCameraAngleToggle(option)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${poseCameraAngle.includes(option) ? 'bg-teal-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>
                                    ))}
                                </div>
                            </div>
                            {mode === Mode.PoseGenerator ? (
                                <div>
                                    <h3 className="text-md font-bold text-gray-800 mb-2">Opsi Latar (Sesuai Pose)</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PoseBackgroundOptions[poseCategory].map(option => (<button key={option} onClick={() => setPoseBackground(option)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${poseBackground === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-md font-bold text-gray-800 mb-2">Opsi Latar</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.values(BackgroundOption).map(option => (<button key={option} onClick={() => setBackgroundOption(option)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${backgroundOption === option ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{option}</button>))}
                                    </div>
                                    {backgroundOption === BackgroundOption.EditBackground && (
                                        <div className="mt-4"><h3 className="text-md font-semibold text-gray-800 mb-2">Unggah Latar Kustom</h3><ImageUploader onImageChange={setCustomBackgroundFile} title="Unggah Gambar Latar" subtitle="Drag & drop or click"/></div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                         <div>
                            <h3 className="text-md font-bold text-gray-800 mb-2">Opsi Latar Produk</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.values(ProductBackgroundCategory).map(option => (<button key={option} onClick={() => setProductBackgroundCategory(option)} className={`w-full py-2 px-1 text-xs font-semibold rounded-md transition-colors ${productBackgroundCategory === option ? 'bg-teal-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{option}</button>))}
                            </div>
                            {ProductBackgroundSubOptions[productBackgroundCategory]?.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Detail Latar</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {ProductBackgroundSubOptions[productBackgroundCategory].map(subOption => (<button key={subOption} onClick={() => setProductBackgroundSubOption(subOption)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${productBackgroundSubOption === subOption ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{subOption}</button>))}
                                    </div>
                                </div>
                            )}
                            {productBackgroundCategory === ProductBackgroundCategory.CustomImage && (
                                <div className="mt-4"><h4 className="text-sm font-semibold text-gray-800 mb-2">Unggah Latar Kustom</h4><ImageUploader onImageChange={setCustomBackgroundFile} title="Unggah Gambar Latar" subtitle="Drag & drop or click"/></div>
                            )}
                        </div>
                    )}
                    <StyleInspirator 
                        stylePrompt={stylePrompt}
                        setStylePrompt={setStylePrompt}
                        onGetInspiration={onGetInspiration}
                        isInspiring={isInspiring}
                    />
                </div>
            </Accordion>
            
            <Accordion title="5. Pengaturan Akhir & Buat" defaultOpen={true}>
                 <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center"><label htmlFor="photo-count" className="font-semibold text-gray-700">Jumlah Foto</label><span className="px-3 py-1 bg-gray-100 text-gray-800 font-mono text-sm rounded">{numberOfPhotos}</span></div>
                        <input id="photo-count" type="range" min="1" max="12" value={numberOfPhotos} onChange={(e) => setNumberOfPhotos(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600" />
                    </div>
                    <div>
                        <h3 className="text-md font-bold text-gray-800 mb-2">Rasio Aspek</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {Object.values(AspectRatio).map(ratio => (<button key={ratio} onClick={() => setAspectRatio(ratio)} className={`py-2 text-xs font-semibold rounded-md transition-colors ${aspectRatio === ratio ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}>{ratio}</button>))}
                        </div>
                    </div>
                     <div>
                         <h3 className="text-md font-bold text-gray-800 mb-2">Penggunaan Hari Ini</h3>
                        <div className="text-center bg-gray-100 p-3 rounded-lg">
                            <p className="text-2xl font-mono font-bold text-teal-600">{usageCount} <span className="text-gray-500 text-lg">/ {FREE_TIER_DAILY_LIMIT}</span></p>
                            <p className="text-xs text-gray-500 mt-1">Batas direset setiap hari.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                         <Button onClick={onGenerate} disabled={isLoading || !referenceFile} className="w-full">
                            {isLoading ? 'Generating...' : `Generate ${numberOfPhotos} Foto`}
                        </Button>
                        <Button variant="secondary" onClick={onDownloadAll} disabled={selectedImagesCount === 0 || isLoading} className="w-full">
                            {selectedImagesCount > 0 ? `Unduh ${selectedImagesCount} Terpilih` : 'Unduh Terpilih'}
                        </Button>
                    </div>
                 </div>
            </Accordion>
        </div>
    );
};

export default OptionsPanel;