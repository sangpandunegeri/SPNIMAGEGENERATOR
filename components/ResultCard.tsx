
import React from 'react';
import { GeneratedImage } from '../types';
import { EyeIcon, RefreshIcon, EditIcon, DownloadIcon } from './icons';

interface ResultCardProps {
  image: GeneratedImage;
  onDownload: (image: GeneratedImage) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ image, onDownload }) => {
  const isLoading = image.status === 'loading';
  const isPlaceholder = image.status === 'placeholder';

  return (
    <div className="group aspect-square bg-gray-200 rounded-xl overflow-hidden relative animate-fade-in">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <svg className="w-10 h-10 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
          </svg>
        </div>
      )}
      {!isLoading && <img src={image.src} alt={image.label} className="w-full h-full object-cover" />}

      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex flex-col justify-end p-3">
        <p className="text-white font-semibold text-sm drop-shadow-md">{image.label}</p>
        {!isPlaceholder && (
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40"><EyeIcon className="w-4 h-4" /></button>
                {image.status === 'done' && (
                    <button
                        onClick={() => onDownload(image)}
                        aria-label={`Download ${image.label}`}
                        title="Download"
                        className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40">
                        <DownloadIcon className="w-4 h-4" />
                    </button>
                )}
                <button className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40"><RefreshIcon className="w-4 h-4" /></button>
                <button className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40"><EditIcon className="w-4 h-4" /></button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
