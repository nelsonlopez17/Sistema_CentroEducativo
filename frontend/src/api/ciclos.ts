import api from './axios';

export interface Unidad {
  id: number;
  nombre: string;
  numero: number;
  fecha_inicio: string;
  fecha_fin: string;
  ciclo: number;
}

export interface CicloEscolar {
  id: number;
  anio: number;
  fecha_inicio: string;
  fecha_fin: string;
  unidades: Unidad[];
  unidades_count: number;
}

// Ciclos
export const obtenerCiclos = async (): Promise<CicloEscolar[]> => {
  const response = await api.get('/ciclos/');
  return response.data;
};

export const crearCiclo = async (datos: Omit<CicloEscolar, 'id' | 'unidades' | 'unidades_count'>): Promise<CicloEscolar> => {
  const response = await api.post('/ciclos/', datos);
  return response.data;
};

export const eliminarCiclo = async (id: number): Promise<void> => {
  await api.delete(`/ciclos/${id}/`);
};

// Unidades
export const crearUnidad = async (datos: Omit<Unidad, 'id'>): Promise<Unidad> => {
  const response = await api.post('/unidades/', datos);
  return response.data;
};

export const eliminarUnidad = async (id: number): Promise<void> => {
  await api.delete(`/unidades/${id}/`);
};
