import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Camera, Loader2, X, Save, MapPin, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, UserPlus } from 'lucide-react';
import { getEmpleados, deleteEmpleado, registrarRostro, Empleado as ApiEmpleado, PaginatedResponse } from '../services/api';
import { getAreaName } from '../types';

interface EmployeesTableProps {
  onAddEmployee?: () => void;
}

export const EmployeesTable: React.FC<EmployeesTableProps> = ({ onAddEmployee }) => {
  const [empleadosData, setEmpleadosData] = useState<PaginatedResponse<ApiEmpleado>>({
    items: [],
    pagination: {
      total: 0,
      page: 1,
      page_size: 10,
      total_pages: 1,
      has_previous: false,
      has_next: false
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedEmpleado, setSelectedEmpleado] = useState<ApiEmpleado | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const { items: empleados, pagination } = empleadosData;
  
  // Refs for the video and canvas elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchEmpleados(pagination.page, pagination.page_size, searchTerm);
  }, [pagination.page, pagination.page_size]);

  const fetchEmpleados = async (page: number, pageSize: number, search: string = '') => {
    try {
      setLoading(true);
      const data = await getEmpleados(page, pageSize, search);
      setEmpleadosData(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmpleadosData({
        items: [],
        pagination: {
          total: 0,
          page: 1,
          page_size: pageSize,
          total_pages: 1,
          has_previous: false,
          has_next: false
        }
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    setEmpleadosData(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page: newPage
      }
    }));
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Reset to first page when searching
    setEmpleadosData(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        page: 1
      }
    }));
    // Trigger the API call with the current search term
    fetchEmpleados(1, pagination.page_size, searchTerm);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) return;
    
    try {
      setIsDeleting(id);
      await deleteEmpleado(id);
      // Refresh the current page after deletion
      fetchEmpleados(pagination.page, pagination.page_size, searchTerm);
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error al eliminar el empleado');
    } finally {
      setIsDeleting(null);
    }
  };

  const startStreaming = useCallback(async () => {
    if (isStreaming || isCameraLoading) return;

    try {
      setIsCameraLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Por favor, asegúrate de otorgar los permisos necesarios.');
    } finally {
      setIsCameraLoading(false);
    }
  }, [isStreaming, isCameraLoading]);

  const stopStreaming = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setCapturedImage(null);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get the image data as base64
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    
    // Stop the video stream
    stopStreaming();
  }, [stopStreaming]);

  const handleRegisterFace = async () => {
    if ((!capturedImage && !selectedFile) || !selectedEmpleado) return;
    
    try {
      setIsProcessing(true);
      const formData = new FormData();
      
      if (activeTab === 'camera' && capturedImage) {
        // Handle camera capture
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
        formData.append('file', file);
      } else if (activeTab === 'upload' && selectedFile) {
        // Handle file upload
        formData.append('file', selectedFile);
      } else {
        throw new Error('No se ha seleccionado ninguna imagen');
      }
      
      await registrarRostro(selectedEmpleado.EmpleadoID, formData);
      
      // Close the modal and reset states
      setCapturedImage(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      stopStreaming();
      
      alert('Rostro registrado exitosamente');
    } catch (error) {
      console.error('Error registering face:', error);
      alert('Error al registrar el rostro. Por favor, intente nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Clean up video stream on unmount
  useEffect(() => {
    const currentStream = streamRef.current;
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
    <div className="px-6 py-4 flex items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <form onSubmit={handleSearch} className="w-full">
          <input
            type="text"
            placeholder="Buscar empleados..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
          />
        </form>
      </div>
      {onAddEmployee && (
        <button
          onClick={onAddEmployee}
          className="inline-flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Crear Empleado
        </button>
      )}
    </div>

    {empleados.length === 0 ? (
      <div className="bg-white dark:bg-gray-900">
        <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
          No hay empleados registrados.
        </div>
      </div>
    ) : (
      <div className="overflow-x-auto">

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900">
                Empleado
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900">
                Área
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900">
                Rol
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900">
                Estado
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900">
            {empleados.map((empleado) => (
              <tr key={empleado.EmpleadoID} className="hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-gray-900 dark:text-white">
                      {empleado.Nombre} {empleado.Apellido}
                    </div>
                    <div className="text-xs text-gray-500">
                      {empleado.Email}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-gray-900 dark:text-white">
                        {getAreaName(empleado.AreaID)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {empleado.AreaID}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {empleado.Rol}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    empleado.Estado === 'activo'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {empleado.Estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedEmpleado(empleado);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Registrar rostro"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(empleado.EmpleadoID)}
                      disabled={isDeleting === empleado.EmpleadoID}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                      title="Eliminar empleado"
                    >
                      {isDeleting === empleado.EmpleadoID ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Mostrando {empleados.length} de {pagination.total} empleados
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Filas por página:</span>
              <select
                value={pagination.page_size}
                onChange={(e) => {
                  setEmpleadosData(prev => ({
                    ...prev,
                    pagination: {
                      ...prev.pagination,
                      page: 1, // Reset to first page when changing page size
                      page_size: Number(e.target.value)
                    }
                  }));
                }}
                className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {[5, 10, 20, 50].map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                Página {pagination.page} de {pagination.total_pages}
              </span>
              <button
                onClick={() => handlePageChange(1)}
                disabled={!pagination.has_previous}
                className={`p-1.5 rounded-md ${!pagination.has_previous 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_previous}
                className={`p-1.5 rounded-md ${!pagination.has_previous 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className={`p-1.5 rounded-md ${!pagination.has_next 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.total_pages)}
                disabled={!pagination.has_next}
                className={`p-1.5 rounded-md ${!pagination.has_next 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Face Recognition Modal */}
    {selectedEmpleado && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Registrar rostro de {selectedEmpleado.Nombre} {selectedEmpleado.Apellido}
            </h3>
            <button
              onClick={() => {
                if (streamRef.current) {
                  streamRef.current.getTracks().forEach(track => track.stop());
                }
                setSelectedEmpleado(null);
                setCapturedImage(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('camera')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'camera' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'}`}
                  >
                    Cámara Web
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'upload' 
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'}`}
                  >
                    Subir Imagen
                  </button>
                </nav>
              </div>

              {/* Camera Tab */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center text-white">
                    {isCameraLoading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-10">
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                        <p className="text-white mt-4 text-lg">Iniciando cámara...</p>
                      </div>
                    ) : (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className={`w-full h-full object-cover ${isStreaming && !capturedImage ? 'block' : 'hidden'}`}
                          onCanPlay={() => setIsStreaming(true)}
                        />
                        
                        {capturedImage && (
                          <img 
                            src={capturedImage} 
                            alt="Captured face" 
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {!isStreaming && !capturedImage && !isCameraLoading && (
                          <div className="text-center p-4">
                            <Camera className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <p>La cámara no está disponible o no se ha iniciado</p>
                          </div>
                        )}
                      </>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    {!capturedImage ? (
                      <>
                        <button
                          onClick={startStreaming}
                          disabled={isStreaming || isCameraLoading}
                          className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCameraLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                          {isStreaming ? 'Cámara Iniciada' : 'Iniciar Cámara'}
                        </button>
                        <button
                          onClick={handleCapture}
                          disabled={!isStreaming || isCameraLoading}
                          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Camera className="w-4 h-4" />
                          Capturar Rostro
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setCapturedImage(null)}
                          className="inline-flex items-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <X className="w-4 h-4" />
                          Volver a Tomar
                        </button>
                        <button
                          onClick={handleRegisterFace}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Registrar Rostro
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center p-6 text-center">
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={handleRemoveFile}
                          className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                          aria-label="Remove image"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Sube un archivo</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileChange}
                              ref={fileInputRef}
                            />
                          </label>
                          <p className="pl-1">o arrástralo aquí</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF hasta 5MB
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleRegisterFace}
                      disabled={!previewUrl || isProcessing}
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Registrar Rostro
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesTable;
