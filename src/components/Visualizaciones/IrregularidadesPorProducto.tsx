import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LabelList, 
  Cell,
  CartesianGrid
} from 'recharts';
import { AlertTriangle, BarChart2 } from 'lucide-react';
import colors from '../../theme/colors';

interface DataItem {
  TipoProducto: string;
  CantidadIrregularidades: number;
  [key: string]: any;
}

interface Props {
  data: DataItem[];
}

export default function IrregularidadesPorProductoChart({ data }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.CantidadIrregularidades - a.CantidadIrregularidades);
  }, [data]);

  const totalIrregularities = useMemo(() => {
    return data.reduce((sum, item) => sum + item.CantidadIrregularidades, 0);
  }, [data]);

  const getBarColor = (value: number, max: number) => {
    if (max === 0) return colors.gray[300];
    const percentage = (value / max) * 100;
    if (percentage > 80) return colors.error[500];
    if (percentage > 50) return colors.warning[500];
    return colors.success[400]; // Green for low irregularity
  };
  
  const maxValue = Math.max(...sortedData.map(d => d.CantidadIrregularidades), 0);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Irregularidades por Producto
          </h3>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 transition-colors"
            aria-label="Mostrar ayuda"
          >
            <AlertTriangle size={16} />
          </button>
        </div>
        <div className="text-sm bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-1 rounded-md">
          Total: {totalIrregularities} irreg.
        </div>
      </div>
      {showHelp && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Comparativa de irregularidades detectadas por tipo de producto.
        </p>
      )}

      <div className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            barCategoryGap={6}
            barGap={2}
          >
            <CartesianGrid 
              horizontal={true} 
              vertical={false} 
              stroke={colors.gray[200]}
              strokeOpacity={0.7}
              className="dark:opacity-50"
            />
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: colors.gray[600],
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
              tickMargin={5}
              tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
              className="dark:[&_text]:fill-gray-300"
            />
            <YAxis 
              dataKey="TipoProducto" 
              type="category" 
              width={100}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: colors.gray[700],
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
              tickMargin={5}
              className="dark:[&_text]:fill-gray-300"
            />
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
              formatter={(value: number) => {
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                let level = 'bajo';
                if (percentage > 80) level = 'alto';
                else if (percentage > 50) level = 'medio';
                
                return [
                  <div key="value" className="flex items-center gap-1">
                    <span className="font-semibold">{value}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{
                      backgroundColor: 
                        level === 'alto' ? colors.error[100] : 
                        level === 'medio' ? colors.warning[100] : 
                        colors.success[100],
                      color: 
                        level === 'alto' ? colors.error[700] : 
                        level === 'medio' ? colors.warning[700] : 
                        colors.success[700],
                    }}>
                      {level}
                    </span>
                  </div>,
                  <span key="label" className="text-gray-500">irregularidades</span>
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
            <Bar 
              dataKey="CantidadIrregularidades" 
              name="Irregularidades"
              radius={[0, 4, 4, 0]}
              onMouseEnter={(_, index) => setActiveBar(index)}
              onMouseLeave={() => setActiveBar(null)}
            >
              {sortedData.map((item, index) => {
                const isActive = activeBar === null || activeBar === index;
                const barColor = getBarColor(item.CantidadIrregularidades, maxValue);
                
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={barColor}
                    opacity={isActive ? 1 : 0.6}
                    style={{
                      transition: 'opacity 0.2s ease-in-out',
                      cursor: 'pointer',
                      filter: isActive ? 'saturate(1.2)' : 'saturate(1)',
                    }}
                  />
                );
              })}
              <LabelList
                dataKey="CantidadIrregularidades"
                position="right"
                fill="currentColor"
                className="text-xs font-medium text-gray-900 dark:text-gray-100"
                formatter={(value: any) => typeof value === 'number' ? value.toLocaleString() : value}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
