import api from './axios';

export interface RegistroAuditoria {
  id: number;
  tabla: string;
  operacion: string;
  id_registro: number;
  datos_anteriores: Record<string, unknown> | null;
  datos_nuevos: Record<string, unknown> | null;
  usuario: number | null;
  ip_cliente: string | null;
  fecha_hora: string;
}

export const obtenerAuditoria = async (): Promise<RegistroAuditoria[]> => {
  const response = await api.get('/auditoria/');
  return response.data;
};
