import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerEstudiantes, crearEstudiante, eliminarEstudiante } from '../api/estudiantes';

export const useEstudiantes = () => {
  const queryClient = useQueryClient();

  const estudiantesQuery = useQuery({
    queryKey: ['estudiantes'],
    queryFn: obtenerEstudiantes,
  });

  const crearMutation = useMutation({
    mutationFn: (data: { persona_id: number; estado: number }) => 
      crearEstudiante(data.persona_id, data.estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarEstudiante(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] });
    },
  });

  return {
    estudiantes: estudiantesQuery.data || [],
    isLoading: estudiantesQuery.isLoading,
    isError: estudiantesQuery.isError,
    error: estudiantesQuery.error,
    crearEstudiante: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    eliminarEstudiante: eliminarMutation.mutateAsync,
    isDeleting: eliminarMutation.isPending,
  };
};
