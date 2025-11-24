import React, { useRef, useState, useCallback } from 'react';
import { UploadedImage } from '../types';
import { fileToBase64 } from '../services/geminiService';

interface UploadZoneProps {
  label: string;
  subLabel: string;
  image: UploadedImage | null;
  onImageUpload: (image: UploadedImage) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({
  label,
  subLabel,
  image,
  onImageUpload,
  onRemove,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      onImageUpload({
        file,
        previewUrl,
        base64,
        mimeType: file.type,
      });
    } catch (err) {
      console.error("Error processing file", err);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  }, [disabled, onImageUpload]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {image ? (
        <div className="relative group w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900 shadow-lg">
          <img
            src={image.previewUrl}
            alt={label}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              disabled={disabled}
              className="px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full text-sm font-medium backdrop-blur-sm transition-colors"
             >
               Remove Image
             </button>
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg">
            <p className="text-xs font-semibold text-zinc-200">{label}</p>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerSelect}
          className={`
            relative w-full h-64 md:h-80 rounded-2xl border-2 border-dashed
            flex flex-col items-center justify-center cursor-pointer
            transition-all duration-300 ease-in-out
            ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-500'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="p-6 text-center">
            <div className="mx-auto w-12 h-12 mb-4 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-zinc-300 mb-1">{label}</p>
            <p className="text-xs text-zinc-500">{subLabel}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;