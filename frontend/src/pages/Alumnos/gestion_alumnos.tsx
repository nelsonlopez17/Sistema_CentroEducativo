import React, { useState } from 'react';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import type { Estudiante } from '../../api/estudiantes';
import FormularioAlumnoModal from './FormularioAlumnoModal';
import './gestion_alumnos.css';

const GestionAlumnos: React.FC = () => {
  const { estudiantes, isLoading, isError, error, eliminarEstudiante } = useEstudiantes();
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar a este estudiante del registro?')) {
      try {
        await eliminarEstudiante(id);
      } catch (err) {
        console.error('Error eliminando estudiante:', err);
        alert('Ocurrió un error al intentar eliminar el estudiante.');
      }
    }
  };

  return (
    <div className="alumnos-container">
      <div className="alumnos-header">
        <h2>Gestión de Alumnos</h2>
        <button className="btn-nuevo-alumno" onClick={() => setModalOpen(true)}>
          + Nuevo Alumno
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">Cargando alumnos...</div>
      ) : isError ? (
        <div className="error-state">
          Error al cargar los alumnos: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      ) : estudiantes.length === 0 ? (
        <div className="empty-state">No hay alumnos registrados en el sistema.</div>
      ) : (
        <div className="table-container">
          <table className="alumnos-table">
            <thead>
              <tr>
                <th>CUI</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Fecha Nacimiento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((estudiante: Estudiante) => (
                <tr key={estudiante.id}>
                  <td>{estudiante.persona.cui}</td>
                  <td>{estudiante.persona.nombres}</td>
                  <td>{estudiante.persona.apellidos}</td>
                  <td>{estudiante.persona.fecha_nacimiento}</td>
                  <td>
                    <span className={`estado-badge estado-${estudiante.estado_nombre.toLowerCase().replace(' ', '-')}`}>
                      {estudiante.estado_nombre}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button 
                      className="btn-eliminar"
                      onClick={() => handleDelete(estudiante.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormularioAlumnoModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
};

export default GestionAlumnos;