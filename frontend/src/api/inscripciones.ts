import api from './axios';

export interface Inscripcion {
  id: number;
  estudiante: number;
  grado_seccion: number;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_cui: string;
  grado_seccion_str: string;
}

export const obtenerInscripciones = async (): Promise<Inscripcion[]> => {
  const response = await api.get('/inscripciones/');
  return response.data;
};

export const crearInscripcion = async (datos: { estudiante: number; grado_seccion: number }): Promise<Inscripcion> => {
  const response = await api.post('/inscripciones/', datos);
  return response.data;
};

export const eliminarInscripcion = async (id: number): Promise<void> => {
  await api.delete(`/inscripciones/${id}/`);
};
