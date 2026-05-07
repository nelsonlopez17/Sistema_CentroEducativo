import React, { useState, useMemo } from 'react';
import { useRecuperaciones } from '../../hooks/useRecuperaciones';
import { useAsignaciones } from '../../hooks/useAsignaciones';
import { useCiclos } from '../../hooks/useCiclos';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import './Recuperaciones.css';

interface GradoSeccion {
  id: number;
  ciclo: number;
  grado_nombre: string;
  seccion_nombre: string;
}

interface Inscripcion {
  id: number;
  estudiante: number;
  grado_seccion: number;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_cui: string;
}

const useGradosSecciones = () => {
  const q = useQuery<GradoSeccion[]>({
    queryKey: ['grado-seccion'],
    queryFn: async () => (await api.get('/grado-seccion/')).data,
  });
  return { gradosSecciones: q.data || [] };
};

const useInscripcionesSalon = (gradoSeccionId: number | '') => {
  const q = useQuery<Inscripcion[]>({
    queryKey: ['inscripciones-salon', gradoSeccionId],
    queryFn: async () => {
      const resp = await api.get('/inscripciones/');
      return resp.data.filter((i: Inscripcion) => i.grado_seccion === Number(gradoSeccionId));
    },
    enabled: !!gradoSeccionId,
  });
  return { inscripciones: q.data || [] };
};

const Recuperaciones: React.FC = () => {
  const { recuperaciones, isLoading, isError, crearRecuperacion, isCreating, eliminarRecuperacion } = useRecuperaciones();
  const { asignaciones } = useAsignaciones();
  const { ciclos } = useCiclos();
  const { gradosSecciones } = useGradosSecciones();

  const [filtroCiclo, setFiltroCiclo] = useState<number | ''>('');
  const [filtroGradoSeccion, setFiltroGradoSeccion] = useState<number | ''>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [formCiclo, setFormCiclo] = useState<number | ''>('');
  const [formGradoSeccion, setFormGradoSeccion] = useState<number | ''>('');
  const [formInscripcion, setFormInscripcion] = useState<number | ''>('');
  const [formAsignacion, setFormAsignacion] = useState<number | ''>('');
  const [formNota, setFormNota] = useState('');
  const [formFecha, setFormFecha] = useState('');
  const [formError, setFormError] = useState('');

  const { inscripciones } = useInscripcionesSalon(formGradoSeccion);

  const gradosSeccionesPorCiclo = useMemo(() =>
    formCiclo ? gradosSecciones.filter(gs => gs.ciclo === Number(formCiclo)) : [],
    [gradosSecciones, formCiclo]
  );

  const asignacionesSalon = useMemo(() =>
    formGradoSeccion ? asignaciones.filter(a => a.grado_seccion === Number(formGradoSeccion)) : [],
    [asignaciones, formGradoSeccion]
  );

  const yaRegistradas = useMemo(() =>
    new Set(recuperaciones.map(r => `${r.inscripcion}-${r.asignacion}`)),
    [recuperaciones]
  );

  const gradosSeccionesFiltro = useMemo(() =>
    filtroCiclo ? gradosSecciones.filter(gs => gs.ciclo === Number(filtroCiclo)) : gradosSecciones,
    [gradosSecciones, filtroCiclo]
  );

  const recuperacionesFiltradas = useMemo(() => {
    return recuperaciones.filter(r => {
      if (filtroGradoSeccion) {
        const asig = asignaciones.find(a => a.id === r.asignacion);
        if (asig?.grado_seccion !== Number(filtroGradoSeccion)) return false;
      } else if (filtroCiclo) {
        const asig = asignaciones.find(a => a.id === r.asignacion);
        const gs = gradosSecciones.find(g => g.id === asig?.grado_seccion);
        if (gs?.ciclo !== Number(filtroCiclo)) return false;
      }
      return true;
    });
  }, [recuperaciones, filtroGradoSeccion, filtroCiclo, asignaciones, gradosSecciones]);

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formInscripcion || !formAsignacion || !formNota || !formFecha) {
      setFormError('Complete todos los campos obligatorios.');
      return;
    }
    const nota = parseFloat(formNota);
    try {
      await crearRecuperacion({
        inscripcion: Number(formInscripcion),
        asignacion: Number(formAsignacion),
        nota_recuperacion: nota,
        aprobado: nota >= 60,
        fecha_examen: formFecha,
      });
      resetForm();
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.non_field_errors?.[0] || 'Error al registrar la recuperación.');
    }
  };

  const resetForm = () => {
    setFormCiclo(''); setFormGradoSeccion(''); setFormInscripcion('');
    setFormAsignacion(''); setFormNota(''); setFormFecha('');
    setFormError('');
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar este registro de recuperación académica?')) return;
    await eliminarRecuperacion(id);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-text">
          <h1>Exámenes de Recuperación</h1>
          <p>Registro y seguimiento de segundas oportunidades académicas.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <span className="icon">+</span> Registrar Recuperación
        </button>
      </div>

      <div className="filtros-bar card">
        <div className="select-group" style={{ display: 'flex', gap: '12px' }}>
          <select className="input-field" value={filtroCiclo} onChange={e => {
            setFiltroCiclo(e.target.value === '' ? '' : Number(e.target.value));
            setFiltroGradoSeccion('');
          }}>
            <option value="">Todos los Ciclos</option>
            {ciclos.map(c => <option key={c.id} value={c.id}>Ciclo {c.anio}</option>)}
          </select>
          <select className="input-field" value={filtroGradoSeccion}
            onChange={e => setFiltroGradoSeccion(e.target.value === '' ? '' : Number(e.target.value))}
            disabled={gradosSeccionesFiltro.length === 0}>
            <option value="">Todos los Salones</option>
            {gradosSeccionesFiltro.map(gs => (
              <option key={gs.id} value={gs.id}>{gs.grado_nombre} - {gs.seccion_nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="loading-container"><div className="loader"></div></div>
        ) : isError ? (
          <div className="error-card">⚠️ Error al cargar las recuperaciones académicas.</div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Materia</th>
                <th className="text-center">Nota</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Fecha Examen</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {recuperacionesFiltradas.length === 0 ? (
                <tr><td colSpan={6} className="text-center empty-row">No se encontraron registros de recuperación.</td></tr>
              ) : (
                recuperacionesFiltradas.map(rec => (
                  <tr key={rec.id}>
                    <td>
                      <div className="user-name-cell">{rec.alumno_apellido}, {rec.alumno_nombre}</div>
                    </td>
                    <td><span className="badge-info">{rec.curso_nombre}</span></td>
                    <td className="text-center"><strong style={{ fontSize: '15px' }}>{rec.nota_recuperacion}</strong></td>
                    <td className="text-center">
                      <span className={`badge ${rec.aprobado ? 'badge-success' : 'badge-danger'}`} style={{ minWidth: '100px' }}>
                        {rec.aprobado ? 'Aprobado' : 'Reprobado'}
                      </span>
                    </td>
                    <td className="text-center" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{rec.fecha_examen}</td>
                    <td className="actions-cell">
                      <button className="btn-icon-action delete" onClick={() => handleEliminar(rec.id)} title="Eliminar Registro">
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
              <h3>Registro de Recuperación</h3>
              <button className="btn-close" onClick={() => { setModalOpen(false); resetForm(); }}>&times;</button>
            </div>
            <form onSubmit={handleRegistrar} className="modal-form">
              <div className="form-group">
                <label>Ciclo Escolar</label>
                <select className="input-field" value={formCiclo} onChange={e => {
                  setFormCiclo(e.target.value === '' ? '' : Number(e.target.value));
                  setFormGradoSeccion(''); setFormInscripcion(''); setFormAsignacion('');
                }} required>
                  <option value="">-- Seleccionar --</option>
                  {ciclos.map(c => <option key={c.id} value={c.id}>{c.anio}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Salón / Grado y Sección</label>
                <select className="input-field" value={formGradoSeccion} onChange={e => {
                  setFormGradoSeccion(e.target.value === '' ? '' : Number(e.target.value));
                  setFormInscripcion(''); setFormAsignacion('');
                }} disabled={!formCiclo} required>
                  <option value="">-- Seleccionar --</option>
                  {gradosSeccionesPorCiclo.map(gs => (
                    <option key={gs.id} value={gs.id}>{gs.grado_nombre} - {gs.seccion_nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Estudiante</label>
                <select className="input-field" value={formInscripcion} onChange={e =>
                  setFormInscripcion(e.target.value === '' ? '' : Number(e.target.value))
                } disabled={!formGradoSeccion} required>
                  <option value="">-- Seleccionar --</option>
                  {inscripciones.map(ins => (
                    <option key={ins.id} value={ins.id}>
                      {ins.estudiante_apellido}, {ins.estudiante_nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Materia reprobada</label>
                <select className="input-field" value={formAsignacion} onChange={e =>
                  setFormAsignacion(e.target.value === '' ? '' : Number(e.target.value))
                } disabled={!formInscripcion} required>
                  <option value="">-- Seleccionar --</option>
                  {asignacionesSalon
                    .filter(a => !yaRegistradas.has(`${formInscripcion}-${a.id}`))
                    .map(a => (
                      <option key={a.id} value={a.id}>{a.curso_nombre}</option>
                    ))
                  }
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Nota Obtenida</label>
                  <input type="number" className="input-field" min={0} max={100} step={0.01}
                    value={formNota} onChange={e => setFormNota(e.target.value)} required placeholder="0 - 100" />
                </div>
                <div className="form-group">
                  <label>Fecha Examen</label>
                  <input type="date" className="input-field" value={formFecha}
                    onChange={e => setFormFecha(e.target.value)} required />
                </div>
              </div>

              {formError && <div className="error-message-inline">{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setModalOpen(false); resetForm(); }}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isCreating}>
                  {isCreating ? 'Guardando...' : 'Registrar Examen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recuperaciones;

