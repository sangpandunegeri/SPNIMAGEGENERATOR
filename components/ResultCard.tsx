import React from 'react';
import { GeneratedImage } from '../types';
import { EyeIcon, RefreshIcon, EditIcon, DownloadIcon, CheckIcon } from './icons';

interface ResultCardProps {
  image: GeneratedImage;
  onDownload: (image: GeneratedImage) => void;
  onPreview: (image: GeneratedImage) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

const ResultCard: React.FC<ResultCardProps> = ({ image, onDownload, onPreview, onSelect, isSelected }) => {
  const isLoading = image.status === 'loading';
  const isPlaceholder = image.status === 'placeholder';
  const isDone = image.status === 'done';
  const isError = image.status === 'error';

  const handleCardClick = () => {
    if (isDone) {
      onSelect(image.id);
    }
  };

  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className={`group aspect-square rounded-xl overflow-hidden relative transition-all duration-200 ${isDone ? 'cursor-pointer' : 'cursor-default'} ${isSelected ? 'ring-4 ring-teal-500 ring-offset-2' : 'bg-gray-200'}`}
      onClick={handleCardClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <svg className="w-10 h-10 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
          </svg>
        </div>
      )}
      {isError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100 text-red-700 p-2 text-center">
             <svg className="w-10 h-10 text-red-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <p className="text-sm font-semibold">Gagal dibuat</p>
             <p className="text-xs truncate" title={image.errorMessage}>{image.errorMessage || 'Terjadi kesalahan.'}</p>
          </div>
      )}
      {(!isLoading && !isError) && <img src={image.src} alt={image.label} className="w-full h-full object-cover" />}

      <div className={`absolute inset-0 bg-black transition-all duration-300 ${isSelected ? 'bg-opacity-40' : 'bg-opacity-0 group-hover:bg-opacity-50'}`}>
        {isDone && (
            <div 
                className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200 ${isSelected ? 'bg-teal-500 border-teal-500 scale-110' : 'bg-black/30 group-hover:scale-100 scale-0'}`}
                role="checkbox"
                aria-checked={isSelected}
            >
                {isSelected && <CheckIcon className="w-4 h-4 text-white" />}
            </div>
        )}
        <div className={`absolute inset-0 flex flex-col justify-end p-3 transition-opacity duration-300 ${isPlaceholder ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <p className="text-white font-semibold text-sm drop-shadow-md">{image.label}</p>
            {!isPlaceholder && (
                <div className="absolute top-2 right-2 flex space-x-1">
                    <button 
                        onClick={(e) => handleButtonClick(e, () => onPreview(image))}
                        disabled={!isDone}
                        aria-label={`Preview ${image.label}`}
                        title="Preview"
                        className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed">
                        <EyeIcon className="w-4 h-4" />
                    </button>
                    {isDone && (
                        <button
                            onClick={(e) => handleButtonClick(e, () => onDownload(image))}
                            aria-label={`Download ${image.label}`}
                            title="Download"
                            className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40">
                            <DownloadIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ResultCard;