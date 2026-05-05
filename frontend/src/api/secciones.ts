import api from './axios';

export interface Seccion {
  id: number;
  nombre: string;
}

export const obtenerSecciones = async (): Promise<Seccion[]> => {
  const response = await api.get('/secciones/');
  return response.data;
};

export const crearSeccion = async (nombre: string): Promise<Seccion> => {
  const response = await api.post('/secciones/', { nombre });
  return response.data;
};

export const eliminarSeccion = async (id: number): Promise<void> => {
  await api.delete(`/secciones/${id}/`);
};
