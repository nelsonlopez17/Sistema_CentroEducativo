import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerPensum, crearPensum, eliminarPensum } from '../api/pensum';

export const usePensum = () => {
  const queryClient = useQueryClient();

  const pensumQuery = useQuery({
    queryKey: ['pensum'],
    queryFn: obtenerPensum,
  });

  const crearMutation = useMutation({
    mutationFn: (data: { grado: number; curso: number }) => 
      crearPensum(data.grado, data.curso),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pensum'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarPensum(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pensum'] });
    },
  });

  return {
    pensumGeneral: pensumQuery.data || [],
    isLoading: pensumQuery.isLoading,
    error: pensumQuery.error,
    crearPensum: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    eliminarPensum: eliminarMutation.mutateAsync,
  };
};
