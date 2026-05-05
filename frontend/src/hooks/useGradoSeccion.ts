import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerGradoSeccion, crearGradoSeccion, eliminarGradoSeccion } from '../api/gradoSeccion';

export const useGradoSeccion = () => {
  const queryClient = useQueryClient();

  const gradoSeccionQuery = useQuery({
    queryKey: ['grado-seccion'],
    queryFn: obtenerGradoSeccion,
  });

  const crearMutation = useMutation({
    mutationFn: (data: { grado: number; seccion: number; ciclo: number }) => 
      crearGradoSeccion(data.grado, data.seccion, data.ciclo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grado-seccion'] });
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => eliminarGradoSeccion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grado-seccion'] });
    },
  });

  return {
    gradosSecciones: gradoSeccionQuery.data || [],
    isLoading: gradoSeccionQuery.isLoading,
    error: gradoSeccionQuery.error,
    crearGradoSeccion: crearMutation.mutateAsync,
    isCreating: crearMutation.isPending,
    eliminarGradoSeccion: eliminarMutation.mutateAsync,
  };
};
