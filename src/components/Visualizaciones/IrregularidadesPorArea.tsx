import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

interface Props {
  data: { Area: string; CantidadIrregularidades: number }[];
}

// Paleta de colores para cada área
const COLORS = [
  "#ef4444", // rojo
  "#3b82f6", // azul
  "#10b981", // verde
  "#f59e0b", // naranja
  "#8b5cf6", // violeta
  "#06b6d4", // cyan
  "#64748b", // gris
];

export default function IrregularidadesPorAreaChart({ data }: Props) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h3 className="text-lg font-semibold mb-2">Irregularidades por Área</h3>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            dataKey="CantidadIrregularidades"
            nameKey="Area"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={(entry) => `${entry.CantidadIrregularidades}`} // 👈 muestra el número en cada porción
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} irregularidades`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
