import React from 'react';
import { Detection } from '../types';
import { DollarSign, Target, MapPin } from 'lucide-react';

interface DetectionResultsProps {
  detections: Detection[];
  totalAmount: number;
  imageUrl?: string;
  className?: string;
}

const DetectionResults: React.FC<DetectionResultsProps> = ({
  detections,
  totalAmount,
  imageUrl,
  className = ''
}) => {
  const formatConfidence = (confidence: number): string => {
    return `${(confidence * 100).toFixed(1)}%`;
  };

  const getDenominationColor = (denomination: string): string => {
    const colors: { [key: string]: string } = {
      'S10': 'bg-green-100 text-green-800',
      'S20': 'bg-blue-100 text-blue-800',
      'S50': 'bg-purple-100 text-purple-800',
      'S100': 'bg-yellow-100 text-yellow-800',
      'S200': 'bg-red-100 text-red-800',
    };
    return colors[denomination] || 'bg-gray-100 text-gray-800';
  };

  if (detections.length === 0) {
    return (
      <div className={`text-center p-8 text-gray-500 ${className}`}>
        <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p>No se detectaron billetes</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Resumen total */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-lg border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total detectado</h3>
            <p className="text-sm text-gray-600">{detections.length} billete(s) detectado(s)</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold text-primary-600">
              <DollarSign className="w-6 h-6" />
              S/ {totalAmount}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de detecciones */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Detecciones individuales
        </h4>
        
        <div className="space-y-3">
          {detections.map((detection, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDenominationColor(detection.class)}`}>
                  {detection.class.replace('S', 'S/ ')}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {formatConfidence(detection.confidence)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  BBox: [{detection.bbox[0].toFixed(1)}, {detection.bbox[1].toFixed(1)}, {detection.bbox[2].toFixed(1)}, {detection.bbox[3].toFixed(1)}]
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visualización de bounding boxes (opcional) */}
      {imageUrl && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Vista previa con detecciones</h4>
          <div className="relative border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Imagen analizada"
              className="w-full h-auto"
            />
            {/* Aquí se podrían dibujar las bounding boxes con un canvas */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetectionResults;