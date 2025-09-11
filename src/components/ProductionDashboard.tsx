import React, { useMemo, useState } from 'react';
import { RefreshCw, LayoutGrid } from 'lucide-react';
import { 
  generateProductionByTypeQuarter,
  generateIrregularityByAreaProduct,
  generateWastePercentageByProduct,
  sumIrregularidadesPorArea,
  sumIrregularidadesPorProducto
} from '../services/mockData';

import ProduccionPorProducto from "./Visualizaciones/ProduccionPorProducto";
import IrregularidadesPorArea from './Visualizaciones/IrregularidadesPorArea';
import IrregularidadesPorProducto from './Visualizaciones/IrregularidadesPorProducto';
import Desperdicio from './Visualizaciones/Desperdicio';

export const ProductionDashboard: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Generate dashboard data
  const dashboardData = useMemo(() => ({
    productionByTypeQuarter: generateProductionByTypeQuarter(),
    irregularityByAreaProduct: generateIrregularityByAreaProduct(),
    wastePercentageByProduct: generateWastePercentageByProduct(),
  }), [refreshKey]);

  const IrregPorArea = sumIrregularidadesPorArea(dashboardData.irregularityByAreaProduct);
  const IrregPorProducto = sumIrregularidadesPorProducto(dashboardData.irregularityByAreaProduct);

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1); 
  };

  return (
    <div className="min-h-screen ">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <LayoutGrid className="w-5 h-5 md:w-6 md:h-6 text-gray-800 dark:text-white" />
              Visualizaciones de Producción
            </h1>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1">
              Análisis detallado de la producción y calidad
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Actualizado: {new Date().toLocaleString('es-ES')}
            </span>
            <button
              onClick={handleRefreshData}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300 ${refreshKey > 0 ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Producción por Producto */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="h-64 md:h-80">
            <ProduccionPorProducto rows={dashboardData.productionByTypeQuarter} />
          </div>
        </div>

        {/* Irregularidades por Producto */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="h-64 md:h-80">
            <IrregularidadesPorProducto data={IrregPorProducto} />
          </div>
        </div>

        {/* Irregularidades por Área */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="h-64 md:h-80">
            <IrregularidadesPorArea data={IrregPorArea} />
          </div>
        </div>

        {/* Porcentaje de Desperdicio */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="h-64 md:h-80">
            <Desperdicio data={dashboardData.wastePercentageByProduct} />
          </div>
        </div>
      </div>
    </div>
  );
};