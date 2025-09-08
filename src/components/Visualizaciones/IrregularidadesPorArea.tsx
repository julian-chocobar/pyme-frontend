import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

interface Props {
  data: { Area: string; CantidadIrregularidades: number }[];
}

export default function IrregularidadesPorAreaChart({ data }: Props) {
  return (
    <div className="p-4 bg-white rounded-2xl shadow">
      <h3 className="text-lg font-semibold mb-2">Irregularidades por Área</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Area" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="CantidadIrregularidades" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}