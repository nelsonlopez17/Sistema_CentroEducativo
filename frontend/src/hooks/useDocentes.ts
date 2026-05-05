import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerDocentes, crearDocente, eliminarDocente } from '../api/docentes';

export const useDocentes = () => {
  const queryClient = useQueryClient();

  // Query para obtener todos los docentes
  const docentesQuery = useQuery({
    queryKey: ['docentes'],
    queryFn: obtenerDocentes,
  });

  // Mutación para crear un docente
  const crearMutation = useMutation({
    mutationFn: (persona_id: number) => crearDocente(persona_id),
    onSuccess: () => {
      // Invalidar y refetchear
      queryClient.invalidateQueries({ queryKey: ['docentes'] });
    },
  });

  // Mutación para eliminar un docente
  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarDocente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['docentes'] });
    },
  });

  return {
    docentes: docentesQuery.data || [],
    isLoading: docentesQuery.isLoading,
    isError: docentesQuery.isError,
    error: docentesQuery.error,
    crearDocente: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    eliminarDocente: eliminarMutation.mutateAsync,
    isDeleting: eliminarMutation.isPending,
  };
};
