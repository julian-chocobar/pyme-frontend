import { AreaTrabajo, Empleado } from '../types';
import { CheckCircle, XCircle, User, Shield, Building } from 'lucide-react';

interface ResultDisplayProps {
  result: {
    empleado?: {
      id: number;
      nombre: string;
      apellido: string;
      rol: string;
      DNI?: string;
    };
    confianza?: number;
    acceso_permitido: boolean;
    mensaje: string;
    empleadoFull?: Empleado;
    area_id?: string;
    tipo_acceso?: string;
    message?: string; // For backward compatibility
  } | null;
  areas: AreaTrabajo[];
}

export const ResultDisplay = ({ result, areas }: ResultDisplayProps) => {
  if (!result) return null;

  return (
    <div className={`flex items-start gap-4 p-6 rounded-lg ${
      result.acceso_permitido
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
      }`}> 
      {result.acceso_permitido ? (
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
      ) : (
        <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
      )}
      <div className="flex-1">
        <p className={`text-xl font-bold mb-2 ${
          result.acceso_permitido
            ? 'text-green-900 dark:text-green-100'
            : 'text-red-900 dark:text-red-100'
          }`}> 
          {result.acceso_permitido
            ? 'ACCESO AUTORIZADO' : 'ACCESO DENEGADO'}
        </p>
        <p className={`text-sm ${
          result.acceso_permitido ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
          {result.mensaje}
        </p>

        <div className="space-y-3 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {result.empleadoFull ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {result.empleadoFull.Nombre} {result.empleadoFull.Apellido}
                  </span>
                </div>
                {result.empleadoFull.DNI && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      DNI: {result.empleadoFull.DNI}
                    </span>
                  </div>
                )}
              </>
            ) : (
              !result.acceso_permitido && (
                <div className="flex items-center gap-2 col-span-2">
                  <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Empleado no identificado
                  </span>
                </div>
              )
            )}

            {result.area_id && areas.length > 0 && (
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">
                  {areas.find(a => a.AreaID === result.area_id)?.Nombre || 'Área desconocida'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300">
                <strong>Acceso:</strong> {result.tipo_acceso}
              </span>
            </div>

            {result.empleadoFull?.Email && (
              <div className="flex items-center gap-2 col-span-2">
                <span className="text-gray-700 dark:text-gray-300 text-sm">
                  <strong>Email:</strong> {result.empleadoFull.Email}
                </span>
              </div>
            )}
          </div>
        </div>

        {!result.acceso_permitido && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">
              {result.mensaje || result.message || 'Error desconocido'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
