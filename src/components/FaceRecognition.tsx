import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Key, RotateCcw } from 'lucide-react';
import { FacialRecognitionView } from './FacialRecognitionView';
import { PinAccessView } from './PinAccessView';
import { ResultDisplay } from './ResultDisplay';
import { createFacialAccess, createPinAccess, getAreas, getEmpleado } from '../services/api';
import { Acceso, AreaTrabajo, Empleado, TipoAcceso } from '../types';

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
  const [tipoAcceso, setTipoAcceso] = useState<TipoAcceso>('Ingreso');
  interface AccessResponse {
    empleado?: {
      id: number;
      nombre: string;
      apellido: string;
      rol: string;
      DNI?: string;
      Email?: string;
    };
    confianza?: number;
    acceso_permitido: boolean;
    mensaje: string;
    area_id?: string;
    tipo_acceso?: TipoAcceso | string; // Allow string for API compatibility
    empleadoFull?: Empleado; // Add empleadoFull to the interface
  }

  const [result, setResult] = useState<AccessResponse | null>(null);
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

  const handleFileSelect = useCallback(async (file: File) => {
    if (!selectedArea) {
      alert('Por favor seleccione un área');
      return;
    }

    try {
      setIsProcessing(true);
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      
      // Process the image
      await processImage(file);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error al procesar la imagen');
      setCapturedImage(null);
      setIsProcessing(false);
    }
  }, [selectedArea, tipoAcceso, onAccessLog]);

  const processImage = async (file: File) => {
    try {
      let response;
      try {
        response = await createFacialAccess({
          file,
          tipo_acceso: tipoAcceso,
          area_id: selectedArea,
          dispositivo: 'Web Upload',
          observaciones: ''
        });
      } catch (error: any) {
        // Handle API errors (like 400, 500, etc.)
        const errorDetail = error.response?.data?.detail;
        setResult({
          acceso_permitido: false,
          mensaje: typeof errorDetail === 'string' ? errorDetail : 'Error en el servicio de reconocimiento facial',
          area_id: selectedArea,
          tipo_acceso: tipoAcceso,
        });
        return;
      }
      
      if (response.empleado) {
        let empleadoFull: Empleado;
        try {
          empleadoFull = await getEmpleado(response.empleado.id);
        } catch (error) {
          // If we can't get full employee details, use what we have
          console.error('Error fetching employee details:', error);
          empleadoFull = {
            EmpleadoID: response.empleado.id,
            Nombre: response.empleado.nombre,
            Apellido: response.empleado.apellido,
            DNI: response.empleado.DNI || '',
            Rol: response.empleado.rol,
            Email: response.empleado.Email || '',
            FechaNacimiento: '',
            FechaRegistro: new Date().toISOString().split('T')[0],
            Estado: 'activo',
            AreaID: selectedArea
          };
        }
        
        setResult({ 
          ...response, 
          empleadoFull,
          tipo_acceso: response.tipo_acceso as TipoAcceso
        });
        onAccessLog({
          AccesoID: 0, // Will be set by the backend
          EmpleadoID: response.empleado.id,
          Nombre: response.empleado.nombre,
          Apellido: response.empleado.apellido,
          AreaID: selectedArea,
          FechaHora: new Date().toISOString(),
          TipoAcceso: tipoAcceso,
          MetodoAcceso: 'Facial',
          DispositivoAcceso: 'Web Upload',
          ConfianzaReconocimiento: response.confianza || 0,
          AccesoPermitido: response.acceso_permitido,
          DNI: '',
          Rol: response.empleado.rol,
          NombreArea: areas.find(a => a.AreaID === selectedArea)?.Nombre || ''
        });
      } else {
        setResult({
          ...response,
          tipo_acceso: response.tipo_acceso as TipoAcceso
        });
        onAccessLog({
          AccesoID: 0, // Will be set by the backend
          EmpleadoID: 0,
          Nombre: 'Desconocido',
          Apellido: '',
          AreaID: selectedArea,
          FechaHora: new Date().toISOString(),
          TipoAcceso: tipoAcceso,
          MetodoAcceso: 'Facial',
          DispositivoAcceso: 'Web Upload',
          ConfianzaReconocimiento: 0, // Default to 0 for failed recognition
          AccesoPermitido: false,
          DNI: '',
          Rol: '',
          NombreArea: areas.find(a => a.AreaID === selectedArea)?.Nombre || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

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
          dispositivo: 'Web Camera',
          observaciones: ''
        });

        let empleadoFull: Empleado | undefined = undefined;
        if (response.empleado) {
          try {
            empleadoFull = await getEmpleado(response.empleado.id);
          } catch (error) {
            console.error('Error fetching employee details:', error);
          }
        }
        setResult({ ...response, empleadoFull });
        
        // Log the access
        if (response.empleado) {
          onAccessLog({
            AccesoID: 0,
            EmpleadoID: response.empleado.id,
            Nombre: response.empleado.nombre,
            Apellido: response.empleado.apellido,
            AreaID: selectedArea,
            FechaHora: new Date().toISOString(),
            TipoAcceso: tipoAcceso,
            MetodoAcceso: 'Facial',
            DispositivoAcceso: 'Web Camera',
            ConfianzaReconocimiento: response.confianza || 0,
            AccesoPermitido: response.acceso_permitido,
            DNI: '',
            Rol: response.empleado.rol,
            NombreArea: areas.find(a => a.AreaID === selectedArea)?.Nombre || ''
          });
        } else {
          onAccessLog({
            AccesoID: 0,
            EmpleadoID: 0,
            Nombre: 'Desconocido',
            Apellido: '',
            AreaID: selectedArea,
            FechaHora: new Date().toISOString(),
            TipoAcceso: tipoAcceso,
            MetodoAcceso: 'Facial',
            DispositivoAcceso: 'Web Camera',
            ConfianzaReconocimiento: 0,
            AccesoPermitido: false,
            DNI: '',
            Rol: '',
            NombreArea: areas.find(a => a.AreaID === selectedArea)?.Nombre || ''
          });
        }

        if (response.acceso_permitido && response.empleado) {
          const now = new Date();
          const acceso: Acceso = {
            AccesoID: Date.now(),
            EmpleadoID: response.empleado.id,
            AreaID: selectedArea,
            FechaHora: now.toISOString(),
            TipoAcceso: tipoAcceso,
            MetodoAcceso: 'Facial',
            AccesoPermitido: true,
            DispositivoAcceso: 'CAM-PRINCIPAL-01',
            ConfianzaReconocimiento: typeof response.confianza === 'number' ? response.confianza : 0,
            Nombre: response.empleado.nombre,
            Apellido: response.empleado.apellido,
            Rol: response.empleado.rol,
          };
          onAccessLog(acceso);
        }
      } catch (error: any) {
        const errorDetail = error.response?.data?.detail;
        setResult({
          mensaje: errorDetail || 'Error al procesar la imagen',
          acceso_permitido: false
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
          FechaHora: now.toISOString(),
          TipoAcceso: tipoAcceso,
          MetodoAcceso: 'PIN',
          AccesoPermitido: true,
          DispositivoAcceso: 'TERMINAL-PIN-01',
          ConfianzaReconocimiento: 1, // PIN access gets maximum confidence
          Nombre: response.empleado.nombre,
          Apellido: response.empleado.apellido,
          Rol: response.empleado.rol,
        };
        onAccessLog(acceso);
      }
    } catch (error: any) {
      const errorDetail = error.response?.data?.detail;
      setResult({
        acceso_permitido: false,
        mensaje: typeof errorDetail === 'string' ? errorDetail : 'Error en el servicio de acceso por PIN',
        area_id: selectedArea || '',
        tipo_acceso: tipoAcceso,
        empleado: undefined,
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
                  {area.Nombre} ({area.AreaID})
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
          onFileSelect={handleFileSelect}
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