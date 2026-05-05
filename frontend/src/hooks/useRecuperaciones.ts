import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerRecuperaciones, crearRecuperacion, eliminarRecuperacion } from '../api/recuperaciones';

export const useRecuperaciones = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['recuperaciones'],
    queryFn: obtenerRecuperaciones,
  });

  const crearMutation = useMutation({
    mutationFn: crearRecuperacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recuperaciones'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarRecuperacion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recuperaciones'] });
    },
  });

  return {
    recuperaciones: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    crearRecuperacion: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    eliminarRecuperacion: eliminarMutation.mutateAsync,
  };
};
