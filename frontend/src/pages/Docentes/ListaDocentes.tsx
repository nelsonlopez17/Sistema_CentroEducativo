import React, { useState } from 'react';
import { useDocentes } from '../../hooks/useDocentes';
import FormularioDocenteModal from './FormularioDocenteModal';
import './Docentes.css';

const ListaDocentes: React.FC = () => {
  const { docentes, isLoading, isError, error, eliminarDocente } = useDocentes();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState<any>(null);

  const handleEdit = (docente: any) => {
    setSelectedDocente(docente);
    setModalOpen(true);
  };


  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este docente?')) {
      try {
        await eliminarDocente(id);
      } catch (err) {
        console.error('Error eliminando docente:', err);
      }
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-text">
          <h1>Gestión de Docentes</h1>
          <p>Administra el personal académico del centro educativo.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <span className="icon">+</span> Nuevo Docente
        </button>
      </div>

      <div className="module-stats">
        <div className="stat-card">
          <span className="stat-label">Total Docentes</span>
          <span className="stat-value">{docentes.length}</span>
        </div>
        {/* More stats could go here */}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Cargando información académica...</p>
        </div>
      ) : isError ? (
        <div className="error-card">
          <span className="error-icon">⚠️</span>
          <p>Error al cargar los docentes: {error instanceof Error ? error.message : 'Error desconocido'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Identificación (CUI)</th>
                <th>Nombre Completo</th>
                <th>Fecha de Nacimiento</th>
                <th>Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center empty-row">
                    No hay docentes registrados en el sistema.
                  </td>
                </tr>
              ) : (
                docentes.map((docente) => (
                  <tr key={docente.id}>
                    <td className="font-mono">{docente.persona.cui}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm">
                          {docente.persona.nombres.charAt(0)}
                        </div>
                        <div className="user-details">
                          <span className="user-name-cell">{docente.persona.nombres} {docente.persona.apellidos}</span>
                        </div>
                      </div>
                    </td>
                    <td>{new Date(docente.persona.fecha_nacimiento).toLocaleDateString()}</td>
                    <td><span className="badge badge-success">Activo</span></td>
                    <td className="actions-cell">
                      <button 
                        className="btn-icon-action edit" 
                        title="Editar"
                        onClick={() => handleEdit(docente)}
                      >
                        ✏️
                      </button>

                      <button 
                        className="btn-icon-action delete" 
                        onClick={() => handleDelete(docente.id)}
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

      <FormularioDocenteModal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          setSelectedDocente(null);
        }} 
        docenteAEditar={selectedDocente}
      />

    </div>
  );
};

export default ListaDocentes;

