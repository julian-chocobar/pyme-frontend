// Base types
export type EstadoType = 'activo' | 'inactivo' | 'suspendido';
export type TipoAcceso = 'Ingreso' | 'Egreso';
export type MetodoAcceso = 'Facial' | 'PIN' | 'Manual' | string;

// Pagination
export interface PaginationMetadata {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_previous: boolean;
  has_next: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

// Employee types
export interface Empleado {
  EmpleadoID: number;
  Nombre: string;
  Apellido: string;
  DNI: string;
  FechaNacimiento: string;
  Email: string;
  Rol: string;
  Estado: EstadoType;
  AreaID: string;
  FechaRegistro: string;
}

export interface Turno {
  TurnoID: number;
  Nombre: 'Mañana' | 'Tarde' | 'Noche';
  HoraInicio: string;
  HoraFin: string;
  EstadoTurno: EstadoType;
}

export interface AreaTrabajo {
  AreaID: string;
  Nombre: string;
  Descripcion: string;
  Estado: EstadoType;
}

export interface EmpleadoTurno {
  EmpleadoTurnoID: number;
  EmpleadoID: number;
  TurnoID: number;
  FechaAsignacion: string;
  FechaFinAsignacion?: string;
}

// Access types
export interface AccessRequest {
  file?: File;
  tipo_acceso: TipoAcceso;
  area_id: string;
  pin?: string;
  dispositivo?: string;
  observaciones?: string;
}

export interface AccessResponse {
  empleado?: {
    id: number;
    nombre: string;
    apellido: string;
    rol: string;
    DNI?: string;
    Email?: string;
  };
  confianza?: number;
  acceso_permitido: boolean;
  mensaje: string;
  area_id?: string;
  tipo_acceso?: string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_previous: boolean;
  has_next: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMetadata;
}

export interface Acceso {
  AccesoID: number;
  EmpleadoID: number | null;
  AreaID: string;
  NombreArea?: string;
  FechaHora: string;
  FechaHoraFormateada?: string;
  TipoAcceso: TipoAcceso | string;
  MetodoAcceso: MetodoAcceso;
  DispositivoAcceso: string;
  ConfianzaReconocimiento?: number;
  AccesoPermitido: boolean | string;
  NombreEmpleado?: string;
  Nombre?: string | null;
  Apellido?: string | null;
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
