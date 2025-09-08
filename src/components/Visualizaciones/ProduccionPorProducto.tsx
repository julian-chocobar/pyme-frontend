import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer} from "recharts";

interface DataRow {
  TipoProducto: string;
  Trimestre: string;
  CantidadLotes: number;
  CantidadTotal: number;
}

interface Props {
  data: DataRow[];
}


export default function ProductionBarChart({ data }: Props) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h3 className="text-lg font-semibold mb-2">Producción por Producto</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="TipoProducto" angle={-25} textAnchor="end" interval={0} height={90} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="CantidadTotal" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}