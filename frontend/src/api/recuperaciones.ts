import api from './axios';

export interface Recuperacion {
  id: number;
  inscripcion: number;
  asignacion: number;
  nota_recuperacion: string;
  aprobado: boolean;
  fecha_examen: string;
  alumno_nombre: string;
  alumno_apellido: string;
  curso_nombre: string;
}

export const obtenerRecuperaciones = async (): Promise<Recuperacion[]> => {
  const response = await api.get('/recuperaciones/');
  return response.data;
};

export const crearRecuperacion = async (datos: {
  inscripcion: number;
  asignacion: number;
  nota_recuperacion: number;
  aprobado: boolean;
  fecha_examen: string;
}): Promise<Recuperacion> => {
  const response = await api.post('/recuperaciones/', datos);
  return response.data;
};

export const eliminarRecuperacion = async (id: number): Promise<void> => {
  await api.delete(`/recuperaciones/${id}/`);
};
