import axios from 'axios';

// Set the base URL based on the environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pyme-backend-production.up.railway.app';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  // Add this to handle CORS credentials
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Request interceptor
api.interceptors.request.use(config => {
  // Add any request headers here if needed
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

export interface AccessRequest {
  file?: File;
  tipo_acceso: 'Ingreso' | 'Egreso';
  area_id: string;  // Changed from number to string to match API format (e.g., 'AREA001')
  pin?: string;
  dispositivo?: string;
  observaciones?: string;
}

export interface AccessResponse {
  message: string;
  empleado?: {
    id: number;
    nombre: string;
    apellido: string;
    rol: string;
  };
  area_id: string;  // Changed from number to string to match API format (e.g., 'AREA001')
  tipo_acceso: 'Ingreso' | 'Egreso';
  metodo_acceso?: 'Facial' | 'PIN';
  confianza?: number;
  acceso_permitido: boolean;
}

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

export const getEmpleados = async () => {
  const response = await api.get('/empleados');
  return response.data;
};

export const getAreas = async () => {
  const response = await api.get('/areas');
  return response.data;
};

export const getEmpleado = async (id: number) => {
  const response = await api.get(`/empleados/${id}`);
  return response.data;
};

export const getAccesos = async (params?: {
  empleado_id?: number;
  area_id?: number;
  tipo_acceso?: 'Ingreso' | 'Egreso';
  fecha_inicio?: string;
  fecha_fin?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await api.get('/accesos', { params });
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
