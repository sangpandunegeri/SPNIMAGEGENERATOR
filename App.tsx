import React, { useState, useEffect } from 'react';
import { Home, Users, Box, Image, Edit, Banknote, MapPin, Film, Camera, Settings, HelpCircle, Video, Layers, Clapperboard, GitMerge, ClipboardSignature, Archive, Wand2 } from 'lucide-react';

import HomePage from './components/HomePage';
import AssetBuilderPage from './components/AssetBuilderPage';
import ImageDetectorPage from './components/ImageDetectorPage';
import ManualModePage from './components/ManualModePage';
import StopMotionPage from './components/StopMotionPage';
import StoryboardGeneratorPage from './components/StoryboardGeneratorPage';
import StoryGeneratorPage from './components/StoryGeneratorPage';
import ImageFusionPage from './components/ImageFusionPage';
import VideoFusionPage from './components/VideoFusionPage';
import VideoGeneratorPage from './components/VideoGeneratorPage';
import PromptBankPage from './components/PromptBankPage';
import SettingsPage from './components/SettingsPage';
import HelpPage from './components/HelpPage';
import Sidebar from './components/layout/Sidebar';
import useLocalStorage from './hooks/useLocalStorage';
import ImageGeneratorPage from './components/ImageGeneratorPage';

import { Page, AssetType, NavigationStructureItem } from './types';
import { subjectFormFields, objectFormFields, locationFormFields, actionFormFields, initialSubjectFormData, initialObjectFormData, initialLocationFormData, initialActionFormData } from './constants';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [promptToLoad, setPromptToLoad] = useState<any>(null);
    const [actionToLoad, setActionToLoad] = useState<string | null>(null);
    const [lastDetectionData, setLastDetectionData] = useState<any>(null);
    const [apiKey, setApiKey] = useLocalStorage<string>('geminiApiKey', '');
    const [promptForVideoGenerator, setPromptForVideoGenerator] = useState<{ prompt: string, imageFile: File | null } | null>(null);

    const loadPromptAndNavigate = (promptData: any) => {
        if (promptData && promptData.sourceData) {
            setPromptToLoad(promptData.sourceData);
            setCurrentPage(promptData.mode === 'One Stop Motion Shot' ? 'stopMotionShot' : 'manualMode');
        } else {
            console.error("Attempted to load prompt without source data.");
        }
    };
    
    const handleGenerateVideoFromPrompt = (prompt: string, imageFile: File | null = null) => {
        setPromptForVideoGenerator({ prompt, imageFile });
        setCurrentPage('videoGenerator');
    };

    const navItems: NavigationStructureItem[] = [
        { icon: <Home className="w-5 h-5" />, label: "Beranda", page: 'home' },
        {
            icon: <Archive className="w-5 h-5" />, label: "Aset Builder",
            children: [
                { icon: <Users className="w-5 h-5" />, label: "Subjek Builder", page: 'subjectBuilder' },
                { icon: <Box className="w-5 h-5" />, label: "Object Builder", page: 'objectBuilder' },
                { icon: <MapPin className="w-5 h-5" />, label: "Location Builder", page: 'locationBuilder' },
                { icon: <Film className="w-5 h-5" />, label: "Action Builder", page: 'actionBuilder' },
            ]
        },
        {
            icon: <Image className="w-5 h-5" />, label: "Image Tools",
            children: [
                { icon: <Image className="w-5 h-5" />, label: "Image Detector", page: 'imageDetector' },
                { icon: <Wand2 className="w-5 h-5" />, label: "Image Generator", page: 'imageGenerator' },
                { icon: <ClipboardSignature className="w-5 h-5" />, label: "Pencerita AI", page: 'storyGenerator' },
                { icon: <Clapperboard className="w-5 h-5" />, label: "Storyboard by Image", page: 'storyboardGenerator' },
                { icon: <Layers className="w-5 h-5" />, label: "Penggabung Gambar", page: 'imageFusion' },
            ]
        },
        {
            icon: <Video className="w-5 h-5" />, label: "Video Tools",
            children: [
                { icon: <GitMerge className="w-5 h-5" />, label: "Video Fusion", page: 'videoFusion' },
                { icon: <Edit className="w-5 h-5" />, label: "Mode Manual", page: 'manualMode' },
                { icon: <Camera className="w-5 h-5" />, label: "One Stop Motion Shot", page: 'stopMotionShot' },
                { icon: <Video className="w-5 h-5" />, label: "Video Generator", page: 'videoGenerator' },
            ]
        },
        { icon: <Banknote className="w-5 h-5" />, label: "Bank Prompt", page: 'promptBank' },
        { icon: <HelpCircle className="w-5 h-5" />, label: "Bantuan (FAQ)", page: 'help' },
        { icon: <Settings className="w-5 h-5" />, label: "Pengaturan", page: 'settings' },
    ];
    
    const renderPage = () => {
        const commonProps = { apiKey };
        switch (currentPage) {
            case 'home':
                return <HomePage setCurrentPage={setCurrentPage} />;
            case 'subjectBuilder':
                return <AssetBuilderPage {...commonProps} key="subject" assetType={AssetType.Subjek} collectionName="subjects" formFields={subjectFormFields} initialFormData={initialSubjectFormData} lastDetectionData={lastDetectionData} setLastDetectionData={setLastDetectionData} />;
            case 'objectBuilder':
                return <AssetBuilderPage {...commonProps} key="object" assetType={AssetType.Objek} collectionName="objects" formFields={objectFormFields} initialFormData={initialObjectFormData} lastDetectionData={lastDetectionData} setLastDetectionData={setLastDetectionData} />;
            case 'locationBuilder':
                return <AssetBuilderPage {...commonProps} key="location" assetType={AssetType.Lokasi} collectionName="locations" formFields={locationFormFields} initialFormData={initialLocationFormData} lastDetectionData={lastDetectionData} setLastDetectionData={setLastDetectionData} />;
            case 'actionBuilder':
                return <AssetBuilderPage {...commonProps} key="action" assetType={AssetType.Aksi} collectionName="actions" formFields={actionFormFields} initialFormData={initialActionFormData} lastDetectionData={lastDetectionData} setLastDetectionData={setLastDetectionData} />;
            case 'imageDetector':
                return <ImageDetectorPage {...commonProps} setCurrentPage={setCurrentPage} setLastDetectionData={setLastDetectionData} onGenerateVideo={handleGenerateVideoFromPrompt} />;
            case 'manualMode':
                return <ManualModePage {...commonProps} promptToLoad={promptToLoad} onLoadComplete={() => setPromptToLoad(null)} actionToLoad={actionToLoad} onActionLoadComplete={() => setActionToLoad(null)} onGenerateVideo={handleGenerateVideoFromPrompt} />;
            case 'stopMotionShot':
                return <StopMotionPage {...commonProps} promptToLoad={promptToLoad} onLoadComplete={() => setPromptToLoad(null)} onGenerateVideo={handleGenerateVideoFromPrompt} />;
            case 'storyGenerator':
                return <StoryGeneratorPage {...commonProps} onGenerateVideo={handleGenerateVideoFromPrompt} />;
            case 'storyboardGenerator':
                return <StoryboardGeneratorPage {...commonProps} onGenerateVideo={handleGenerateVideoFromPrompt} />;
            case 'imageFusion':
                return <ImageFusionPage {...commonProps} onGenerateVideo={handleGenerateVideoFromPrompt} />;
            case 'imageGenerator':
                return <ImageGeneratorPage {...commonProps} onGenerateVideo={handleGenerateVideoFromPrompt} />;
            case 'videoFusion':
                return <VideoFusionPage {...commonProps} onGenerateVideo={handleGenerateVideoFromPrompt} />;
            case 'videoGenerator':
                return <VideoGeneratorPage {...commonProps} promptData={promptForVideoGenerator} onLoadComplete={() => setPromptForVideoGenerator(null)} />;
            case 'promptBank':
                return <PromptBankPage onPromptLoad={loadPromptAndNavigate} />;
             case 'settings':
                return <SettingsPage apiKey={apiKey} setApiKey={setApiKey} />;
             case 'help':
                return <HelpPage apiKey={apiKey} />;
            default:
                return <HomePage setCurrentPage={setCurrentPage} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col lg:flex-row">
            {currentPage !== 'home' && (
                <Sidebar
                    navItems={navItems}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            )}
            <main className="flex-1 p-6 lg:p-10 overflow-auto">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;