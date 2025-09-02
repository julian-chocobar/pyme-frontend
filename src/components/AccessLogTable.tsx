import React, { useState, useEffect } from 'react';
import { Acceso } from '../types';
import { User, MapPin, Shield } from 'lucide-react';

interface AccessLogTableProps {
  accesos: Acceso[];
}

import { getEmpleado, getAreas } from '../services/api';
import { Empleado, AreaTrabajo } from '../types';

export const AccessLogTable: React.FC<AccessLogTableProps> = ({ accesos }) => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [areas, setAreas] = useState<AreaTrabajo[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const areasData = await getAreas();
        setAreas(areasData);

        // Fetch all unique employees from accesos
        const employeeIds = [...new Set(accesos.map(a => a.EmpleadoID))].filter(id => id != null) as number[];
        const employeePromises = employeeIds.map(id => getEmpleado(id));
        const employeesData = await Promise.all(employeePromises);
        setEmpleados(employeesData.filter(e => e !== undefined) as Empleado[]);

      } catch (error) {
        console.error("Error fetching initial data for access log:", error);
      }
    };

    if (accesos.length > 0) {
      fetchInitialData();
    }
  }, [accesos]);

  const getEmpleadoInfo = (empleadoId: number) => {
    return empleados.find((emp: Empleado) => emp.EmpleadoID === empleadoId);
  };

  const getAreaInfo = (areaId: string) => {
    return areas.find((area: AreaTrabajo) => area.AreaID === areaId.toString());
  };

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
            {accesos.slice(0, 15).map((acceso) => {
              const empleado = acceso.EmpleadoID !== null ? getEmpleadoInfo(acceso.EmpleadoID) : undefined;
              const area = getAreaInfo(acceso.AreaID);
              
              return (
                <tr key={acceso.AccesoID} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">
                    <div className="space-y-1">
                      <div>{new Date(acceso.FechaHoraIngreso).toLocaleDateString('es-ES')}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(acceso.FechaHoraIngreso).toLocaleTimeString('es-ES')}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {acceso.EmpleadoID === null ? 'Empleado Desconocido' : (empleado ? `${empleado.Nombre} ${empleado.Apellido}` : 'Cargando...')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {empleado?.Rol ? empleado.Rol.replace('_', ' ') : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-gray-900 dark:text-white">
                          {area?.Nombre || 'Área Desconocida'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Nivel: {area?.NivelAcceso || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${acceso.TipoAcceso === 'Ingreso' 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                      <Shield className="w-3 h-3" />
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
              );
            })}
          </tbody>
          {accesos.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-4 text-center text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <p>No hay accesos registrados.</p>
                </div>
              </td>
            </tr>
          )}
        </table>

      </div>
    </div>
  );
};