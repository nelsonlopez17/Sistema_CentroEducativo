import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  obtenerCiclos,
  crearCiclo,
  eliminarCiclo,
  crearUnidad,
  eliminarUnidad,
} from '../api/ciclos';
import type { CicloEscolar, Unidad } from '../api/ciclos';

export const useCiclos = () => {
  const queryClient = useQueryClient();

  const ciclosQuery = useQuery({
    queryKey: ['ciclos'],
    queryFn: obtenerCiclos,
  });

  const crearCicloMutation = useMutation({
    mutationFn: (datos: Omit<CicloEscolar, 'id' | 'unidades' | 'unidades_count'>) => crearCiclo(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
    },
  });

  const eliminarCicloMutation = useMutation({
    mutationFn: (id: number) => eliminarCiclo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
    },
  });

  const crearUnidadMutation = useMutation({
    mutationFn: (datos: Omit<Unidad, 'id'>) => crearUnidad(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
    },
  });

  const eliminarUnidadMutation = useMutation({
    mutationFn: (id: number) => eliminarUnidad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ciclos'] });
    },
  });

  return {
    ciclos: ciclosQuery.data || [],
    isLoading: ciclosQuery.isLoading,
    isError: ciclosQuery.isError,
    crearCiclo: crearCicloMutation.mutateAsync,
    isCreatingCiclo: crearCicloMutation.isPending,
    eliminarCiclo: eliminarCicloMutation.mutateAsync,
    crearUnidad: crearUnidadMutation.mutateAsync,
    isCreatingUnidad: crearUnidadMutation.isPending,
    eliminarUnidad: eliminarUnidadMutation.mutateAsync,
  };
};
