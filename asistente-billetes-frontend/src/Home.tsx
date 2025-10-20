import React, { useState } from 'react';
import { PredictionResponse } from './types';
import { predictImage, checkHealth } from './services/api';
import UploadImage from './components/UploadImage';
import DetectionResults from './components/DetectionResults';
import AudioPlayer from './components/AudioPlayer';
import { AlertCircle, CheckCircle2, Server, Eye, Volume2, Scan, Coins } from 'lucide-react';

const Home: React.FC = () => {
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);

  React.useEffect(() => {
    checkHealth().then(setServerStatus);
  }, []);

  const handlePredict = async (file: File) => {
    setIsLoading(true);
    setError('');
    setResult(null);
    
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);

    try {
      const prediction = await predictImage(file);
      setResult(prediction);
    } catch (err: any) {
      setError(err.message || 'Error al procesar la imagen');
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError('');
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
      setSelectedImage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header con gradiente */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
                <Eye className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Asistente Visual de Billetes
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  Reconocimiento inteligente para personas con discapacidad visual
                </p>
              </div>
            </div>
            
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm ${
              serverStatus === true ? 'bg-green-500/20' : 
              serverStatus === false ? 'bg-red-500/20' : 'bg-yellow-500/20'
            }`}>
              <Server className={`w-4 h-4 ${
                serverStatus === true ? 'text-green-300' : 
                serverStatus === false ? 'text-red-300' : 'text-yellow-300'
              }`} />
              <span className="text-sm font-medium">
                {serverStatus === true ? 'Sistema Conectado' : 
                 serverStatus === false ? 'Servidor No Disponible' : 'Verificando...'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Hero Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
              <div className="text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                  <Coins className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Reconocimiento Inteligente de Billetes Peruanos
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Sistema accesible que utiliza inteligencia artificial para identificar 
                  billetes peruanos y proporcionar retroalimentación auditiva inmediata
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <div className="text-sm text-gray-500">Denominaciones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">Instantáneo</div>
                    <div className="text-sm text-gray-500">Detección</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">Accesible</div>
                    <div className="text-sm text-gray-500">Diseño</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panel izquierdo - Upload */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Scan className="w-6 h-6" />
                  Escanear Billete
                </h2>
              </div>
              
              <div className="p-6">
                <UploadImage
                  onPredict={handlePredict}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Server Status Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                  serverStatus === true ? 'bg-green-100 text-green-600' : 
                  serverStatus === false ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {serverStatus === true ? 'Sistema Operativo' : 
                     serverStatus === false ? 'Sistema No Disponible' : 'Verificando Estado'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {serverStatus === true 
                      ? 'Todos los servicios funcionando correctamente'
                      : 'Verifica la conexión con el servidor backend'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Resultados */}
          <div className="space-y-6">
            {/* Audio Player */}
            {result?.audio_url && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <Volume2 className="w-5 h-5" />
                    Retroalimentación Auditiva
                  </h3>
                </div>
                <div className="p-6">
                  <AudioPlayer 
                    audioUrl={result.audio_url} 
                    autoPlay={true}
                  />
                </div>
              </div>
            )}

            {/* Resultado Principal */}
            {result?.text && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white">Resultado del Análisis</h3>
                </div>
                <div className="p-6">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
                    <p className="text-lg font-semibold text-gray-900 text-center">{result.text}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Detalles de Detección */}
            {result && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Detalles de la Detección</h3>
                    <button
                      onClick={clearResults}
                      className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                    >
                      Limpiar Análisis
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <DetectionResults
                    detections={result.detections}
                    totalAmount={result.total_amount}
                    imageUrl={selectedImage}
                  />
                </div>
              </div>
            )}

            {/* Mensaje de Error */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800">Error en el Procesamiento</p>
                    <p className="text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Estado Vacío */}
            {!result && !error && !isLoading && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
                <div className="max-w-sm mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Scan className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Listo para Escanear
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Sube una imagen de billetes peruanos o utiliza la cámara para comenzar el análisis.
                    El sistema identificará automáticamente las denominaciones.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Mejorado */}
      <footer className="bg-gradient-to-r from-gray-900 to-slate-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">Asistente Visual</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Tecnología accesible para la inclusión financiera de personas con discapacidad visual.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Denominaciones Soportadas</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-400">
                <div>S/ 10</div>
                <div>S/ 20</div>
                <div>S/ 50</div>
                <div>S/ 100</div>
                <div>S/ 200</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Características</h4>
              <div className="space-y-2 text-gray-400">
                <div>✓ Reconocimiento en tiempo real</div>
                <div>✓ Retroalimentación auditiva</div>
                <div>✓ Interfaz accesible</div>
                <div>✓ Soporte múltiple</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>Asistente Visual de Billetes Peruanos - 2024</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;