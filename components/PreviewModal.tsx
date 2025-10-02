import React, { useEffect } from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import Button from './Button';

interface PreviewModalProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onDownload: (image: GeneratedImage) => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ 
    image, 
    onClose, 
    onDownload,
    onNext,
    onPrevious,
    hasNext,
    hasPrevious
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!image) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrevious) onPrevious();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, onClose, onNext, onPrevious, hasNext, hasPrevious]);
  
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div
        className="relative bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col p-4 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="preview-title" className="flex justify-between items-center mb-3 flex-shrink-0">
          <p className="font-semibold text-lg truncate pr-4">{image.label}</p>
          <div className="flex items-center gap-2">
             <Button
                variant="secondary"
                onClick={() => onDownload(image)}
                className="!py-2 !px-3"
            >
                <DownloadIcon className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">Unduh</span>
            </Button>
            <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white text-3xl leading-none"
                aria-label="Tutup"
            >
                &times;
            </button>
          </div>
        </div>

        <div className="relative flex-grow flex items-center justify-center min-h-0">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex justify-center w-full h-full pointer-events-none">
                <button
                    onClick={(e) => { e.stopPropagation(); onPrevious(); }}
                    disabled={!hasPrevious}
                    className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/30 transition-all disabled:opacity-0 disabled:cursor-not-allowed pointer-events-auto"
                    aria-label="Gambar sebelumnya"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    disabled={!hasNext}
                    className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full text-white hover:bg-white/30 transition-all disabled:opacity-0 disabled:cursor-not-allowed pointer-events-auto"
                    aria-label="Gambar selanjutnya"
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
            </div>
            <img src={image.src} alt={image.label} className="max-h-full max-w-full object-contain rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
