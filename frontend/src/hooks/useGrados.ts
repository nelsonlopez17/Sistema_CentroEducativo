import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerGrados, crearGrado, eliminarGrado } from '../api/grados';

export const useGrados = () => {
  const queryClient = useQueryClient();

  const gradosQuery = useQuery({
    queryKey: ['grados'],
    queryFn: obtenerGrados,
  });

  const crearMutation = useMutation({
    mutationFn: (nombre: string) => crearGrado(nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grados'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarGrado(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grados'] });
    },
  });

  return {
    grados: gradosQuery.data || [],
    isLoading: gradosQuery.isLoading,
    error: gradosQuery.error,
    crearGrado: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    eliminarGrado: eliminarMutation.mutateAsync,
  };
};
