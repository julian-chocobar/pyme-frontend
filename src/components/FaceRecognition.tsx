import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Key, RotateCcw } from 'lucide-react';
import { FacialRecognitionView } from './FacialRecognitionView';
import { PinAccessView } from './PinAccessView';
import { ResultDisplay } from './ResultDisplay';
import { createFacialAccess, createPinAccess, getAreas, getEmpleado } from '../services/api';
import { Acceso, AreaTrabajo, Empleado } from '../types';
import { AccessResponse } from '../services/api';

interface FaceRecognitionProps {
  onAccessLog: (acceso: Acceso) => void;
}

type AccessMethod = 'facial' | 'pin';

export const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onAccessLog }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accessMethod, setAccessMethod] = useState<AccessMethod>('facial');
  const [pin, setPin] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [tipoAcceso, setTipoAcceso] = useState<'Ingreso' | 'Egreso'>('Ingreso');
  const [result, setResult] = useState<(AccessResponse & { empleadoFull?: Empleado }) | null>(null);
  const [areas, setAreas] = useState<AreaTrabajo[]>([]);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areasData = await getAreas();
        setAreas(areasData);
        if (areasData.length > 0 && !selectedArea) {
          setSelectedArea(areasData[0].AreaID);
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
      }
    };
    fetchAreas();
  }, [selectedArea]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startStreaming = useCallback(async () => {
    setIsCameraLoading(true);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Tu navegador no soporta el acceso a la cámara.');
      setIsCameraLoading(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Error al acceder a la cámara. Verifique los permisos del navegador.');
    }
    setIsCameraLoading(false);
  }, []);

  const stopStreaming = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const handleCapture = useCallback(async () => {
    if (!canvasRef.current || !videoRef.current || !selectedArea) {
      alert('Por favor seleccione un área');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      stopStreaming();
      setCapturedImage(canvas.toDataURL('image/jpeg'));
      setIsProcessing(true);
      setResult(null);

      try {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        const response = await createFacialAccess({
          file,
          tipo_acceso: tipoAcceso,
          area_id: selectedArea,
        });

        let empleadoFull: Empleado | undefined = undefined;
        if (response.empleado) {
          empleadoFull = await getEmpleado(response.empleado.id);
        }
        setResult({ ...response, empleadoFull });

        if (response.acceso_permitido && response.empleado) {
          const now = new Date();
          const acceso: Acceso = {
            AccesoID: Date.now(),
            EmpleadoID: response.empleado.id,
            AreaID: selectedArea,
            FechaHoraIngreso: now.toISOString(),
            FechaHoraEgreso: null,
            TipoAcceso: tipoAcceso,
            MetodoAcceso: 'Facial',
            AccesoPermitido: true,
            MotivoDenegacion: null,
            DispositivoAcceso: 'CAM-PRINCIPAL-01',
            ConfianzaReconocimiento: response.confianza || 0.9,
            ObservacionesSeguridad: response.confianza && response.confianza < 0.8 ? 'Confianza por debajo del umbral recomendado' : null
          };
          onAccessLog(acceso);
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || 'Error en el servicio de reconocimiento facial';
        setResult({
          acceso_permitido: false,
          message: typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage,
          area_id: selectedArea || '',
          tipo_acceso: tipoAcceso,
          empleado: undefined,
          confianza: 0,
          metodo_acceso: 'Facial'
        });
      } finally {
        setIsProcessing(false);
      }
    }, 'image/jpeg', 0.85);
  }, [onAccessLog, selectedArea, tipoAcceso]);

  const handlePinSubmit = async () => {
    if (!pin || pin.length !== 4 || !selectedArea) return;
    
    setIsProcessing(true);
    setResult(null);
    try {
      const response = await createPinAccess({
        pin: pin,
        tipo_acceso: tipoAcceso,
        area_id: selectedArea
      });
      
      let empleadoFull: Empleado | undefined = undefined;
      if (response.empleado) {
        empleadoFull = await getEmpleado(response.empleado.id);
      }
      setResult({ ...response, empleadoFull });
      
      if (response.acceso_permitido && response.empleado) {
        const now = new Date();
        const acceso: Acceso = {
          AccesoID: Date.now(),
          EmpleadoID: response.empleado.id,
          AreaID: selectedArea,
          FechaHoraIngreso: now.toISOString(),
          FechaHoraEgreso: null,
          TipoAcceso: tipoAcceso,
          MetodoAcceso: 'PIN',
          AccesoPermitido: true,
          MotivoDenegacion: null,
          DispositivoAcceso: 'TERMINAL-PIN-01',
          ConfianzaReconocimiento: null,
          ObservacionesSeguridad: null
        };
        onAccessLog(acceso);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Error en el servicio de acceso por PIN';
      setResult({
        acceso_permitido: false,
        message: typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage,
        area_id: selectedArea || '',
        tipo_acceso: tipoAcceso,
        empleado: undefined,
        metodo_acceso: 'PIN'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setCapturedImage(null);
    if (isStreaming) {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        if(videoRef.current) videoRef.current.srcObject = null;
        setIsStreaming(false);
    }
    setPin('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Método de Acceso
        </h3>
        <div className="flex space-x-4">
          <button
            onClick={() => { setAccessMethod('facial'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${accessMethod === 'facial' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            <Camera className="w-5 h-5" />
            Reconocimiento Facial
          </button>
          <button
            onClick={() => { setAccessMethod('pin'); resetForm(); }}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${accessMethod === 'pin' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            <Key className="w-5 h-5" />
            Código PIN
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Acceso
            </label>
            <select
              value={tipoAcceso}
              onChange={(e) => setTipoAcceso(e.target.value as 'Ingreso' | 'Egreso')}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={isStreaming || isProcessing}
            >
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Área de Acceso
            </label>
            <select
              value={selectedArea || ''}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
              disabled={isStreaming || isProcessing}
            >
              <option value="">Seleccione un área</option>
              {areas.map((area) => (
                <option key={area.AreaID} value={area.AreaID}>
                  {area.Nombre} ({area.NivelAcceso})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {accessMethod === 'facial' && !result && (
        <FacialRecognitionView
          videoRef={videoRef}
          canvasRef={canvasRef}
          isStreaming={isStreaming}
          isCameraLoading={isCameraLoading}
          isProcessing={isProcessing}
          startStreaming={startStreaming}
          stopStreaming={stopStreaming}
          handleCapture={handleCapture}
          capturedImage={capturedImage}
        />
      )}

      {accessMethod === 'pin' && !result && (
        <PinAccessView
          pin={pin}
          setPin={setPin}
          isProcessing={isProcessing}
          selectedArea={selectedArea}
          handlePinSubmit={handlePinSubmit}
        />
      )}

      {result && (
        <div className="mt-4">
          <ResultDisplay result={result} areas={areas} />
          <div className="flex justify-center mt-4">
            <button
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <RotateCcw className="w-5 h-5" />
              Realizar otro registro
            </button>
          </div>
        </div>
      )}
    </div>
  );
};