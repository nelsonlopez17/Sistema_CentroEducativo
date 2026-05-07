import api from './axios';

export interface Curso {
  id: number;
  nombre: string;
  descripcion?: string;
}

export const obtenerCursos = async (): Promise<Curso[]> => {
  const response = await api.get('/cursos/');
  return response.data;
};

export const crearCurso = async (datos: { nombre: string; descripcion?: string }): Promise<Curso> => {
  const response = await api.post('/cursos/', datos);
  return response.data;
};


export const eliminarCurso = async (id: number): Promise<void> => {
  await api.delete(`/cursos/${id}/`);
};
