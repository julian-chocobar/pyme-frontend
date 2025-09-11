import axios from 'axios';
import { 
  AccessRequest, 
  AccessResponse, 
  Empleado, 
  AreaTrabajo, 
  Acceso, 
  PaginatedResponse, 
  PaginationMetadata 
} from '../types';

// Set the base URL based on the environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  // Removed withCredentials and CSRF headers for better CORS compatibility
  timeout: 30000, // 30 second timeout
});

// Request interceptor
api.interceptors.request.use(config => {
  // Only set Content-Type for non-GET requests and when not already set
  if (config.method !== 'get' && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Re-export types for backward compatibility
export type { AccessRequest, AccessResponse, Empleado, AreaTrabajo, Acceso, PaginatedResponse, PaginationMetadata };

export const createFacialAccess = async (data: Omit<AccessRequest, 'pin'>): Promise<AccessResponse> => {
  const formData = new FormData();
  if (data.file) {
    formData.append('file', data.file);
  }
  formData.append('tipo_acceso', data.tipo_acceso);
  formData.append('area_id', data.area_id.toString());
  formData.append('dispositivo', data.dispositivo || 'Dispositivo1');
  if (data.observaciones) {
    formData.append('observaciones', data.observaciones);
  }

  const response = await api.post('/accesos/crear', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const createPinAccess = async (data: Omit<AccessRequest, 'file'>): Promise<AccessResponse> => {
  const formData = new FormData();
  
  // Log the data being sent
  console.log('Sending PIN access request with data:', {
    pin: data.pin,
    tipo_acceso: data.tipo_acceso,
    area_id: data.area_id,
    dispositivo: data.dispositivo || 'Dispositivo1',
    observaciones: data.observaciones
  });
  
  if (data.pin) {
    formData.append('pin', data.pin);
  } else {
    throw new Error('PIN is required');
  }
  
  formData.append('tipo_acceso', data.tipo_acceso);
  formData.append('area_id', data.area_id.toString());
  formData.append('dispositivo', data.dispositivo || 'Dispositivo1');
  
  if (data.observaciones) {
    formData.append('observaciones', data.observaciones);
  }

  try {
    const response = await api.post('/accesos/crear_pin', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error in createPinAccess:', {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
      },
    });
    throw error;
  }
};

// All types are now imported from '../types'

export const getEmpleados = async (page: number = 1, pageSize: number = 10, search: string = ''): Promise<PaginatedResponse<Empleado>> => {
  const response = await api.get<PaginatedResponse<Empleado>>('/empleados', {
    params: {
      page,
      page_size: pageSize,
      nombre: search || undefined,
    },
  });
  return response.data;
};

export const getAreas = async (): Promise<AreaTrabajo[]> => {
  const response = await api.get('/areas');
  return response.data;
};

export const getEmpleado = async (id: number): Promise<Empleado> => {
  const response = await api.get(`/empleados/${id}`);
  return response.data;
};

export const createEmpleado = async (empleadoData: Omit<Empleado, 'EmpleadoID' | 'FechaRegistro'>): Promise<{message: string, EmpleadoID: number}> => {
  const response = await api.post('/empleados/crear', empleadoData);
  return response.data;
};

export const deleteEmpleado = async (id: number): Promise<{message: string, empleado_eliminado: Empleado}> => {
  const response = await api.delete(`/empleados/${id}`);
  return response.data;
};

export const registrarRostro = async (empleadoId: number, file: File | FormData): Promise<{message: string}> => {
  const formData = file instanceof FormData ? file : new FormData();
  
  if (!(file instanceof FormData)) {
    formData.append('file', file);
  }
  
  const response = await api.post(
    `/empleados/${empleadoId}/registrar_rostro`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
};

// Acceso type is now imported from '../types'

export const getAccesos = async ({
  page = 1,
  pageSize = 10,
  empleado_id,
  area_id,
  tipo_acceso,
  fecha_inicio,
  fecha_fin,
}: {
  page?: number;
  pageSize?: number;
  empleado_id?: number;
  area_id?: string;
  tipo_acceso?: 'Ingreso' | 'Egreso';
  fecha_inicio?: string;
  fecha_fin?: string;
} = {}): Promise<PaginatedResponse<Acceso>> => {
  const response = await api.get<PaginatedResponse<Acceso>>('/accesos', {
    params: {
      page,
      page_size: pageSize,
      empleado_id,
      area_id,
      tipo_acceso,
      fecha_inicio,
      fecha_fin,
    },
  });
  return response.data;
};

export const registerFace = async (empleadoId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/empleados/${empleadoId}/registrar_rostro`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
