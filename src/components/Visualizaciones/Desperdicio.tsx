import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, LabelList
} from "recharts";

type WasteRow = {
  TipoProducto: string;
  TotalProducido: number;
  TotalDescartado: number;
  PorcentajeDesperdicio: number; // 0–100 (según tu mock)
};

function toStack(rows: WasteRow[]) {
  return rows.map(r => ({
    ...r,
    Aprovechado: Math.max(r.TotalProducido - r.TotalDescartado, 0),
  }));
}

interface Props {
  data: WasteRow[];
}
export default function WasteStackedBarChart({ data }: Props) {
  const chartData = toStack(data);

  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h3 className="text-lg font-semibold mb-2">Producción vs Descarte por Producto</h3>

      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="TipoProducto"
            interval={0}
            tick={{ fontSize: 11 }}
            angle={-20}
            textAnchor="end"
          />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === "PorcentajeDesperdicio") return [`${value.toFixed(2)}%`, "Desperdicio"];
              return [value, name];
            }}
            labelFormatter={(label) => `Producto: ${label}`}
          />
          <Legend />


          <Bar dataKey="Aprovechado" stackId="total" fill="#10b981" name="Aprovechado" />
          <Bar dataKey="TotalDescartado" stackId="total" fill="#ef4444" name="Descartado">
            <LabelList
              dataKey="PorcentajeDesperdicio"
              position="top"
              formatter={(label) =>
                typeof label === "number" ? `${label.toFixed(2)}%` : label
              }
              style={{ fontSize: 11, fontWeight: 600, fill: "#111" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
