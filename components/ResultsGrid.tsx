
import React from 'react';
import { GeneratedImage } from '../types';
import ResultCard from './ResultCard';

interface ResultsGridProps {
  images: GeneratedImage[];
  onDownloadImage: (image: GeneratedImage) => void;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ images, onDownloadImage }) => {
  return (
    <div className="w-full bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Hasil</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map(image => (
          <ResultCard key={image.id} image={image} onDownload={onDownloadImage} />
        ))}
      </div>
    </div>
  );
};

export default ResultsGrid;
