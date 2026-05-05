import api from './axios';
import type { Persona } from './docentes'; // Compartimos la interfaz de Persona

export interface Estudiante {
  id: number;
  persona: Persona;
  estado: number;
  estado_nombre: string;
}

export const obtenerEstudiantes = async (): Promise<Estudiante[]> => {
  const response = await api.get('/estudiantes/');
  return response.data;
};

export const crearEstudiante = async (persona_id: number, estado: number): Promise<Estudiante> => {
  const response = await api.post('/estudiantes/', { persona_id, estado });
  return response.data;
};

export const eliminarEstudiante = async (id: number): Promise<void> => {
  await api.delete(`/estudiantes/${id}/`);
};
