import { useQuery } from '@tanstack/react-query';
import { obtenerEstadosEstudiante } from '../api/estadosEstudiante';

export const useEstadosEstudiante = () => {
  const estadosQuery = useQuery({
    queryKey: ['estados-estudiante'],
    queryFn: obtenerEstadosEstudiante,
  });

  return {
    estados: estadosQuery.data || [],
    isLoading: estadosQuery.isLoading,
    isError: estadosQuery.isError,
    error: estadosQuery.error,
  };
};
