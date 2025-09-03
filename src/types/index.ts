export interface Empleado {
  EmpleadoID: number;
  Nombre: string;
  Apellido: string;
  DNI: string;
  FechaNacimiento: string;
  Email: string;
  Rol: string;
  EstadoEmpleado: 'Activo' | 'Inactivo' | 'Suspendido';
  AreaID: number | string;
  FechaRegistro: string;
}

export interface Turno {
  TurnoID: number;
  Nombre: 'Mañana' | 'Tarde' | 'Noche';
  HoraInicio: string;
  HoraFin: string;
  EstadoTurno: 'Activo' | 'Inactivo';
}

export interface AreaTrabajo {
  AreaID: string;  // Changed from number to string to match API response format (e.g., 'AREA001')
  Nombre: string;
  Descripcion: string;
  Estado: 'Activo' | 'Inactivo';
}

export interface EmpleadoTurno {
  EmpleadoTurnoID: number;
  EmpleadoID: number;
  TurnoID: number;
  FechaAsignacion: string;
  FechaFinAsignacion?: string;
}

export interface Acceso {
  AccesoID: number;
  EmpleadoID: number | null;
  AreaID: string;  
  FechaHora: string;
  TipoAcceso: 'Ingreso' | 'Egreso';
  MetodoAcceso: 'Facial' | 'PIN' | 'Manual';
  DispositivoAcceso: string;
  ConfianzaReconocimiento: number | null;
  AccesoPermitido: boolean;
  Nombre: string | null;
  Apellido: string | null;
  DNI?: string;
  Rol?: string;
  Area?: string;
}

export const getAreaName = (areaId: string): string => {
  const areaMap: { [key: string]: string } = {
    'AREA001': 'Preparación',
    'AREA002': 'Procesamiento',
    'AREA003': 'Elaboración',
    'AREA004': 'Envasado',
    'AREA005': 'Etiquetado',
    'AREA006': 'Control Calidad',
    'AREA007': 'Administración',
    'AREA008': 'Común',
    'AREA009': 'Logística'
  };
  return areaMap[areaId] || areaId; // Return the ID if no mapping found
};

export interface DispositivoAcceso {
  DispositivoID: number;
  Nombre: string;
  Ubicacion: string;
  AreaID: number;
  TipoDispositivo: 'Facial' | 'PIN' | 'Completo';
  EstadoDispositivo: 'Activo' | 'Mantenimiento' | 'Inactivo';
  FechaInstalacion: string;
}

export interface TipoProducto {
  TipoProductoID: number;
  Nombre: string;
  Categoria: 'Pasta_Fresca' | 'Pasta_Seca' | 'Rellenos' | 'Salsas';
  DiasVidaUtil: number;
  CondicionesAlmacenamiento: string;
  TemperaturaAlmacenamiento: number;
  NormativaAplicable: string;
  Observaciones?: string;
}

export interface Lote {
  LoteID: number;
  CodigoLote: string;
  TipoProductoID: number;
  Cantidad: number;
  EstadoLote: 'En_Produccion' | 'Terminado' | 'Control_Calidad' | 'Despachado' | 'Descartado';
  FechaVencimiento: string;
  FechaProduccion: string;
  Observaciones?: string;
}

export interface Irregularidad {
  IrregularidadID: number;
  LoteID: number;
  AreaID: number;
  FechaError: string;
  TipoIrregularidad: 'Calidad' | 'Proceso' | 'Seguridad' | 'Higiene';
  Descripcion: string;
}

// Dashboard specific types
export interface ProductionByTypeQuarter {
  TipoProducto: string;
  Trimestre: string;
  CantidadLotes: number;
  CantidadTotal: number;
}

export interface ProductionByHour {
  Mes: string;
  LotesPorHora: number;
  HorasTrabajadasTotal: number;
}

export interface WorkHoursByArea {
  Area: string;
  HorasTrabajadasTotal: number;
  EmpleadosActivos: number;
}

export interface IrregularityByAreaProduct {
  Area: string;
  TipoProducto: string;
  CantidadIrregularidades: number;
}

export interface WastePercentageByProduct {
  TipoProducto: string;
  TotalProducido: number;
  TotalDescartado: number;
  PorcentajeDesperdicio: number;
}
