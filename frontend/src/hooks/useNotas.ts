import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerNotas, crearNota, actualizarNota, eliminarNota } from '../api/notas';

export const useNotas = (filtros?: { asignacion?: number }) => {
  const queryClient = useQueryClient();

  const notasQuery = useQuery({
    queryKey: ['notas', filtros],
    queryFn: () => obtenerNotas(filtros),
    enabled: !!filtros?.asignacion,
  });

  const crearMutation = useMutation({
    mutationFn: crearNota,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
    },
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, nota }: { id: number; nota: number }) => actualizarNota(id, { nota }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarNota,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas'] });
    },
  });

  return {
    notas: notasQuery.data || [],
    isLoading: notasQuery.isLoading,
    crearNota: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    actualizarNota: actualizarMutation.mutateAsync,
    eliminarNota: eliminarMutation.mutateAsync,
  };
};
