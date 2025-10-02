import React, { useState, useCallback, useMemo } from 'react';
import OptionsPanel from './components/OptionsPanel';
import ResultsGrid from './components/ResultsGrid';
import { 
  Mode, BackgroundOption, GeneratedImage, ProductBackgroundCategory, AspectRatio, PoseCategory, AttireOption,
  ProductBackgroundSubOptions, ProductCategory, ProductEffects, ProfileIndustry, ProfileLighting,
  ProfileExpression, PoseCameraAngle, WeddingTheme, WeddingMoment, WeddingTimeOfDay, ProductLighting,
  PreWeddingTheme, PreWeddingMoment, PoseBackgroundOptions
} from './types';
import { INITIAL_IMAGES } from './constants';
import { generatePoses, generateProductPhotos, getStyleInspiration } from './services/geminiService';
import Toast from './components/Toast';
import { useApiKey } from './contexts/ApiKeyContext';
import { useUsage } from './contexts/UsageContext';
import PreviewModal from './components/PreviewModal';

const App: React.FC = () => {
  // Common State
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>(Mode.ProfilePhoto);
  const [stylePrompt, setStylePrompt] = useState<string>('');
  const [numberOfPhotos, setNumberOfPhotos] = useState<number>(3);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Portrait);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(INITIAL_IMAGES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<React.ReactNode | null>(null);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isInspiring, setIsInspiring] = useState<boolean>(false);
  const [lastGenerationConfig, setLastGenerationConfig] = useState<any>(null);
  
  // Context
  const { activeApiKey } = useApiKey();
  const { incrementUsage } = useUsage();

  // Background State
  const [backgroundOption, setBackgroundOption] = useState<BackgroundOption>(BackgroundOption.Minimalist);
  const [customBackgroundFile, setCustomBackgroundFile] = useState<File | null>(null);

  // Profile Photo State
  const [profileIndustry, setProfileIndustry] = useState<ProfileIndustry>(ProfileIndustry.Tech);
  const [profileLighting, setProfileLighting] = useState<ProfileLighting>(ProfileLighting.SoftAndFriendly);
  const [profileExpression, setProfileExpression] = useState<ProfileExpression>(ProfileExpression.ConfidentSmile);

  // Pose Generator State
  const [poseCategory, setPoseCategory] = useState<PoseCategory>(PoseCategory.CandidLifestyle);
  const [poseScenario, setPoseScenario] = useState<string>('');
  const [poseObjectInteraction, setPoseObjectInteraction] = useState<string>('');
  const [poseCameraAngle, setPoseCameraAngle] = useState<PoseCameraAngle[]>([PoseCameraAngle.FrontEyeLevel]);
  const [poseBackground, setPoseBackground] = useState<string>('');

  // Wedding State
  const [partnerFile, setPartnerFile] = useState<File | null>(null);
  const [attire, setAttire] = useState<AttireOption>(AttireOption.FormalWedding);
  const [weddingTheme, setWeddingTheme] = useState<WeddingTheme>(WeddingTheme.ClassicTimeless);
  const [weddingMoment, setWeddingMoment] = useState<WeddingMoment>(WeddingMoment.ExchangingVows);
  const [weddingTimeOfDay, setWeddingTimeOfDay] = useState<WeddingTimeOfDay>(WeddingTimeOfDay.GoldenHour);

  // Pre-Wedding State
  const [preWeddingTheme, setPreWeddingTheme] = useState<PreWeddingTheme>(PreWeddingTheme.BohemianNatural);
  const [preWeddingMoment, setPreWeddingMoment] = useState<PreWeddingMoment>(PreWeddingMoment.LaughingTogether);


  // Product Photo State
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [productBackgroundCategory, setProductBackgroundCategory] = useState<ProductBackgroundCategory>(ProductBackgroundCategory.ProfessionalStudio);
  const [productBackgroundSubOption, setProductBackgroundSubOption] = useState<string>(ProductBackgroundSubOptions[ProductBackgroundCategory.ProfessionalStudio][0]);
  const [productPoseCategory, setProductPoseCategory] = useState<PoseCategory>(PoseCategory.CandidLifestyle);
  const [productCategory, setProductCategory] = useState<ProductCategory | null>(null);
  const [productEffects, setProductEffects] = useState<string[]>([]);
  const [productLighting, setProductLighting] = useState<ProductLighting>(ProductLighting.StandardStudio);
  const [productProps, setProductProps] = useState<string>('');

  // Effects for state resets on mode change
  React.useEffect(() => {
    setCustomBackgroundFile(null);
    if (mode === Mode.ProfilePhoto) {
      setAspectRatio(AspectRatio.Portrait);
      setBackgroundOption(BackgroundOption.Minimalist);
    } else if (mode === Mode.PoseGenerator) {
      setAspectRatio(AspectRatio.Portrait);
      // Set the default background for the current pose category
      setPoseBackground(PoseBackgroundOptions[poseCategory][0]);
    } else if (mode === Mode.WeddingPhoto) {
      setAspectRatio(AspectRatio.Portrait);
      setBackgroundOption(BackgroundOption.Minimalist);
      setAttire(AttireOption.FormalWedding);
    } else if (mode === Mode.PreWeddingPhoto) {
      setAspectRatio(AspectRatio.Portrait);
      setBackgroundOption(BackgroundOption.Minimalist);
      setAttire(AttireOption.CasualChic);
    } else if (mode === Mode.ProductPhoto) {
      setAspectRatio(AspectRatio.Square);
    }
  }, [mode, poseCategory]);

  React.useEffect(() => {
    if (mode === Mode.PoseGenerator) {
      setPoseBackground(PoseBackgroundOptions[poseCategory][0]);
    }
  }, [poseCategory, mode]);

  React.useEffect(() => {
    if (productBackgroundCategory !== ProductBackgroundCategory.CustomImage) {
        setCustomBackgroundFile(null);
    }
  }, [productBackgroundCategory]);
  
  React.useEffect(() => {
      if (backgroundOption !== BackgroundOption.EditBackground) {
        setCustomBackgroundFile(null);
    }
  }, [backgroundOption]);

  React.useEffect(() => {
    if (mode === Mode.ProductPhoto) {
        const subOptions = ProductBackgroundSubOptions[productBackgroundCategory];
        setProductBackgroundSubOption(subOptions?.[0] || '');
    }
  }, [productBackgroundCategory, mode]);

  React.useEffect(() => {
    if (!productCategory) {
        setProductEffects([]);
    }
  }, [productCategory]);

  const handleSelectImage = useCallback((id: string) => {
    setSelectedImages(prev => 
        prev.includes(id) ? prev.filter(imageId => imageId !== id) : [...prev, id]
    );
  }, []);

  const handlePoseCameraAngleToggle = (angle: PoseCameraAngle) => {
    setPoseCameraAngle(prev => {
        const isSelected = prev.includes(angle);
        if (isSelected) {
            // Prevent removing the last one, ensure at least one is selected.
            return prev.length > 1 ? prev.filter(a => a !== angle) : prev;
        } else {
            return [...prev, angle];
        }
    });
  };

  const handleGetStyleInspiration = useCallback(async () => {
    if (!activeApiKey) {
        setToastMessage("Kunci API Gemini tidak dikonfigurasi.");
        return;
    }
    setIsInspiring(true);
    try {
        const inspiration = await getStyleInspiration(mode, activeApiKey);
        setStylePrompt(prev => prev ? `${prev}, ${inspiration.toLowerCase()}` : inspiration);
    } catch (error) {
        console.error("Failed to get style inspiration:", error);
        setToastMessage("Gagal mendapatkan inspirasi gaya.");
    } finally {
        setIsInspiring(false);
    }
  }, [activeApiKey, mode]);

  const handleGenerate = useCallback(async () => {
    if (!activeApiKey) {
      setToastMessage("Kunci API Gemini tidak dikonfigurasi.");
      return;
    }
    if (!referenceFile) {
      setToastMessage("Silakan unggah gambar referensi utama.");
      return;
    }
    if ((mode === Mode.WeddingPhoto || mode === Mode.PreWeddingPhoto) && !partnerFile) {
        setToastMessage("Silakan unggah foto untuk orang kedua untuk mode pernikahan.");
        return;
    }
    if (((backgroundOption === BackgroundOption.EditBackground && mode !== Mode.ProductPhoto) || 
        (productBackgroundCategory === ProductBackgroundCategory.CustomImage && mode === Mode.ProductPhoto)) && 
        !customBackgroundFile) {
      setToastMessage("Silakan unggah gambar latar belakang kustom.");
      return;
    }

    setIsLoading(true);
    setIsGenerated(false);
    setSelectedImages([]);
    const loadingPlaceholders: GeneratedImage[] = Array.from({ length: numberOfPhotos }, (_, i) => ({
      id: `loading-${i}-${Date.now()}`, src: '', label: 'Generating...', status: 'loading',
    }));
    setGeneratedImages(loadingPlaceholders);

    const generationOptions = {
        apiKey: activeApiKey, referenceFile, backgroundOption, stylePrompt, numberOfPhotos,
        customBackgroundFile, aspectRatio, mode, poseCategory, partnerFile, attire,
        profileIndustry, profileLighting, profileExpression, poseScenario, poseObjectInteraction,
        poseCameraAngle, weddingTheme, weddingMoment, weddingTimeOfDay, 
        preWeddingTheme, preWeddingMoment, productFile: referenceFile,
        modelFile, 
        backgroundCategory: productBackgroundCategory, 
        backgroundSubOption: productBackgroundSubOption,
        productPoseCategory, productEffects, productLighting, productProps,
        poseBackground,
    };
    setLastGenerationConfig(generationOptions);

    try {
      let results;
      if (mode === Mode.ProductPhoto) {
         results = await generateProductPhotos(generationOptions);
      } else {
        results = await generatePoses(generationOptions);
      }
      
      const newImages: GeneratedImage[] = results.map((result, i) => ({
        ...result,
        id: `result-${i}-${Date.now()}`,
      }));
      setGeneratedImages(newImages);
      setIsGenerated(true);
      const successfulCreations = newImages.filter(img => img.status === 'done').length;
      if (successfulCreations > 0) {
        incrementUsage(successfulCreations);
      }
    } catch (error) {
      console.error("Failed to generate images:", error);
      const errorMessage = (error as Error).message || "An unknown error occurred.";
      if (errorMessage.includes('API key not valid')) {
          setToastMessage("Kunci API yang diberikan tidak valid.");
      } else if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          setToastMessage(<span>Kuota API habis. <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-red-200">Aktifkan penagihan di Google Cloud</a> untuk melanjutkan.</span>);
      } else {
          setToastMessage("Terjadi kesalahan saat membuat gambar. Periksa konsol.");
      }
      setGeneratedImages(INITIAL_IMAGES);
    } finally {
      setIsLoading(false);
    }
  }, [
    activeApiKey, referenceFile, mode, backgroundOption, productBackgroundCategory, productBackgroundSubOption,
    stylePrompt, numberOfPhotos, customBackgroundFile, aspectRatio, poseCategory, productPoseCategory, modelFile,
    partnerFile, attire, productEffects, incrementUsage, profileIndustry, profileLighting, profileExpression,
    poseScenario, poseObjectInteraction, poseCameraAngle, weddingTheme, weddingMoment, weddingTimeOfDay,
    preWeddingTheme, preWeddingMoment, productLighting, productProps, poseBackground
  ]);
  
  const handleRetryFailed = useCallback(async () => {
    if (!lastGenerationConfig || !activeApiKey) return;

    const successfulImages = generatedImages.filter(img => img.status === 'done');
    const failedCount = generatedImages.filter(img => img.status === 'error').length;
    if (failedCount === 0) return;

    setIsLoading(true);
    const retryPlaceholders: GeneratedImage[] = Array.from({ length: failedCount }, (_, i) => ({
        id: `loading-retry-${i}-${Date.now()}`, src: '', label: 'Generating...', status: 'loading',
    }));
    setGeneratedImages([...successfulImages, ...retryPlaceholders]);

    const retryOptions = { ...lastGenerationConfig, numberOfPhotos: failedCount };
     try {
        let results;
        if (retryOptions.mode === Mode.ProductPhoto) {
            results = await generateProductPhotos(retryOptions);
        } else {
            results = await generatePoses(retryOptions);
        }
        
        const newImages: GeneratedImage[] = results.map((result, i) => ({
            ...result,
            id: `result-retry-${i}-${Date.now()}`,
        }));
        setGeneratedImages([...successfulImages, ...newImages]);
        const successfulCreations = newImages.filter(img => img.status === 'done').length;
        if (successfulCreations > 0) {
            incrementUsage(successfulCreations);
        }
    } catch (error) {
        setToastMessage("Gagal mencoba ulang gambar.");
        setGeneratedImages(generatedImages.map(img => img.status === 'loading' ? { ...img, status: 'error', errorMessage: 'Retry failed' } : img));
    } finally {
        setIsLoading(false);
    }
  }, [lastGenerationConfig, generatedImages, activeApiKey, incrementUsage]);

  const handleDownloadSelected = useCallback(() => {
    generatedImages.forEach((image, index) => {
        if (selectedImages.includes(image.id)) {
            const link = document.createElement('a');
            link.href = image.src;
            const sanitizedLabel = image.label.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 50); 
            link.download = `aiphoto-${sanitizedLabel || `image-${index + 1}`}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
  }, [generatedImages, selectedImages]);

  const handleDownloadImage = useCallback((image: GeneratedImage) => {
    if (image.status !== 'done') return;
    const link = document.createElement('a');
    link.href = image.src;
    const sanitizedLabel = image.label.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 50);
    link.download = `aiphoto-${sanitizedLabel || `image`}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const finishedImages = useMemo(() => generatedImages.filter(img => img.status === 'done'), [generatedImages]);
  const currentPreviewIndex = useMemo(() => previewImage ? finishedImages.findIndex(img => img.id === previewImage.id) : -1, [previewImage, finishedImages]);
  const handleNextPreview = useCallback(() => { if (currentPreviewIndex !== -1 && currentPreviewIndex < finishedImages.length - 1) setPreviewImage(finishedImages[currentPreviewIndex + 1]); }, [currentPreviewIndex, finishedImages]);
  const handlePreviousPreview = useCallback(() => { if (currentPreviewIndex > 0) setPreviewImage(finishedImages[currentPreviewIndex - 1]); }, [currentPreviewIndex, finishedImages]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-6 lg:p-8">
        <main className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <OptionsPanel
              referenceFile={referenceFile} setReferenceFile={setReferenceFile}
              mode={mode} setMode={setMode}
              backgroundOption={backgroundOption} setBackgroundOption={setBackgroundOption}
              productBackgroundCategory={productBackgroundCategory} setProductBackgroundCategory={setProductBackgroundCategory}
              productBackgroundSubOption={productBackgroundSubOption} setProductBackgroundSubOption={setProductBackgroundSubOption}
              poseCategory={poseCategory} setPoseCategory={setPoseCategory}
              productPoseCategory={productPoseCategory} setProductPoseCategory={setProductPoseCategory}
              stylePrompt={stylePrompt} setStylePrompt={setStylePrompt}
              numberOfPhotos={numberOfPhotos} setNumberOfPhotos={setNumberOfPhotos}
              aspectRatio={aspectRatio} setAspectRatio={setAspectRatio}
              onGenerate={handleGenerate} onDownloadAll={handleDownloadSelected}
              isLoading={isLoading} isGenerated={isGenerated}
              customBackgroundFile={customBackgroundFile} setCustomBackgroundFile={setCustomBackgroundFile}
              modelFile={modelFile} setModelFile={setModelFile}
              partnerFile={partnerFile} setPartnerFile={setPartnerFile}
              attire={attire} setAttire={setAttire}
              productCategory={productCategory} setProductCategory={setProductCategory}
              productEffects={productEffects} setProductEffects={setProductEffects}
              profileIndustry={profileIndustry} setProfileIndustry={setProfileIndustry}
              profileLighting={profileLighting} setProfileLighting={setProfileLighting}
              profileExpression={profileExpression} setProfileExpression={setProfileExpression}
              poseScenario={poseScenario} setPoseScenario={setPoseScenario}
              poseObjectInteraction={poseObjectInteraction} setPoseObjectInteraction={setPoseObjectInteraction}
              poseCameraAngle={poseCameraAngle} onPoseCameraAngleToggle={handlePoseCameraAngleToggle}
              weddingTheme={weddingTheme} setWeddingTheme={setWeddingTheme}
              weddingMoment={weddingMoment} setWeddingMoment={setWeddingMoment}
              weddingTimeOfDay={weddingTimeOfDay} setWeddingTimeOfDay={setWeddingTimeOfDay}
              preWeddingTheme={preWeddingTheme} setPreWeddingTheme={setPreWeddingTheme}
              preWeddingMoment={preWeddingMoment} setPreWeddingMoment={setPreWeddingMoment}
              productLighting={productLighting} setProductLighting={setProductLighting}
              productProps={productProps} setProductProps={setProductProps}
              selectedImagesCount={selectedImages.length}
              onGetInspiration={handleGetStyleInspiration}
              isInspiring={isInspiring}
              poseBackground={poseBackground} setPoseBackground={setPoseBackground}
            />
          </div>
          <div className="lg:col-span-2">
            <ResultsGrid 
              images={generatedImages} 
              onDownloadImage={handleDownloadImage} 
              onPreviewImage={setPreviewImage} 
              selectedImages={selectedImages}
              onSelectImage={handleSelectImage}
              onRetryFailed={handleRetryFailed}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      <PreviewModal
        image={previewImage} onClose={() => setPreviewImage(null)} onDownload={handleDownloadImage}
        onNext={handleNextPreview} onPrevious={handlePreviousPreview}
        hasNext={currentPreviewIndex !== -1 && currentPreviewIndex < finishedImages.length - 1}
        hasPrevious={currentPreviewIndex > 0}
      />
    </>
  );
};

export default App;