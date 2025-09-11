import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, LabelList } from 'recharts';
import { Info, BarChart2 } from 'lucide-react';
import colors from '../../theme/colors';

type WasteRow = {
  TipoProducto: string;
  TotalProducido: number;
  TotalDescartado: number;
  PorcentajeDesperdicio: number;
};

function toStack(rows: WasteRow[]) {
  return rows.map((r) => ({
    ...r,
    Aprovechado: Math.max(r.TotalProducido - r.TotalDescartado, 0),
  }));
}

interface Props {
  data: WasteRow[];
}

export default function WasteStackedBarChart({ data }: Props) {
  const [showHelp, setShowHelp] = useState(false);
  const chartData = useMemo(() => toStack(data), [data]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Producción vs Desperdicio
          </h3>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-emerald-500 dark:text-gray-500 dark:hover:text-emerald-400 transition-colors"
            aria-label="Mostrar ayuda"
          >
            <Info size={16} />
          </button>
        </div>
      </div>
      {showHelp && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Comparativa entre la cantidad producida y la cantidad de desperdicio por tipo de producto.
        </p>
      )}

      <div className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            margin={{ top: 5, right: 5, left: 50, bottom: 5 }}
            barCategoryGap={12}
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
              dataKey="TipoProducto"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: colors.gray[600],
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
              tickMargin={5}
              height={60}
              className="dark:[&_text]:fill-gray-300"
            />
            <YAxis 
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: colors.gray[600],
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
              width={60}
              tickFormatter={(value) => (value >= 1000 ? `${value/1000}k` : value)}
              className="dark:[&_text]:fill-gray-300"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '0.5rem',
                fontSize: '0.875rem',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'PorcentajeDesperdicio') 
                  return [`${value.toFixed(2)}%`, 'Tasa de desperdicio'];
                return [value, name];
              }}
              labelFormatter={(label) => `Producto: ${label}`}
            />
            <Legend 
              verticalAlign="top"
              height={40}
              wrapperStyle={{
                paddingBottom: '1rem',
              }}
            />
            <Bar 
              dataKey="Aprovechado" 
              stackId="total" 
              fill={colors.success[500]}
              name="Aprovechado"
              radius={[4, 0, 0, 4]}
            />
            <Bar 
              dataKey="TotalDescartado" 
              stackId="total" 
              fill={colors.error[500]}
              name="Desperdicio"
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey="PorcentajeDesperdicio"
                position="top"
                content={({ x, y, width, value }: any) => {
                  const text = `${Number(value).toFixed(1)}%`;
                  return (
                    <text
                      x={x + width / 2}
                      y={y - 4}
                      fill="currentColor"
                      textAnchor="middle"
                      dominantBaseline="bottom"
                      className="text-xs font-semibold text-gray-900 dark:text-gray-200"
                    >
                      {text}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
