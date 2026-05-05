import React, { useState, useMemo } from 'react';
import { useAsignaciones } from '../../hooks/useAsignaciones';
import { useDocentes } from '../../hooks/useDocentes';
import { useCiclos } from '../../hooks/useCiclos';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import './Asignaciones.css';

// ── Tipos auxiliares ──────────────────────────────────────────────────────────
interface GradoSeccion {
  id: number;
  grado: number;
  seccion: number;
  ciclo: number;
  grado_nombre: string;
  seccion_nombre: string;
  ciclo_anio: number;
}

interface PensumItem {
  id: number;
  grado: number;
  curso: number;
  grado_nombre: string;
  curso_nombre: string;
}

// ── Hooks auxiliares ─────────────────────────────────────────────────────────
const useGradosSecciones = () => {
  const q = useQuery<GradoSeccion[]>({
    queryKey: ['grado-seccion'],
    queryFn: async () => (await api.get('/grado-seccion/')).data,
  });
  return { gradosSecciones: q.data || [], isLoading: q.isLoading };
};

const usePensum = () => {
  const q = useQuery<PensumItem[]>({
    queryKey: ['pensum'],
    queryFn: async () => (await api.get('/pensum/')).data,
  });
  return { pensum: q.data || [], isLoading: q.isLoading };
};

// ── Componente Principal ─────────────────────────────────────────────────────
const Asignaciones: React.FC = () => {
  const { asignaciones, isLoading, isError, crearAsignacion, isCreating, eliminarAsignacion } = useAsignaciones();
  const { docentes } = useDocentes();
  const { ciclos } = useCiclos();
  const { gradosSecciones } = useGradosSecciones();
  const { pensum } = usePensum();

  // Filtros de tabla
  const [filtroCiclo, setFiltroCiclo] = useState<number | ''>('');
  const [filtroGradoSeccion, setFiltroGradoSeccion] = useState<number | ''>('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formCiclo, setFormCiclo] = useState<number | ''>('');
  const [formGradoSeccion, setFormGradoSeccion] = useState<number | ''>('');
  const [formDocente, setFormDocente] = useState<number | ''>('');
  const [formPensum, setFormPensum] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  // Filtrar GradosSecciones por ciclo seleccionado en modal
  const gradosSeccionesPorCicloModal = useMemo(() =>
    formCiclo ? gradosSecciones.filter(gs => gs.ciclo === Number(formCiclo)) : [],
    [gradosSecciones, formCiclo]
  );

  // Filtrar pensum por grado del GradoSeccion seleccionado en modal
  const pensumDisponible = useMemo(() => {
    if (!formGradoSeccion) return [];
    const gs = gradosSecciones.find(g => g.id === Number(formGradoSeccion));
    if (!gs) return [];
    // Excluir cursos ya asignados en ese grado-seccion
    const cursosYaAsignados = new Set(
      asignaciones
        .filter(a => a.grado_seccion === Number(formGradoSeccion))
        .map(a => a.pensum)
    );
    return pensum.filter(p => p.grado === gs.grado && !cursosYaAsignados.has(p.id));
  }, [pensum, gradosSecciones, formGradoSeccion, asignaciones]);

  // Filtros de tabla
  const gradosSeccionesPorFiltroCiclo = useMemo(() =>
    filtroCiclo ? gradosSecciones.filter(gs => gs.ciclo === Number(filtroCiclo)) : gradosSecciones,
    [gradosSecciones, filtroCiclo]
  );

  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter(a => {
      if (filtroGradoSeccion && a.grado_seccion !== Number(filtroGradoSeccion)) return false;
      return true;
    });
  }, [asignaciones, filtroGradoSeccion]);

  const handleAsignar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formPensum || !formDocente || !formGradoSeccion) {
      setFormError('Complete todos los campos.');
      return;
    }
    try {
      await crearAsignacion({
        pensum: Number(formPensum),
        docente: Number(formDocente),
        grado_seccion: Number(formGradoSeccion),
      });
      setFormCiclo('');
      setFormGradoSeccion('');
      setFormDocente('');
      setFormPensum('');
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.non_field_errors?.[0] || 'Error al crear la asignación.');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar esta asignación?')) return;
    await eliminarAsignacion(id);
  };

  return (
    <div className="asignaciones-container">

      {/* Header */}
      <div className="asignaciones-header">
        <div>
          <h2>Asignaciones de Cursos</h2>
          <p className="asignaciones-subtitle">
            {asignaciones.length} asignación{asignaciones.length !== 1 ? 'es' : ''} registrada{asignaciones.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-nueva-asignacion" onClick={() => setModalOpen(true)}>
          + Nueva Asignación
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-bar">
        <select
          className="filtro-select"
          value={filtroCiclo}
          onChange={e => {
            setFiltroCiclo(e.target.value === '' ? '' : Number(e.target.value));
            setFiltroGradoSeccion('');
          }}
        >
          <option value="">Todos los ciclos</option>
          {ciclos.map(c => <option key={c.id} value={c.id}>{c.anio}</option>)}
        </select>
        <select
          className="filtro-select"
          value={filtroGradoSeccion}
          onChange={e => setFiltroGradoSeccion(e.target.value === '' ? '' : Number(e.target.value))}
          disabled={gradosSeccionesPorFiltroCiclo.length === 0}
        >
          <option value="">Todos los salones</option>
          {gradosSeccionesPorFiltroCiclo.map(gs => (
            <option key={gs.id} value={gs.id}>
              {gs.grado_nombre} - Sección {gs.seccion_nombre} ({gs.ciclo_anio})
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        {isLoading ? (
          <div className="loading-state">Cargando asignaciones...</div>
        ) : isError ? (
          <div className="error-state">Error al cargar las asignaciones.</div>
        ) : asignacionesFiltradas.length === 0 ? (
          <div className="empty-state">No hay asignaciones que coincidan con los filtros.</div>
        ) : (
          <table className="asignaciones-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Docente</th>
                <th>Salón</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignacionesFiltradas.map(a => (
                <tr key={a.id}>
                  <td>
                    <span className="curso-badge">{a.curso_nombre}</span>
                  </td>
                  <td>
                    <strong>{a.docente_apellido}</strong>, {a.docente_nombre}
                  </td>
                  <td>
                    <span className="salon-badge">{a.grado_seccion_str}</span>
                  </td>
                  <td>
                    <button className="btn-eliminar-as" onClick={() => handleEliminar(a.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-asignacion">
            <div className="modal-header">
              <h2>Nueva Asignación de Curso</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAsignar} className="asignacion-form">
              <p className="form-instructions">
                Seleccione el salón, el curso del pensum y el docente que lo impartirá.
              </p>

              <div className="form-group">
                <label>Ciclo Escolar *</label>
                <select
                  className="form-select"
                  value={formCiclo}
                  onChange={e => {
                    setFormCiclo(e.target.value === '' ? '' : Number(e.target.value));
                    setFormGradoSeccion('');
                    setFormPensum('');
                  }}
                  required
                >
                  <option value="">-- Seleccione un Ciclo --</option>
                  {ciclos.map(c => (
                    <option key={c.id} value={c.id}>{c.anio}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Salón (Grado + Sección) *</label>
                <select
                  className="form-select"
                  value={formGradoSeccion}
                  onChange={e => {
                    setFormGradoSeccion(e.target.value === '' ? '' : Number(e.target.value));
                    setFormPensum('');
                  }}
                  disabled={!formCiclo || gradosSeccionesPorCicloModal.length === 0}
                  required
                >
                  <option value="">-- Seleccione un Salón --</option>
                  {gradosSeccionesPorCicloModal.map(gs => (
                    <option key={gs.id} value={gs.id}>
                      {gs.grado_nombre} - Sección {gs.seccion_nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Curso (del Pensum) *</label>
                <select
                  className="form-select"
                  value={formPensum}
                  onChange={e => setFormPensum(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={!formGradoSeccion || pensumDisponible.length === 0}
                  required
                >
                  <option value="">-- Seleccione un Curso --</option>
                  {pensumDisponible.map(p => (
                    <option key={p.id} value={p.id}>{p.curso_nombre}</option>
                  ))}
                </select>
                {formGradoSeccion && pensumDisponible.length === 0 && (
                  <span className="hint-text">Todos los cursos del pensum ya están asignados en este salón.</span>
                )}
              </div>

              <div className="form-group">
                <label>Docente *</label>
                <select
                  className="form-select"
                  value={formDocente}
                  onChange={e => setFormDocente(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={!formPensum}
                  required
                >
                  <option value="">-- Seleccione un Docente --</option>
                  {docentes.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.persona.apellidos}, {d.persona.nombres}
                    </option>
                  ))}
                </select>
              </div>

              {formError && <div className="error-message">{formError}</div>}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-submit" disabled={isCreating}>
                  {isCreating ? 'Guardando...' : 'Crear Asignación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asignaciones;
