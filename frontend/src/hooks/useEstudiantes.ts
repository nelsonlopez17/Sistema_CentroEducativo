import { useState, useEffect } from 'react';
import api from '../api/axios';

interface Persona {
  id: number;
  nombres: string;
  apellidos: string;
  cui: string;
  fecha_nacimiento: string;
  direccion?: string;
}

interface Estudiante {
  id: number;
  persona: Persona;
  estado_nombre: string;
  [key: string]: any;
}

interface UseEstudiantesReturn {
  estudiantes: Estudiante[];
  loading: boolean;
  error: string;
  obtenerEstudiantes: () => Promise<void>;
}

export const useEstudiantes = (): UseEstudiantesReturn => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const obtenerEstudiantes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('estudiantes/');
      console.log('Respuesta del API (estudiantes):', response.data);

      // Obtener datos completos de cada estudiante
      const estudiantesConDatos = await Promise.all(
        response.data.map(async (estudiante: any) => {
          let estudianteCompleto = { ...estudiante };

          // Obtener datos completos de la persona si es un ID
          if (typeof estudiante.persona === 'number') {
            try {
              const personaResponse = await api.get(`personas/${estudiante.persona}/`);
              estudianteCompleto.persona = personaResponse.data;
            } catch (err) {
              console.error(`Error obteniendo persona ${estudiante.persona}:`, err);
            }
          }

          return estudianteCompleto;
        })
      );

      console.log('Estudiantes con datos completos:', estudiantesConDatos);
      setEstudiantes(estudiantesConDatos);
    } catch (err) {
      console.error('Error al obtener estudiantes:', err);
      setError('Error al cargar los estudiantes. Por favor, intenta de nuevo.');
      setEstudiantes([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estudiantes al montar el componente
  useEffect(() => {
    obtenerEstudiantes();
  }, []);

  return {
    estudiantes,
    loading,
    error,
    obtenerEstudiantes,
  };
};
