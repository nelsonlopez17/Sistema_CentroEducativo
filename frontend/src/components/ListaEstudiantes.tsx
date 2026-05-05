import React from 'react';
import { useEstudiantes } from '../hooks/useEstudiantes';
import '../pages/Alumnos/gestion_alumnos.css';

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

interface ListaEstudiantesProps {
  mostrandoEstudiantes?: boolean;
}

export const ListaEstudiantes: React.FC<ListaEstudiantesProps> = ({ mostrandoEstudiantes = true }) => {
  const { estudiantes, loading, error } = useEstudiantes();

  if (!mostrandoEstudiantes) {
    return null;
  }

  if (loading) {
    return <div className="loading-message">Cargando alumnos...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="alumnos-table-container">
      {estudiantes.length > 0 ? (
        <table className="alumnos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>CUI</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {estudiantes.map((est: Estudiante) => (
              <tr key={est.id}>
                <td>{est.id}</td>
                <td>{est.persona?.nombres || '-'}</td>
                <td>{est.persona?.apellidos || '-'}</td>
                <td>{est.persona?.cui || '-'}</td>
                <td>{est.estado_nombre || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-estudiantes">No hay estudiantes registrados.</p>
      )}
    </div>
  );
};
