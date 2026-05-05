import api from './axios';

export interface Asignacion {
  id: number;
  pensum: number;
  docente: number;
  grado_seccion: number;
  docente_nombre: string;
  docente_apellido: string;
  curso_nombre: string;
  grado_seccion_str: string;
}

export const obtenerAsignaciones = async (): Promise<Asignacion[]> => {
  const response = await api.get('/asignaciones/');
  return response.data;
};

export const crearAsignacion = async (datos: {
  pensum: number;
  docente: number;
  grado_seccion: number;
}): Promise<Asignacion> => {
  const response = await api.post('/asignaciones/', datos);
  return response.data;
};

export const eliminarAsignacion = async (id: number): Promise<void> => {
  await api.delete(`/asignaciones/${id}/`);
};
