import api from './axios';

export interface Nota {
  id: number;
  inscripcion: number;
  asignacion: number;
  unidad: number;
  nota: string;
  es_mejoramiento: boolean;
  alumno_nombre: string;
  alumno_apellido: string;
  alumno_cui: string;
  curso_nombre: string;
  unidad_nombre: string;
  unidad_numero: number;
}

export const obtenerNotas = async (params?: { asignacion?: number; inscripcion?: number }): Promise<Nota[]> => {
  const response = await api.get('/notas/', { params });
  return response.data;
};

export const crearNota = async (datos: {
  inscripcion: number;
  asignacion: number;
  unidad: number;
  nota: number;
  es_mejoramiento?: boolean;
}): Promise<Nota> => {
  const response = await api.post('/notas/', datos);
  return response.data;
};

export const actualizarNota = async (id: number, datos: { nota: number }): Promise<Nota> => {
  const response = await api.patch(`/notas/${id}/`, datos);
  return response.data;
};

export const eliminarNota = async (id: number): Promise<void> => {
  await api.delete(`/notas/${id}/`);
};
