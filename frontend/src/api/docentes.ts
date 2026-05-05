import api from './axios';

export interface Persona {
  id: number;
  nombres: string;
  apellidos: string;
  cui: string;
  fecha_nacimiento: string;
  direccion?: string;
}

export interface Docente {
  id: number;
  persona: Persona;
}

export const obtenerDocentes = async (): Promise<Docente[]> => {
  const response = await api.get('/docentes/');
  return response.data;
};

export const crearDocente = async (persona_id: number): Promise<Docente> => {
  const response = await api.post('/docentes/', { persona_id });
  return response.data;
};

export const eliminarDocente = async (id: number): Promise<void> => {
  await api.delete(`/docentes/${id}/`);
};
