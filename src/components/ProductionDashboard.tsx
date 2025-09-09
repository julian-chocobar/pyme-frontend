import React, { useState, useMemo } from 'react';
import { TrendingUp, AlertTriangle, Package, RefreshCw, Factory } from 'lucide-react';
import { 
  generateProductionByTypeQuarter,
  generateIrregularityByAreaProduct,
  generateWastePercentageByProduct,
  sumIrregularidadesPorArea,
  sumIrregularidadesPorProducto,
  generateMockLotes,
  generateMockIrregularidades
} from '../services/mockData';

import ProductionBarChart from "./Visualizaciones/ProduccionPorProducto";
import IrregularidadesStacked from './Visualizaciones/IrregularidadesPorArea';
import IrregularidadesPorProducto from './Visualizaciones/IrregularidadesPorProducto';
import Desperdicio from './Visualizaciones/Desperdicio';
import ProductionLineChart from './Visualizaciones/ProduccionPorProducto';

export const ProductionDashboard: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'overview' | 'production' | 'quality' | 'visualizaciones'>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Generate dashboard data
  const dashboardData = useMemo(() => ({
    productionByTypeQuarter: generateProductionByTypeQuarter(),
    irregularityByAreaProduct: generateIrregularityByAreaProduct(),
    wastePercentageByProduct: generateWastePercentageByProduct(),
    mockLotes: generateMockLotes(),
    irregularidades: generateMockIrregularidades(),
  }), [refreshKey]);

  const IrregPorArea = sumIrregularidadesPorArea(dashboardData.irregularityByAreaProduct);
  const IrregPorProducto = sumIrregularidadesPorProducto(dashboardData.irregularityByAreaProduct);

  console.log( 'productionBytypequarter', dashboardData.productionByTypeQuarter );
  console.log( 'irregularityByAreaProduct', dashboardData.irregularityByAreaProduct );
  console.log( 'wastePercentageByProduct', dashboardData.wastePercentageByProduct );
  console.log( 'mocklotes', dashboardData.mockLotes);
  console.log( 'irregularidades', dashboardData.irregularidades);

  const handleRefreshData = () => {
    setRefreshKey(prev => prev + 1); 
  };

  // Calculate KPIs
  const totalLotes = dashboardData.productionByTypeQuarter.reduce((sum, item) => sum + item.CantidadLotes, 0);
  const totalProduction = dashboardData.productionByTypeQuarter.reduce((sum, item) => sum + item.CantidadTotal, 0);
  const totalIrregularities = dashboardData.irregularityByAreaProduct.reduce((sum, item) => sum + item.CantidadIrregularidades, 0);
  const avgWastePercentage = dashboardData.wastePercentageByProduct.reduce((sum, item) => sum + item.PorcentajeDesperdicio, 0) / dashboardData.wastePercentageByProduct.length;

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Factory className="w-6 h-6" />
            Dashboard de Producción - PyME Pastas
          </h2>
          
          <div className="flex items-center gap-4">
            <select 
              value={selectedView} 
              onChange={(e) => setSelectedView(e.target.value as 'overview' | 'production' | 'quality')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <option value="overview">Vista General</option>
              <option value="production">Producción</option>
              <option value="quality">Calidad</option>
              <option value="visualizaciones">Visualizaciones</option>
            </select>
            
            <button
              onClick={handleRefreshData}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-gray-500"
              title="Refrescar datos"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Empresa:</strong> PyME Pastas Artesanales</p>
          <p><strong>Período:</strong> Últimos 12 meses</p>
          <p><strong>Última actualización:</strong> {new Date().toLocaleString('es-ES')}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Lotes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalLotes.toLocaleString()}
              </p>
            </div>
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Producción Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalProduction.toLocaleString()} kg
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>


        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Irregularidades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalIrregularities}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Desperdicio Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgWastePercentage.toFixed(1)}%
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Dashboard Content */}

      {selectedView === 'visualizaciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionLineChart rows={dashboardData.productionByTypeQuarter} />
          <IrregularidadesPorProducto data={IrregPorProducto} />
          <IrregularidadesStacked data={IrregPorArea} />
          <Desperdicio data={dashboardData.wastePercentageByProduct} />

        </div>
      )}



      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Production by Type and Quarter */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Producción por Producto y Trimestre
            </h3>
            <div className="space-y-3">
              {dashboardData.productionByTypeQuarter.slice(0, 8).map((item, index) => {
                const maxCantidad = Math.max(...dashboardData.productionByTypeQuarter.map(d => d.CantidadTotal));
                const percentage = (item.CantidadTotal / maxCantidad) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {item.TipoProducto} - {item.Trimestre}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.CantidadTotal.toLocaleString()} kg ({item.CantidadLotes} lotes)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-black dark:bg-white h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {selectedView === 'production' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Waste Percentage by Product */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Porcentaje de Desperdicio por Producto
            </h3>
            <div className="space-y-4">
              {dashboardData.wastePercentageByProduct.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {item.TipoProducto}
                    </span>
                    <div className="text-right">
                      <div className={`font-bold ${
                        item.PorcentajeDesperdicio > 8 
                          ? 'text-red-600 dark:text-red-400'
                          : item.PorcentajeDesperdicio > 5
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {item.PorcentajeDesperdicio.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.TotalDescartado}kg / {item.TotalProducido}kg
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        item.PorcentajeDesperdicio > 8 
                          ? 'bg-red-500'
                          : item.PorcentajeDesperdicio > 5
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(item.PorcentajeDesperdicio * 10, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'quality' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Irregularidades por Área y Producto
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Área
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Producto
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Irregularidades
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Nivel de Riesgo
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.irregularityByAreaProduct.map((item, index) => {
                  const riskLevel = item.CantidadIrregularidades > 5 ? 'Alto' : 
                                   item.CantidadIrregularidades > 2 ? 'Medio' : 'Bajo';
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                        {item.Area}
                      </td>
                      <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                        {item.TipoProducto}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {item.CantidadIrregularidades}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          riskLevel === 'Alto' 
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : riskLevel === 'Medio'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        }`}>
                          {riskLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};