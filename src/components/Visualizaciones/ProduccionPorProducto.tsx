import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Info, TrendingUp } from 'lucide-react';
import colors from '../../theme/colors';

// === Tipos de entrada ===
export interface ProductionByTypeQuarter {
  TipoProducto: string;
  Trimestre: string;        // ej: "Q1 2024"
  CantidadLotes: number;
  CantidadTotal: number;
}

// Usar colores del tema
const { products } = colors;

// === Util: ordenar "Qn YYYY" cronológicamente ===
function quarterKey(q: string) {
  // "Q3 2025" -> { y:2025, q:3 }
  const [qPart, yPart] = q.split(" ");
  const qNum = Number(qPart.replace("Q", ""));
  const year = Number(yPart);
  return { year, qNum };
}
function quarterCompare(a: string, b: string) {
  const A = quarterKey(a), B = quarterKey(b);
  if (A.year !== B.year) return A.year - B.year;
  return A.qNum - B.qNum;
}

// === Pivot: de filas largas a ancho por trimestre ===
// Salida: { data: [{Trimestre, Prod1, Prod2, ...}], productos: string[] }
function pivotByQuarter(rows: ProductionByTypeQuarter[]) {
  const trimestres = Array.from(new Set(rows.map(r => r.Trimestre))).sort(quarterCompare);
  const productos  = Array.from(new Set(rows.map(r => r.TipoProducto))).sort();

  const base = new Map<string, any>();
  trimestres.forEach(t => base.set(t, { Trimestre: t }));

  rows.forEach(r => {
    const obj = base.get(r.Trimestre);
    obj[r.TipoProducto] = (obj[r.TipoProducto] ?? 0) + r.CantidadTotal;
  });

  return { data: Array.from(base.values()), productos };
}

// === Componente ===
export default function ProductionLineChart({ rows }: { rows: ProductionByTypeQuarter[] }) {
  const [showHelp, setShowHelp] = useState(false);
  const [activeLine, setActiveLine] = useState<string | null>(null);
  
  const { data, productos } = useMemo(() => pivotByQuarter(rows), [rows]);
  const totalProduction = useMemo(() => {
    return data.reduce((sum, item) => {
      return sum + productos.reduce((s, p) => s + (item[p] || 0), 0);
    }, 0);
  }, [data, productos]);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Producción por Trimestre
          </h3>
          <button 
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors"
            aria-label="Mostrar ayuda"
          >
            <Info size={16} />
          </button>
        </div>
        <div className="text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">
          Total: {totalProduction.toLocaleString()} u.
        </div>
      </div>
      {showHelp && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Evolución de la producción total por trimestre, desglosada por tipo de producto.
        </p>
      )}

      <div className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 5, left: 0, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.gray[200]}
              strokeOpacity={0.7}
              vertical={false}
              className="dark:opacity-50"
            />
            <XAxis
              dataKey="Trimestre"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: colors.gray[600],
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
              tickMargin={8}
              height={35}
              className="dark:[&_text]:fill-gray-300"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{
                fill: colors.gray[600],
                fontSize: '0.7rem',
                fontWeight: 500,
              }}
              tickMargin={5}
              width={35}
              tickFormatter={(value) => {
                if (value >= 1000) return `${value / 1000}k`;
                return value;
              }}
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
              formatter={(value: number) => [
                <span key="value" className="font-semibold">{value.toLocaleString()}</span>, 
                <span key="label" className="text-gray-500">unidades</span>
              ]}
              labelFormatter={(label) => (
                <div className="text-xs font-medium text-gray-700">
                  {label}
                </div>
              )}
              itemStyle={{
                padding: '0.25rem 0',
              }}
            />
            <Legend 
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

            {productos.map((p) => (
              <Line
                key={p}
                type="monotone"
                dataKey={p}
                stroke={(products as Record<string, string>)[p] || colors.gray[400]}
                strokeWidth={2}
                dot={{
                  r: 4,
                  stroke: (products as Record<string, string>)[p] || colors.gray[400],
                  strokeWidth: 2,
                  fill: '#fff',
                  opacity: activeLine === null || activeLine === p ? 1 : 0.3,
                }}
                activeDot={{
                  r: 6,
                  stroke: (products as Record<string, string>)[p] || colors.gray[400],
                  strokeWidth: 2,
                  fill: '#fff',
                  style: {
                    filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.2))',
                  }
                }}
                strokeOpacity={activeLine === null || activeLine === p ? 1 : 0.3}
                style={{
                  transition: 'opacity 0.2s ease-in-out',
                }}
                onMouseEnter={() => setActiveLine(p)}
                onMouseLeave={() => setActiveLine(null)}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
