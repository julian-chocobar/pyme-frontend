import { useState, useMemo } from 'react';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend, CartesianGrid } from 'recharts';
import { PieChart as PieChartIcon, AlertTriangle } from 'lucide-react';
import colors from '../../theme/colors';

interface ChartDataItem {
  Area: string;
  CantidadIrregularidades: number;
}

export function IrregularidadesStacked({ data }: { data: ChartDataItem[] }) {
  // Ensure we have valid data
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }
  
  return <IrregularidadesPorAreaChart data={data} />;
}

export default function IrregularidadesPorAreaChart({ data }: { data: ChartDataItem[] }) {
  const [showHelp, setShowHelp] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const sortedData = useMemo(() => 
    [...data].sort((a, b) => b.CantidadIrregularidades - a.CantidadIrregularidades),
    [data]
  );

  const totalIrregularities = useMemo(
    () => data.reduce((sum, item) => sum + item.CantidadIrregularidades, 0),
    [data]
  );

  const getAreaColor = (area: string) => {
    // Normalize the area name by trimming
    const normalizedArea = area.trim();
    
    // Map of area names to colors based on the types/index.ts
    const areaColors: Record<string, string> = {
      // Using the area names from types/index.ts
      'Preparación': '#0ea5e9',      // blue-500
      'Preparacion': '#0ea5e9',      // variant without accent
      'Procesamiento': '#8b5cf6',    // violet-500
      'Elaboración': '#10b981',      // emerald-500
      'Elaboracion': '#10b981',      // variant without accent
      'Envasado': '#ec4899',         // pink-500
      'Etiquetado': '#f59e0b',       // amber-500
      'Control Calidad': '#10b981',   // emerald-500
      'Administración': '#0c4a6e',   // blue-900
      'Administracion': '#0c4a6e',   // variant without accent
      'Común': '#6b7280',            // gray-500
      'Comun': '#6b7280',            // variant without accent
      'Logística': '#7c3aed',        // violet-600
      'Logistica': '#7c3aed'         // variant without accent
    };
    
    // Try exact match first, then try case-insensitive match
    return areaColors[normalizedArea] || 
           areaColors[Object.keys(areaColors).find(key => 
             key.toLowerCase() === normalizedArea.toLowerCase()
           ) as string] || '#9ca3af'; // gray-400 as fallback
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = 25 + innerRadius + (outerRadius - innerRadius);
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={colors.gray[700]}
        className="dark:fill-gray-200 text-xs font-medium"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        onMouseEnter={() => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(null)}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Irregularidades por Área
          </h3>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-violet-500 dark:text-gray-500 dark:hover:text-violet-400 transition-colors"
            aria-label="Mostrar ayuda"
          >
            <AlertTriangle size={16} />
          </button>
        </div>
        <div className="text-sm bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-1 rounded-md">
          Total: {totalIrregularities} irreg.
        </div>
      </div>
      {showHelp && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Distribución de irregularidades por área de la fábrica.
        </p>
      )}

      <div className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.gray[200]}
              strokeOpacity={0.5}
              className="dark:opacity-50"
            />
            <Pie
              data={sortedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={90}
              innerRadius={50}
              dataKey="CantidadIrregularidades"
              nameKey="Area"
              label={renderCustomizedLabel}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              paddingAngle={2}
              cornerRadius={4}
            >
              {sortedData.map((entry, index) => {
                const isActive = activeIndex === null || activeIndex === index;
                const color = getAreaColor(entry.Area);
                
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                    stroke="#fff"
                    strokeWidth={isActive ? 2 : 1}
                    style={{
                      fill: color,
                      opacity: isActive ? 1 : 0.7,
                      transition: 'opacity 0.2s ease-in-out',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                border: '1px solid',
                borderColor: colors.gray[200],
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '0.5rem',
                fontSize: '0.75rem',
                color: colors.gray[800],
              }}
              formatter={(value: number, name: string) => {
                const percentage = totalIrregularities > 0 
                  ? ((value / totalIrregularities) * 100).toFixed(1)
                  : '0';
                return [
                  <div key="value" className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: getAreaColor(name),
                        flexShrink: 0
                      }} 
                    />
                    <span className="font-semibold">{value}</span>
                    <span className="text-gray-500">({percentage}%)</span>
                  </div>,
                  ''
                ];
              }}
              labelFormatter={(label) => (
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {label}
                </div>
              )}
              itemStyle={{
                padding: '0.25rem 0',
              }}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '0.5rem',
                fontSize: '0.7rem',
              }}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
