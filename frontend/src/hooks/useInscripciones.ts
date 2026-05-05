import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerInscripciones, crearInscripcion, eliminarInscripcion } from '../api/inscripciones';

export const useInscripciones = () => {
  const queryClient = useQueryClient();

  const inscripcionesQuery = useQuery({
    queryKey: ['inscripciones'],
    queryFn: obtenerInscripciones,
  });

  const crearMutation = useMutation({
    mutationFn: (datos: { estudiante: number; grado_seccion: number }) => crearInscripcion(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarInscripcion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inscripciones'] });
    },
  });

  return {
    inscripciones: inscripcionesQuery.data || [],
    isLoading: inscripcionesQuery.isLoading,
    isError: inscripcionesQuery.isError,
    crearInscripcion: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    eliminarInscripcion: eliminarMutation.mutateAsync,
    isDeleting: eliminarMutation.isPending,
  };
};
