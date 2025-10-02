import React from 'react';
import { GeneratedImage } from '../types';
import ResultCard from './ResultCard';
import Button from './Button';

interface ResultsGridProps {
  images: GeneratedImage[];
  selectedImages: string[];
  onDownloadImage: (image: GeneratedImage) => void;
  onPreviewImage: (image: GeneratedImage) => void;
  onSelectImage: (id: string) => void;
  onRetryFailed: () => void;
  isLoading: boolean;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ images, selectedImages, onDownloadImage, onPreviewImage, onSelectImage, onRetryFailed, isLoading }) => {
  const hasFailures = !isLoading && images.some(img => img.status === 'error');

  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Hasil</h2>
        {hasFailures && (
            <Button onClick={onRetryFailed} variant="secondary">
                Coba Ulangi yang Gagal
            </Button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map(image => (
          <ResultCard 
            key={image.id} 
            image={image} 
            onDownload={onDownloadImage} 
            onPreview={onPreviewImage} 
            onSelect={onSelectImage}
            isSelected={selectedImages.includes(image.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultsGrid;