import React, { useRef, useState, useCallback } from 'react';
import { Camera, Square } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream>();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Preferir cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      setError('No se pudo acceder a la cámara. Asegúrate de haber dado los permisos necesarios.');
      console.error('Error accessing camera:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = undefined;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !isCameraActive) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        stopCamera();
        onClose();
      }
    }, 'image/jpeg', 0.8);
  }, [isCameraActive, onCapture, stopCamera, onClose]);

  React.useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Capturar desde cámara</h3>
        </div>
        
        <div className="p-4">
          {error ? (
            <div className="text-red-600 text-center p-4">
              <p>{error}</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white">Iniciando cámara...</div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={capturePhoto}
                  disabled={!isCameraActive}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-4 h-4" />
                  Capturar
                </button>
                
                <button
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  <Square className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;