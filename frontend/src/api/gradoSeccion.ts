import api from './axios';

export interface GradoSeccion {
  id: number;
  grado: number;
  seccion: number;
  ciclo: number;
  grado_nombre: string;
  seccion_nombre: string;
  ciclo_anio: number;
}

export const obtenerGradoSeccion = async (): Promise<GradoSeccion[]> => {
  const response = await api.get('/grado-seccion/');
  return response.data;
};

export const crearGradoSeccion = async (grado: number, seccion: number, ciclo: number): Promise<GradoSeccion> => {
  const response = await api.post('/grado-seccion/', { grado, seccion, ciclo });
  return response.data;
};

export const eliminarGradoSeccion = async (id: number): Promise<void> => {
  await api.delete(`/grado-seccion/${id}/`);
};
