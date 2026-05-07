import React, { useState } from 'react';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import type { Estudiante } from '../../api/estudiantes';
import FormularioAlumnoModal from './FormularioAlumnoModal';
import ExpedienteAlumnoModal from './ExpedienteAlumnoModal';
import './gestion_alumnos.css';

const GestionAlumnos: React.FC = () => {
  const { estudiantes, isLoading, isError, error, eliminarEstudiante } = useEstudiantes();
  const [modalOpen, setModalOpen] = useState(false);
  const [expedienteOpen, setExpedienteOpen] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar a este estudiante del registro? (Se realizará un borrado lógico)')) {
      try {
        await eliminarEstudiante(id);
      } catch (err) {
        console.error('Error eliminando estudiante:', err);
        alert('No se pudo eliminar el registro. Verifique si tiene datos vinculados.');
      }
    }
  };

  const handleVerExpediente = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setExpedienteOpen(true);
  };

  const totalActivos = estudiantes.filter(e => e.estado_nombre === 'Activo').length;

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-text">
          <h1>Gestión de Estudiantes</h1>
          <p>Registro y control académico de alumnos inscritos.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <span className="icon">+</span> Nuevo Estudiante
        </button>
      </div>

      <div className="module-stats">
        <div className="stat-card">
          <span className="stat-label">Total Estudiantes</span>
          <span className="stat-value">{estudiantes.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Activos</span>
          <span className="stat-value">{totalActivos}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Cargando registro de alumnos...</p>
        </div>
      ) : isError ? (
        <div className="error-card">
          <span className="error-icon">⚠️</span>
          <p>Error al cargar los alumnos: {error instanceof Error ? error.message : 'Error desconocido'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>CUI</th>
                <th>Nombre Completo</th>
                <th>Fecha de Nacimiento</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center empty-row">
                    No hay alumnos registrados en el sistema.
                  </td>
                </tr>
              ) : (
                estudiantes.map((estudiante: Estudiante) => (
                  <tr key={estudiante.id}>
                    <td className="font-mono">{estudiante.persona.cui}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                          {estudiante.persona.nombres.charAt(0)}
                        </div>
                        <div className="user-details">
                          <span className="user-name-cell">{estudiante.persona.nombres} {estudiante.persona.apellidos}</span>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(estudiante.persona.fecha_nacimiento).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${estudiante.estado_nombre === 'Activo' ? 'badge-success' : 'badge-warning'}`}>
                        {estudiante.estado_nombre}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-icon-action edit" 
                        title="Ver Expediente"
                        onClick={() => handleVerExpediente(estudiante)}
                      >
                        📄
                      </button>
                      <button 
                        className="btn-icon-action delete" 
                        onClick={() => handleDelete(estudiante.id)}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <FormularioAlumnoModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />

      <ExpedienteAlumnoModal
        isOpen={expedienteOpen}
        onClose={() => {
          setExpedienteOpen(false);
          setSelectedEstudiante(null);
        }}
        estudiante={selectedEstudiante}
      />
    </div>
  );
};

export default GestionAlumnos;