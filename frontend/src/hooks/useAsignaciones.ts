import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerAsignaciones, crearAsignacion, eliminarAsignacion } from '../api/asignaciones';

export const useAsignaciones = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['asignaciones'],
    queryFn: obtenerAsignaciones,
  });

  const crearMutation = useMutation({
    mutationFn: (datos: { pensum: number; docente: number; grado_seccion: number }) =>
      crearAsignacion(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarAsignacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
    },
  });

  return {
    asignaciones: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    crearAsignacion: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    eliminarAsignacion: eliminarMutation.mutateAsync,
  };
};
