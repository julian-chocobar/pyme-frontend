import { 
  TipoProducto, 
  Lote, 
  Irregularidad,
  Turno,
  ProductionByTypeQuarter,
  IrregularityByAreaProduct,
  WastePercentageByProduct
} from '../types';

// Mock data for employees


export const MOCK_TURNOS: Turno[] = [
  {
    TurnoID: 1,
    Nombre: 'Mañana',
    HoraInicio: '06:00:00',
    HoraFin: '14:00:00',
    EstadoTurno: 'Activo'
  },
  {
    TurnoID: 2,
    Nombre: 'Tarde',
    HoraInicio: '14:00:00',
    HoraFin: '22:00:00',
    EstadoTurno: 'Activo'
  },
  {
    TurnoID: 3,
    Nombre: 'Noche',
    HoraInicio: '22:00:00',
    HoraFin: '06:00:00',
    EstadoTurno: 'Activo'
  }
];

export const MOCK_TIPOS_PRODUCTO: TipoProducto[] = [
  {
    TipoProductoID: 1,
    Nombre: 'Spaghetti',
    Categoria: 'Pasta_Seca',
    DiasVidaUtil: 730,
    CondicionesAlmacenamiento: 'Lugar seco y fresco',
    TemperaturaAlmacenamiento: 20,
    NormativaAplicable: 'CAA Art. 760',
    Observaciones: 'Pasta larga tradicional'
  },
  {
    TipoProductoID: 2,
    Nombre: 'Ravioles de Ricota',
    Categoria: 'Pasta_Fresca',
    DiasVidaUtil: 7,
    CondicionesAlmacenamiento: 'Refrigeración',
    TemperaturaAlmacenamiento: 4,
    NormativaAplicable: 'CAA Art. 761',
    Observaciones: 'Pasta rellena fresca'
  },
  {
    TipoProductoID: 3,
    Nombre: 'Fideos Moñito',
    Categoria: 'Pasta_Seca',
    DiasVidaUtil: 730,
    CondicionesAlmacenamiento: 'Lugar seco y fresco',
    TemperaturaAlmacenamiento: 20,
    NormativaAplicable: 'CAA Art. 760',
    Observaciones: 'Pasta corta'
  },
  {
    TipoProductoID: 4,
    Nombre: 'Salsa Bolognesa',
    Categoria: 'Salsas',
    DiasVidaUtil: 365,
    CondicionesAlmacenamiento: 'Lugar seco',
    TemperaturaAlmacenamiento: 20,
    NormativaAplicable: 'CAA Art. 900',
    Observaciones: 'Salsa lista para consumo'
  },
  {
    TipoProductoID: 5,
    Nombre: 'Cappellettis de Jamón y Queso',
    Categoria: 'Rellenos',
    DiasVidaUtil: 5,
    CondicionesAlmacenamiento: 'Refrigeración',
    TemperaturaAlmacenamiento: 2,
    NormativaAplicable: 'CAA Art. 761',
    Observaciones: 'Pasta rellena premium'
  }
];

// Generate mock production data
export const generateMockLotes = (): Lote[] => {
  const lotes: Lote[] = [];
  const today = new Date();
  
  // Generate lotes for the last 12 months
  for (let month = 11; month >= 0; month--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - month);
    
    // Generate 20-35 lotes per month
    const lotesPerMonth = 20 + Math.floor(Math.random() * 15);
    
    for (let i = 0; i < lotesPerMonth; i++) {
      const dayOfMonth = 1 + Math.floor(Math.random() * 28);
      const loteDate = new Date(date.getFullYear(), date.getMonth(), dayOfMonth);
      
      const tipoProducto = MOCK_TIPOS_PRODUCTO[Math.floor(Math.random() * MOCK_TIPOS_PRODUCTO.length)];
      const cantidad = 50 + Math.floor(Math.random() * 200); // 50-250 kg
      
      const vencimiento = new Date(loteDate);
      vencimiento.setDate(vencimiento.getDate() + tipoProducto.DiasVidaUtil);
      
      // 5% chance of being discarded (waste)
      const estado = Math.random() > 0.05 ? 'Terminado' : 'Descartado';
      
      lotes.push({
        LoteID: lotes.length + 1,
        CodigoLote: `L${loteDate.getFullYear()}${String(loteDate.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(3, '0')}`,
        TipoProductoID: tipoProducto.TipoProductoID,
        Cantidad: cantidad,
        EstadoLote: estado,
        FechaVencimiento: vencimiento.toISOString(),
        FechaProduccion: loteDate.toISOString(),
        Observaciones: Math.random() > 0.8 ? 'Lote especial para cliente premium' : undefined
      });
    }
  }
  
  return lotes;
};



export const generateMockIrregularidades = (): Irregularidad[] => {
  const irregularidades: Irregularidad[] = [];
  const lotes = generateMockLotes();
  
  // Generate 3-8% of lotes with irregularities
  const irregularityCount = Math.floor(lotes.length * (0.03 + Math.random() * 0.05));
  
  for (let i = 0; i < irregularityCount; i++) {
    const lote = lotes[Math.floor(Math.random() * lotes.length)];
    const area = { AreaID: 1 + Math.floor(Math.random() * 6) }; // Dummy area ID
    
    const errorDate = new Date(lote.FechaProduccion);
    errorDate.setHours(errorDate.getHours() + Math.floor(Math.random() * 24));
    
    const tiposIrregularidad = ['Calidad', 'Proceso', 'Seguridad', 'Higiene'] as const;
    const descripciones = {
      'Calidad': 'Producto no cumple estándares de calidad',
      'Proceso': 'Error en proceso de producción',
      'Seguridad': 'Incidente de seguridad laboral',
      'Higiene': 'Falta de cumplimiento de normas de higiene'
    };
    
    const tipo = tiposIrregularidad[Math.floor(Math.random() * tiposIrregularidad.length)];
    
    irregularidades.push({
      IrregularidadID: i + 1,
      LoteID: lote.LoteID,
      AreaID: area.AreaID,
      FechaError: errorDate.toISOString().split('T')[0],
      TipoIrregularidad: tipo,
      Descripcion: descripciones[tipo]
    });
  }
  
  return irregularidades;
};

// Dashboard data generators based on DER requirements

// 1. Producción de Lotes por Producto y Trimestre
export const generateProductionByTypeQuarter = (): ProductionByTypeQuarter[] => {
  const lotes = generateMockLotes();
  const data: ProductionByTypeQuarter[] = [];

  // Derivar trimestres (solo no descartados)
  const trimestresSet = new Set<string>();
  for (const l of lotes) {
    if (l.EstadoLote === "Descartado") continue;
    const d = new Date(l.FechaProduccion);
    const q = Math.floor(d.getMonth() / 3) + 1;
    const y = d.getFullYear();
    trimestresSet.add(`Q${q} ${y}`);
  }
  const trimestres = Array.from(trimestresSet).sort();

  // Agregar (producto, trimestre)
  for (const tipo of MOCK_TIPOS_PRODUCTO) {
    for (const t of trimestres) {
      const [qStr, yStr] = t.split(" ");
      const qTarget = Number(qStr.slice(1));
      const yTarget = Number(yStr);

      const quarterLotes = lotes.filter(l => {
        if (l.EstadoLote === "Descartado") return false;
        if (l.TipoProductoID !== tipo.TipoProductoID) return false;
        const d = new Date(l.FechaProduccion);
        const q = Math.floor(d.getMonth() / 3) + 1;
        const y = d.getFullYear();
        return q === qTarget && y === yTarget;
      });

      data.push({
        TipoProducto: tipo.Nombre,
        Trimestre: t,
        CantidadLotes: quarterLotes.length,
        CantidadTotal: quarterLotes.reduce((s, l) => s + l.Cantidad, 0),
      });
    }
  }

  return data;
};


// 4. Irregularidades por Área y Producto
export const generateIrregularityByAreaProduct = (): IrregularityByAreaProduct[] => {
  const irregularidades = generateMockIrregularidades();
  const lotes = generateMockLotes();
  const data: IrregularityByAreaProduct[] = [];
  
  const MOCK_AREAS_DUMMY: { AreaID: number; Nombre: string }[] = [
    { AreaID: 1, Nombre: 'Preparacion' },
    { AreaID: 2, Nombre: 'Procesamiento' },
    { AreaID: 3, Nombre: 'Elaboración' },
    { AreaID: 4, Nombre: 'Envasado' },
    { AreaID: 5, Nombre: 'Etiquetado' },
    { AreaID: 6, Nombre: 'Control Calidad' },
    { AreaID: 7, Nombre: 'Comun' }
  ];
  MOCK_AREAS_DUMMY.forEach(area => {
    MOCK_TIPOS_PRODUCTO.forEach(tipo => {
      const areaIrregularidades = irregularidades.filter(irreg => {
        const lote = lotes.find(l => l.LoteID === irreg.LoteID);
        return irreg.AreaID === area.AreaID && lote?.TipoProductoID === tipo.TipoProductoID;
      });
      
      if (areaIrregularidades.length > 0) {
        data.push({
          Area: area.Nombre,
          TipoProducto: tipo.Nombre,
          CantidadIrregularidades: areaIrregularidades.length
        });
      }
    });
  });
  
  return data;
};

export function sumIrregularidadesPorArea(rows: IrregularityByAreaProduct[]) {
  const map = new Map<string, number>();

  rows.forEach(r => {
    map.set(r.Area, (map.get(r.Area) ?? 0) + r.CantidadIrregularidades);
  });

  return Array.from(map, ([Area, CantidadIrregularidades]) => ({
    Area,
    CantidadIrregularidades,
  }));
}

export function sumIrregularidadesPorProducto(rows: IrregularityByAreaProduct[]) {
  const map = new Map<string, number>();

  rows.forEach(r => {
    map.set(r.TipoProducto, (map.get(r.TipoProducto) ?? 0) + r.CantidadIrregularidades);
  });

  return Array.from(map, ([TipoProducto, CantidadIrregularidades]) => ({
    TipoProducto,
    CantidadIrregularidades,
  }));
}

// 5. Porcentaje de Desperdicio por Producto
export const generateWastePercentageByProduct = (): WastePercentageByProduct[] => {
  const lotes = generateMockLotes();
  
  return MOCK_TIPOS_PRODUCTO.map(tipo => {
    const tipoLotes = lotes.filter(lote => lote.TipoProductoID === tipo.TipoProductoID);
    const totalProducido = tipoLotes.reduce((sum, lote) => sum + lote.Cantidad, 0);
    const totalDescartado = tipoLotes
      .filter(lote => lote.EstadoLote === 'Descartado')
      .reduce((sum, lote) => sum + lote.Cantidad, 0);
    
    return {
      TipoProducto: tipo.Nombre,
      TotalProducido: totalProducido,
      TotalDescartado: totalDescartado,
      PorcentajeDesperdicio: totalProducido > 0 ? Number(((totalDescartado / totalProducido) * 100).toFixed(2)) : 0
    };
  });
};

// Generate production data for dashboard charts
export interface ProductionData {
  date: string;
  production: number;
  waste: number;
  efficiency: number;
  accessCount: number;
}

export const generateMockProductionData = (): ProductionData[] => {
  const data: ProductionData[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const production = 850 + Math.floor(Math.random() * 300); // 850-1150 kg
    const waste = Math.floor(production * (0.02 + Math.random() * 0.08)); // 2-10% waste
    const efficiency = Math.round(((production - waste) / production) * 100);
    const accessCount = 15 + Math.floor(Math.random() * 25); // 15-40 accesses
    
    data.push({
      date: date.toISOString().split('T')[0],
      production,
      waste,
      efficiency,
      accessCount
    });
  }
  
  return data;
};