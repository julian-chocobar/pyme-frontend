import React from 'react';
import { Camera, Loader2, LogIn } from 'lucide-react';

interface FacialRecognitionViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isStreaming: boolean;
  isCameraLoading: boolean;
  isProcessing: boolean;
  startStreaming: () => void;
  stopStreaming: () => void;
  handleCapture: () => void;
  capturedImage: string | null;
}

export const FacialRecognitionView: React.FC<FacialRecognitionViewProps> = ({
  videoRef,
  canvasRef,
  isStreaming,
  isCameraLoading,
  isProcessing,
  startStreaming,
  stopStreaming,
  handleCapture,
  capturedImage
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Camera className="w-5 h-5" />
        Reconocimiento Facial
      </h3>
      
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center text-white">
        {isCameraLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-10">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <p className="text-white mt-4 text-lg">Iniciando cámara...</p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isStreaming && !capturedImage ? 'block' : 'hidden'}`}
        />
        <canvas ref={canvasRef} className="hidden" />

        {capturedImage && (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
        )}

        {!isStreaming && !isCameraLoading && !capturedImage && (
          <div className="text-center">
            <Camera className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">La cámara está desactivada.</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        {!isStreaming && !capturedImage && (
          <button
            onClick={startStreaming}
            disabled={isCameraLoading}
            className="w-full max-w-xs mx-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isCameraLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Camera className="w-6 h-6" />
                Activar Cámara
              </>
            )}
          </button>
        )}

        {isStreaming && !capturedImage && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCapture}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-bold text-base hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <LogIn className="w-5 h-5" />
              Capturar y Verificar
            </button>
            <button
              onClick={stopStreaming}
              disabled={isProcessing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <Camera className="w-5 h-5" />
              Detener Cámara
            </button>
          </div>
        )}

        {capturedImage && isProcessing && (
            <div className="w-full max-w-xs mx-auto inline-flex items-center justify-center gap-2 bg-gray-500 text-white px-8 py-4 rounded-full font-bold text-lg cursor-wait">
                <Loader2 className="w-6 h-6 animate-spin" />
                Procesando...
            </div>
        )}
      </div>
    </div>
  );
};
