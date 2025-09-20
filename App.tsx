
import React, { useState, useCallback } from 'react';
import OptionsPanel from './components/OptionsPanel';
import ResultsGrid from './components/ResultsGrid';
import { Mode, BackgroundOption, GeneratedImage, ProductBackgroundOption, AspectRatio, PoseCategory, ImageModel } from './types';
import { INITIAL_IMAGES } from './constants';
import { generatePoses, generateProductPhotos } from './services/geminiService';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { useApiKey } from './contexts/ApiKeyContext';
import { useUsage } from './contexts/UsageContext';

const App: React.FC = () => {
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>(Mode.PoseGenerator);
  const [imageModel, setImageModel] = useState<ImageModel>(ImageModel.GeminiFlash);
  const [backgroundOption, setBackgroundOption] = useState<BackgroundOption>(BackgroundOption.Reference);
  const [productBackgroundOption, setProductBackgroundOption] = useState<ProductBackgroundOption>(ProductBackgroundOption.FamousPlaces);
  const [poseCategory, setPoseCategory] = useState<PoseCategory>(PoseCategory.Corporate);
  const [stylePrompt, setStylePrompt] = useState<string>('');
  const [numberOfPhotos, setNumberOfPhotos] = useState<number>(3);
  const [delay, setDelay] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>(INITIAL_IMAGES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [customBackgroundFile, setCustomBackgroundFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<React.ReactNode | null>(null);
  const { activeApiKey } = useApiKey();
  const { incrementUsage } = useUsage();


  React.useEffect(() => {
    if (mode === Mode.PoseGenerator) {
        setBackgroundOption(BackgroundOption.Reference);
    } else {
        setProductBackgroundOption(ProductBackgroundOption.FamousPlaces);
    }
    setCustomBackgroundFile(null);
    setModelFile(null);
  }, [mode]);
  
  React.useEffect(() => {
    // If user switches to a model that doesn't use a reference image, clear it.
    if (imageModel === ImageModel.Imagen4) {
      setReferenceFile(null);
      setModelFile(null);
      if (backgroundOption === BackgroundOption.Reference || backgroundOption === BackgroundOption.EditBackground) {
        setBackgroundOption(BackgroundOption.Minimalist);
      }
      if (productBackgroundOption === ProductBackgroundOption.CustomImage) {
        setProductBackgroundOption(ProductBackgroundOption.ProfessionalStudio);
      }
    }
  }, [imageModel]);

  React.useEffect(() => {
    if (mode === Mode.PoseGenerator && backgroundOption !== BackgroundOption.EditBackground) {
        setCustomBackgroundFile(null);
    }
    if (mode === Mode.ProductPhoto && productBackgroundOption !== ProductBackgroundOption.CustomImage) {
        setCustomBackgroundFile(null);
    }
  }, [mode, backgroundOption, productBackgroundOption]);

  const handleGenerate = useCallback(async () => {
    if (!activeApiKey) {
      setToastMessage("Harap tambahkan dan pilih Kunci API Gemini yang aktif di menu pengaturan.");
      return;
    }
    if (imageModel === ImageModel.GeminiFlash && !referenceFile) {
      setToastMessage("Silakan unggah gambar referensi terlebih dahulu untuk model ini.");
      return;
    }
    if ((backgroundOption === BackgroundOption.EditBackground || productBackgroundOption === ProductBackgroundOption.CustomImage) && !customBackgroundFile) {
      setToastMessage("Silakan unggah gambar latar belakang kustom.");
      return;
    }

    setIsLoading(true);
    setIsGenerated(false);

    // Create loading placeholders
    const loadingPlaceholders: GeneratedImage[] = Array.from({ length: numberOfPhotos }, (_, i) => ({
      id: `loading-${i}-${Date.now()}`,
      src: '',
      label: 'Generating...',
      status: 'loading',
    }));
    setGeneratedImages(loadingPlaceholders);

    try {
      let results;
      if (mode === Mode.PoseGenerator) {
        results = await generatePoses(activeApiKey, imageModel, referenceFile, backgroundOption, stylePrompt, numberOfPhotos, customBackgroundFile, aspectRatio, poseCategory);
      } else {
        results = await generateProductPhotos(activeApiKey, imageModel, referenceFile, modelFile, productBackgroundOption, stylePrompt, numberOfPhotos, customBackgroundFile, aspectRatio);
      }
      
      const newImages: GeneratedImage[] = results.map((result, i) => ({
        id: `result-${i}-${Date.now()}`,
        src: result.src,
        label: result.label,
        status: 'done',
      }));
      setGeneratedImages(newImages);
      setIsGenerated(true);
      incrementUsage(numberOfPhotos); // Increment usage on success
    } catch (error) {
      console.error("Failed to generate images:", error);
      const errorMessage = (error as Error).message || "An unknown error occurred.";
      if (errorMessage.includes('API key not valid')) {
          setToastMessage("Kunci API yang aktif tidak valid. Silakan periksa di menu pengaturan.");
      } else if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          setToastMessage(
            <span>
              Kuota API habis. Semua kunci API di bawah satu akun Google berbagi kuota yang sama. Untuk melanjutkan,{' '}
              <a href="https://console.cloud.google.com/billing" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:text-red-200">
                aktifkan penagihan di Google Cloud
              </a>.
            </span>
          );
      } else {
          setToastMessage("Terjadi kesalahan saat membuat gambar. Periksa konsol untuk detailnya.");
      }
      setGeneratedImages(INITIAL_IMAGES); // Revert to initial on error
    } finally {
      setIsLoading(false);
    }
  }, [activeApiKey, referenceFile, mode, imageModel, backgroundOption, productBackgroundOption, stylePrompt, numberOfPhotos, customBackgroundFile, aspectRatio, poseCategory, modelFile, incrementUsage]);

  const handleDownloadAll = useCallback(() => {
    generatedImages.forEach((image, index) => {
        if (image.status === 'done') {
            const link = document.createElement('a');
            link.href = image.src;
            
            const sanitizedLabel = image.label
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-') 
                .replace(/[^a-z0-9-]/g, '') 
                .substring(0, 50); 

            link.download = `aiphoto-${sanitizedLabel || `image-${index + 1}`}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
  }, [generatedImages]);

  const handleDownloadImage = useCallback((image: GeneratedImage) => {
    if (image.status !== 'done') return;

    const link = document.createElement('a');
    link.href = image.src;
    
    const sanitizedLabel = image.label
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .substring(0, 50);

    link.download = `aiphoto-${sanitizedLabel || `image`}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-6 lg:p-8">
        <main className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <OptionsPanel
              referenceFile={referenceFile}
              setReferenceFile={setReferenceFile}
              mode={mode}
              setMode={setMode}
              imageModel={imageModel}
              setImageModel={setImageModel}
              backgroundOption={backgroundOption}
              setBackgroundOption={setBackgroundOption}
              productBackgroundOption={productBackgroundOption}
              setProductBackgroundOption={setProductBackgroundOption}
              poseCategory={poseCategory}
              setPoseCategory={setPoseCategory}
              stylePrompt={stylePrompt}
              setStylePrompt={setStylePrompt}
              numberOfPhotos={numberOfPhotos}
              setNumberOfPhotos={setNumberOfPhotos}
              delay={delay}
              setDelay={setDelay}
              aspectRatio={aspectRatio}
              setAspectRatio={setAspectRatio}
              onGenerate={handleGenerate}
              onDownloadAll={handleDownloadAll}
              isLoading={isLoading}
              isGenerated={isGenerated}
              customBackgroundFile={customBackgroundFile}
              setCustomBackgroundFile={setCustomBackgroundFile}
              modelFile={modelFile}
              setModelFile={setModelFile}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
          <div className="lg:col-span-2">
            <ResultsGrid images={generatedImages} onDownloadImage={handleDownloadImage} />
          </div>
        </main>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </>
  );
};

export default App;
