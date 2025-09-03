import React from 'react';
import { Acceso, getAreaName } from '../types';
import { User, Shield } from 'lucide-react';

interface AccessLogTableProps {
  accesos: Array<Acceso & {
    Nombre?: string | null;
    Apellido?: string | null;
    Rol?: string;
    DNI?: string;
  }>;
}

export const AccessLogTable: React.FC<AccessLogTableProps> = ({ accesos }) => {

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Fecha/Hora
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Empleado
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                Área
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                Tipo
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                Método
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                Confianza
              </th>
            </tr>
          </thead>
          <tbody>
            {accesos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                  No hay accesos registrados.
                </td>
              </tr>
            ) : (
              accesos.slice(0, 15).map((acceso) => (
                <tr key={acceso.AccesoID} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div>{new Date(acceso.FechaHora).toLocaleDateString('es-ES')}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(acceso.FechaHora).toLocaleTimeString('es-ES')}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {acceso.EmpleadoID === null ? 'Empleado Desconocido' : (acceso.Nombre ? `${acceso.Nombre} ${acceso.Apellido || ''}`.trim() : 'Desconocido')}
                        </div>
                        {acceso.Rol && (
                          <div className="text-xs text-gray-500">
                            {acceso.Rol}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900 dark:text-white">
                      {getAreaName(acceso.AreaID)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {acceso.AreaID}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${acceso.TipoAcceso === 'Ingreso' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                      {acceso.TipoAcceso}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${acceso.MetodoAcceso === 'Facial' 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}>
                      <Shield className="w-3 h-3" />
                      {acceso.MetodoAcceso}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {acceso.ConfianzaReconocimiento !== null ? (
                      <div className={`font-medium ${
                        acceso.ConfianzaReconocimiento >= 0.8 
                          ? 'text-green-600 dark:text-green-400'
                          : acceso.ConfianzaReconocimiento >= 0.6
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {Math.round(acceso.ConfianzaReconocimiento * 100)}%
                      </div>
                    ) : (
                      <div>-</div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};