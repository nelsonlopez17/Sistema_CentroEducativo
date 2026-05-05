import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerSecciones, crearSeccion, eliminarSeccion } from '../api/secciones';

export const useSecciones = () => {
  const queryClient = useQueryClient();

  const seccionesQuery = useQuery({
    queryKey: ['secciones'],
    queryFn: obtenerSecciones,
  });

  const crearMutation = useMutation({
    mutationFn: (nombre: string) => crearSeccion(nombre),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secciones'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarSeccion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secciones'] });
    },
  });

  return {
    secciones: seccionesQuery.data || [],
    isLoading: seccionesQuery.isLoading,
    error: seccionesQuery.error,
    crearSeccion: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    eliminarSeccion: eliminarMutation.mutateAsync,
  };
};
