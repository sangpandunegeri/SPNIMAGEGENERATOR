import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { negativePromptCategories } from '../../constants';

interface NegativePromptDisplayProps {
    enabledCategories: { [key: string]: boolean };
    onToggleCategory: (category: string) => void;
}

const NegativePromptDisplay: React.FC<NegativePromptDisplayProps> = ({ enabledCategories, onToggleCategory }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mt-6">
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {isOpen ? 'Sembunyikan' : 'Tampilkan'} Opsi Negative Prompt
            </button>
            {isOpen && (
                <div className="mt-2 p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-3">
                    {Object.keys(negativePromptCategories).map(category => (
                        <label key={category} className="flex items-center text-sm text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enabledCategories[category] || false}
                                onChange={() => onToggleCategory(category)}
                                className="form-checkbox h-4 w-4 bg-gray-800 border border-gray-600 text-cyan-500 focus:ring-cyan-500"
                            />
                            <span className="ml-3">{category}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NegativePromptDisplay;
