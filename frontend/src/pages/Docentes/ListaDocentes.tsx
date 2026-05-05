import React, { useState } from 'react';
import { useDocentes } from '../../hooks/useDocentes';
import FormularioDocenteModal from './FormularioDocenteModal';
import './Docentes.css';

const ListaDocentes: React.FC = () => {
  const { docentes, isLoading, isError, error, eliminarDocente } = useDocentes();
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de eliminar este docente?')) {
      try {
        await eliminarDocente(id);
      } catch (err) {
        console.error('Error eliminando docente:', err);
        alert('Ocurrió un error al intentar eliminar el docente.');
      }
    }
  };

  return (
    <div className="docentes-container">
      <div className="docentes-header">
        <h2>Listado de Docentes</h2>
        <button className="btn-nuevo-docente" onClick={() => setModalOpen(true)}>
          + Nuevo Docente
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">Cargando docentes...</div>
      ) : isError ? (
        <div className="error-state">
          Error al cargar los docentes: {error instanceof Error ? error.message : 'Error desconocido'}
        </div>
      ) : docentes.length === 0 ? (
        <div className="empty-state">No hay docentes registrados.</div>
      ) : (
        <div className="table-container">
          <table className="docentes-table">
            <thead>
              <tr>
                <th>CUI</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Fecha Nacimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {docentes.map((docente) => (
                <tr key={docente.id}>
                  <td>{docente.persona.cui}</td>
                  <td>{docente.persona.nombres}</td>
                  <td>{docente.persona.apellidos}</td>
                  <td>{docente.persona.fecha_nacimiento}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-eliminar"
                      onClick={() => handleDelete(docente.id)}
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

      <FormularioDocenteModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
      />
    </div>
  );
};

export default ListaDocentes;
