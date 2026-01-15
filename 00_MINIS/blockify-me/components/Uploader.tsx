
import React, { useCallback, useState } from 'react';

interface UploaderProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

export const Uploader: React.FC<UploaderProps> = ({ onUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden blocky-border bg-white p-8 md:p-12 text-center transition-all duration-200
        ${isDragging ? 'scale-105 border-green-500 bg-green-50' : 'hover:bg-gray-50'}
        ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center">
        <div className="mb-6 w-24 h-24 md:w-32 md:h-32 bg-[#7F7F7F] border-4 border-[#373737] flex items-center justify-center text-4xl">
          👤
        </div>
        <h2 className="text-3xl md:text-4xl text-[#373737] mb-4">Select your Portrait</h2>
        <p className="text-gray-600 text-xl mb-8">Drag and drop or click to pick a file</p>
        
        <label className="minecraft-btn cursor-pointer px-10 py-4 text-white text-2xl font-bold uppercase transition-transform active:scale-95">
          Choose File
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleChange}
          />
        </label>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gray-400"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gray-400"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gray-400"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gray-400"></div>
    </div>
  );
};
