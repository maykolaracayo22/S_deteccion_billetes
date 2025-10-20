import React, { useState, useRef } from 'react';
import { Upload, Camera, FileImage, Loader2 } from 'lucide-react';
import CameraCapture from './CameraCapture';

interface UploadImageProps {
  onPredict: (file: File) => void;
  isLoading: boolean;
  className?: string;
}

const UploadImage: React.FC<UploadImageProps> = ({ onPredict, isLoading, className = '' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }
    onPredict(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleCameraCapture = (blob: Blob) => {
    const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
    onPredict(file);
  };

  return (
    <>
      <div className={`space-y-6 ${className}`}>
        {/* Área de drag & drop */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-primary-100 rounded-full">
                <Upload className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Arrastra una imagen aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Formatos soportados: JPG, PNG, WebP
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FileImage className="w-5 h-5" />
              Seleccionar archivo
            </button>
          </div>
        </div>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O</span>
          </div>
        </div>

        {/* Botón de cámara */}
        <div className="text-center">
          <button
            onClick={() => setShowCamera(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Camera className="w-5 h-5" />
            Usar cámara
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 p-4 text-primary-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Procesando imagen...</span>
          </div>
        )}
      </div>

      {/* Modal de cámara */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
};

export default UploadImage;