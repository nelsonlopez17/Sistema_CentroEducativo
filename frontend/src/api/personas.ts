import api from './axios';
import type { Persona } from './docentes';

export const obtenerPersonas = async (): Promise<Persona[]> => {
  const response = await api.get('/personas/');
  return response.data;
};

export const crearPersona = async (datos: Omit<Persona, 'id'>): Promise<Persona> => {
  const response = await api.post('/personas/', datos);
  return response.data;
};
