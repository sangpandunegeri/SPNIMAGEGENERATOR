import React, { useState, useRef } from 'react';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
  onImageChange: (file: File) => void;
  title?: string;
  subtitle?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageChange,
  title = "Unggah Foto Referensi",
  subtitle = "Drag & drop or click to upload"
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageChange(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       onImageChange(file);
       const reader = new FileReader();
       reader.onloadend = () => {
         setImagePreview(reader.result as string);
       };
       reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="w-full aspect-3/4 bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-teal-500 transition-colors duration-200 p-2"
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      {imagePreview ? (
        <img src={imagePreview} alt="Reference Preview" className="max-h-full max-w-full object-contain rounded-lg" />
      ) : (
        <div className="text-center text-gray-500">
          <UploadIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="font-semibold">{title}</p>
          <p className="text-sm">{subtitle}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;