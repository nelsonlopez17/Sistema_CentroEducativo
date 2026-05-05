import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerCursos, crearCurso, eliminarCurso } from '../api/cursos';

export const useCursos = () => {
  const queryClient = useQueryClient();

  const cursosQuery = useQuery({
    queryKey: ['cursos'],
    queryFn: obtenerCursos,
  });

  const crearMutation = useMutation({
    mutationFn: (data: { nombre: string; descripcion?: string }) => 
      crearCurso(data.nombre, data.descripcion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarCurso(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cursos'] });
    },
  });

  return {
    cursos: cursosQuery.data || [],
    isLoading: cursosQuery.isLoading,
    error: cursosQuery.error,
    crearCurso: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    eliminarCurso: eliminarMutation.mutateAsync,
  };
};
