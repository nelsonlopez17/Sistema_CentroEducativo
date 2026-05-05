import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { obtenerPersonas, crearPersona } from '../api/personas';
import type { Persona } from '../api/docentes';

export const usePersonas = () => {
  const queryClient = useQueryClient();

  const personasQuery = useQuery({
    queryKey: ['personas'],
    queryFn: obtenerPersonas,
  });

  const crearMutation = useMutation({
    mutationFn: (datos: Omit<Persona, 'id'>) => crearPersona(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
    },
  });

  return {
    personas: personasQuery.data || [],
    isLoading: personasQuery.isLoading,
    isError: personasQuery.isError,
    error: personasQuery.error,
    crearPersona: crearMutation.mutateAsync,
    isCreatingPersona: crearMutation.isPending,
  };
};
