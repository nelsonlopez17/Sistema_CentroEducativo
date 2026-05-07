import React, { useState, useMemo } from 'react';
import { useAsignaciones } from '../../hooks/useAsignaciones';
import { useDocentes } from '../../hooks/useDocentes';
import { useCiclos } from '../../hooks/useCiclos';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import './Asignaciones.css';

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

const Asignaciones: React.FC = () => {
  const { asignaciones, isLoading, isError, crearAsignacion, isCreating, eliminarAsignacion } = useAsignaciones();
  const { docentes } = useDocentes();
  const { ciclos } = useCiclos();
  const { gradosSecciones } = useGradosSecciones();
  const { pensum } = usePensum();

  const [filtroCiclo, setFiltroCiclo] = useState<number | ''>('');
  const [filtroGradoSeccion, setFiltroGradoSeccion] = useState<number | ''>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [formCiclo, setFormCiclo] = useState<number | ''>('');
  const [formGradoSeccion, setFormGradoSeccion] = useState<number | ''>('');
  const [formDocente, setFormDocente] = useState<number | ''>('');
  const [formPensum, setFormPensum] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  const gradosSeccionesPorCicloModal = useMemo(() =>
    formCiclo ? gradosSecciones.filter(gs => gs.ciclo === Number(formCiclo)) : [],
    [gradosSecciones, formCiclo]
  );

  const pensumDisponible = useMemo(() => {
    if (!formGradoSeccion) return [];
    const gs = gradosSecciones.find(g => g.id === Number(formGradoSeccion));
    if (!gs) return [];
    const cursosYaAsignados = new Set(
      asignaciones
        .filter(a => a.grado_seccion === Number(formGradoSeccion))
        .map(a => a.pensum)
    );
    return pensum.filter(p => p.grado === gs.grado && !cursosYaAsignados.has(p.id));
  }, [pensum, gradosSecciones, formGradoSeccion, asignaciones]);

  const gradosSeccionesPorFiltroCiclo = useMemo(() =>
    filtroCiclo ? gradosSecciones.filter(gs => gs.ciclo === Number(filtroCiclo)) : gradosSecciones,
    [gradosSecciones, filtroCiclo]
  );

  const asignacionesFiltradas = useMemo(() => {
    return asignaciones.filter(a => {
      if (filtroGradoSeccion && a.grado_seccion !== Number(filtroGradoSeccion)) return false;
      if (filtroCiclo && !gradosSeccionesPorFiltroCiclo.some(gs => gs.id === a.grado_seccion)) return false;
      return true;
    });
  }, [asignaciones, filtroGradoSeccion, filtroCiclo, gradosSeccionesPorFiltroCiclo]);

  const handleAsignar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formPensum || !formDocente || !formGradoSeccion) {
      setFormError('Complete todos los campos obligatorios.');
      return;
    }
    try {
      await crearAsignacion({
        pensum: Number(formPensum),
        docente: Number(formDocente),
        grado_seccion: Number(formGradoSeccion),
      });
      resetForm();
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.non_field_errors?.[0] || 'Error al crear la asignación.');
    }
  };

  const resetForm = () => {
    setFormCiclo('');
    setFormGradoSeccion('');
    setFormDocente('');
    setFormPensum('');
    setFormError('');
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Desea eliminar esta asignación académica?')) return;
    await eliminarAsignacion(id);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-text">
          <h1>Asignaciones Académicas</h1>
          <p>Vincula docentes con materias y salones específicos.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <span className="icon">+</span> Nueva Asignación
        </button>
      </div>

      <div className="filtros-bar card">
        <div className="select-group" style={{ display: 'flex', gap: '16px', flex: 1 }}>
          <select
            className="input-field"
            value={filtroCiclo}
            onChange={e => {
              setFiltroCiclo(e.target.value === '' ? '' : Number(e.target.value));
              setFiltroGradoSeccion('');
            }}
          >
            <option value="">Todos los Ciclos</option>
            {ciclos.map(c => <option key={c.id} value={c.id}>Ciclo {c.anio}</option>)}
          </select>
          <select
            className="input-field"
            value={filtroGradoSeccion}
            onChange={e => setFiltroGradoSeccion(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={gradosSeccionesPorFiltroCiclo.length === 0}
          >
            <option value="">Todos los Salones</option>
            {gradosSeccionesPorFiltroCiclo.map(gs => (
              <option key={gs.id} value={gs.id}>
                {gs.grado_nombre} - Sección {gs.seccion_nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p>Cargando asignaciones...</p>
          </div>
        ) : isError ? (
          <div className="error-card">⚠️ Error al cargar las asignaciones académicas.</div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Materia / Curso</th>
                <th>Docente Asignado</th>
                <th>Salón / Ciclo</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center empty-row">No se encontraron asignaciones para los filtros seleccionados.</td>
                </tr>
              ) : (
                asignacionesFiltradas.map(a => (
                  <tr key={a.id}>
                    <td>
                      <span className="badge-info">{a.curso_nombre}</span>
                    </td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
                          {a.docente_nombre.charAt(0)}
                        </div>
                        <span className="user-name-cell">{a.docente_apellido}, {a.docente_nombre}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
                        {a.grado_seccion_str}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="btn-icon-action delete" onClick={() => handleEliminar(a.id)} title="Eliminar Asignación">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Nueva Asignación</h3>
              <button className="btn-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleAsignar} className="modal-form">
              <div className="form-group">
                <label>Ciclo Escolar</label>
                <select
                  className="input-field"
                  value={formCiclo}
                  onChange={e => {
                    setFormCiclo(e.target.value === '' ? '' : Number(e.target.value));
                    setFormGradoSeccion('');
                    setFormPensum('');
                  }}
                  required
                >
                  <option value="">-- Seleccionar Ciclo --</option>
                  {ciclos.map(c => (
                    <option key={c.id} value={c.id}>{c.anio}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Salón de Clases</label>
                <select
                  className="input-field"
                  value={formGradoSeccion}
                  onChange={e => {
                    setFormGradoSeccion(e.target.value === '' ? '' : Number(e.target.value));
                    setFormPensum('');
                  }}
                  disabled={!formCiclo || gradosSeccionesPorCicloModal.length === 0}
                  required
                >
                  <option value="">-- Seleccionar Salón --</option>
                  {gradosSeccionesPorCicloModal.map(gs => (
                    <option key={gs.id} value={gs.id}>
                      {gs.grado_nombre} - Sección {gs.seccion_nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Materia (del Pensum)</label>
                <select
                  className="input-field"
                  value={formPensum}
                  onChange={e => setFormPensum(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={!formGradoSeccion || pensumDisponible.length === 0}
                  required
                >
                  <option value="">-- Seleccionar Curso --</option>
                  {pensumDisponible.map(p => (
                    <option key={p.id} value={p.id}>{p.curso_nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Docente Responsable</label>
                <select
                  className="input-field"
                  value={formDocente}
                  onChange={e => setFormDocente(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={!formPensum}
                  required
                >
                  <option value="">-- Seleccionar Docente --</option>
                  {docentes.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.persona.apellidos}, {d.persona.nombres}
                    </option>
                  ))}
                </select>
              </div>

              {formError && <div className="error-message-inline">{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setModalOpen(false); resetForm(); }}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isCreating}>
                  {isCreating ? 'Asignando...' : 'Confirmar Asignación'}
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

