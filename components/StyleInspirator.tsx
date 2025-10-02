import React from 'react';
import Button from './Button';

interface StyleInspiratorProps {
    stylePrompt: string;
    setStylePrompt: (prompt: string) => void;
    onGetInspiration: () => void;
    isInspiring: boolean;
}

const PRESETS = [
    'Sinematik',
    'Hitam & Putih',
    'Film Analog',
    'Warna Vivid',
    'Pastel Lembut',
    'Kontras Tinggi',
    'Gaya Retro',
    'Mimpi Buram',
];

const StyleInspirator: React.FC<StyleInspiratorProps> = ({ stylePrompt, setStylePrompt, onGetInspiration, isInspiring }) => {
    
    const handlePresetClick = (preset: string) => {
        const newPrompt = stylePrompt ? `${stylePrompt}, ${preset.toLowerCase()}` : preset;
        setStylePrompt(newPrompt);
    };

    return (
        <div className="space-y-4">
             <div>
                <h3 className="text-md font-bold text-gray-800 mb-2 block">Prompt Gaya Tambahan</h3>
                <div className="relative">
                    <textarea 
                        id="style-prompt" 
                        value={stylePrompt} 
                        onChange={(e) => setStylePrompt(e.target.value)} 
                        placeholder="misalnya, foto hitam putih, gaya sinematik..." 
                        className="w-full p-2 pr-28 bg-white text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 transition-colors placeholder-gray-400" 
                        rows={3}
                    />
                    <Button 
                        onClick={onGetInspiration}
                        disabled={isInspiring}
                        className="!absolute !right-2 !top-2 !py-1.5 !px-3 text-sm"
                    >
                        {isInspiring ? 'Mencari...' : 'Inspirasi ✨'}
                    </Button>
                </div>
            </div>
            <div>
                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Preset Gaya</h4>
                 <div className="flex flex-wrap gap-2">
                    {PRESETS.map(preset => (
                        <button 
                            key={preset}
                            onClick={() => handlePresetClick(preset)}
                            className="px-3 py-1.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full hover:bg-teal-500 hover:text-white transition-all"
                        >
                            {preset}
                        </button>
                    ))}
                 </div>
            </div>
        </div>
    );
}

export default StyleInspirator;