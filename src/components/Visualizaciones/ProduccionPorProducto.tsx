// ProductionLineChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// === Tipos de entrada ===
export interface ProductionByTypeQuarter {
  TipoProducto: string;
  Trimestre: string;        // ej: "Q1 2024"
  CantidadLotes: number;
  CantidadTotal: number;
}

// === Colores por producto (ajustá a gusto y/o compartí con otros charts) ===
const COLORS: Record<string, string> = {
  "Spaghetti": "#6366f1",
  "Ravioles de Ricota": "#10b981",
  "Fideos Moñito": "#f59e0b",
  "Salsa Bolognesa": "#ef4444",
  "Cappellettis de Jamón y Queso": "#3b82f6",
};

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
  const { data, productos } = pivotByQuarter(rows);

  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h3 className="text-lg font-semibold mb-2">Producción por Trimestre</h3>

      <ResponsiveContainer width="100%" height={360}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="Trimestre"
            interval={0}
            tick={{ fontSize: 12 }}
            angle={-15}
            textAnchor="end"
            height={50}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: any, name: string) => [value, name]}
            labelFormatter={(label) => `Trimestre: ${label}`}
          />
          <Legend />

          {productos.map((p) => (
            <Line
              key={p}
              type="monotone"
              dataKey={p}
              stroke={COLORS[p] || "#8884d8"}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
