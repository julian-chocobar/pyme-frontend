import {
  BarChart,
  Bar,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from "recharts";

interface Props {
  data: { TipoProducto: string; CantidadIrregularidades: number }[];
}

export default function IrregularidadesPorProductoChart({ data }: Props) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h3 className="text-lg font-semibold mb-2">
        Irregularidades por Producto
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="TipoProducto" angle={-25} textAnchor="end" interval={0} height={90} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="CantidadIrregularidades" fill="#f59e0b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
