import api from './axios';

export interface EstadoEstudiante {
  id: number;
  nombre: string;
}

export const obtenerEstadosEstudiante = async (): Promise<EstadoEstudiante[]> => {
  const response = await api.get('/estados-estudiante/');
  return response.data;
};
