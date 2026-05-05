import api from './axios';

export interface Grado {
  id: number;
  nombre: string;
}

export const obtenerGrados = async (): Promise<Grado[]> => {
  const response = await api.get('/grados/');
  return response.data;
};

export const crearGrado = async (nombre: string): Promise<Grado> => {
  const response = await api.post('/grados/', { nombre });
  return response.data;
};

export const eliminarGrado = async (id: number): Promise<void> => {
  await api.delete(`/grados/${id}/`);
};
