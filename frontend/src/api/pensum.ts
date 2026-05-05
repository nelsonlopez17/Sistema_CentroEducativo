import api from './axios';

export interface Pensum {
  id: number;
  grado: number;
  curso: number;
  grado_nombre: string;
  curso_nombre: string;
}

export const obtenerPensum = async (): Promise<Pensum[]> => {
  const response = await api.get('/pensum/');
  return response.data;
};

export const crearPensum = async (grado: number, curso: number): Promise<Pensum> => {
  const response = await api.post('/pensum/', { grado, curso });
  return response.data;
};

export const eliminarPensum = async (id: number): Promise<void> => {
  await api.delete(`/pensum/${id}/`);
};
