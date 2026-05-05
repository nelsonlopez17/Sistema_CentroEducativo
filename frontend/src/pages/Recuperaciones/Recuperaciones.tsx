import React, { useState, useMemo } from 'react';
import { useRecuperaciones } from '../../hooks/useRecuperaciones';
import { useAsignaciones } from '../../hooks/useAsignaciones';
import { useCiclos } from '../../hooks/useCiclos';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import './Recuperaciones.css';

// ── Tipos auxiliares ─────────────────────────────────────────────────────────
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

// ── Componente Principal ─────────────────────────────────────────────────────
const Recuperaciones: React.FC = () => {
  const { recuperaciones, isLoading, isError, crearRecuperacion, isCreating, eliminarRecuperacion } = useRecuperaciones();
  const { asignaciones } = useAsignaciones();
  const { ciclos } = useCiclos();
  const { gradosSecciones } = useGradosSecciones();

  // Filtros
  const [filtroCiclo, setFiltroCiclo] = useState<number | ''>('');
  const [filtroGradoSeccion, setFiltroGradoSeccion] = useState<number | ''>('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formCiclo, setFormCiclo] = useState<number | ''>('');
  const [formGradoSeccion, setFormGradoSeccion] = useState<number | ''>('');
  const [formInscripcion, setFormInscripcion] = useState<number | ''>('');
  const [formAsignacion, setFormAsignacion] = useState<number | ''>('');
  const [formNota, setFormNota] = useState('');
  const [formFecha, setFormFecha] = useState('');
  const [formError, setFormError] = useState('');

  const { inscripciones } = useInscripcionesSalon(formGradoSeccion);

  // Cascada de filtros
  const gradosSeccionesPorCiclo = useMemo(() =>
    formCiclo ? gradosSecciones.filter(gs => gs.ciclo === Number(formCiclo)) : [],
    [gradosSecciones, formCiclo]
  );

  const asignacionesSalon = useMemo(() =>
    formGradoSeccion ? asignaciones.filter(a => a.grado_seccion === Number(formGradoSeccion)) : [],
    [asignaciones, formGradoSeccion]
  );

  // IDs ya con recuperación registrada (inscripcion+asignacion)
  const yaRegistradas = useMemo(() =>
    new Set(recuperaciones.map(r => `${r.inscripcion}-${r.asignacion}`)),
    [recuperaciones]
  );

  // Filtros tabla
  const gradosSeccionesFiltro = useMemo(() =>
    filtroCiclo ? gradosSecciones.filter(gs => gs.ciclo === Number(filtroCiclo)) : gradosSecciones,
    [gradosSecciones, filtroCiclo]
  );

  const recuperacionesFiltradas = useMemo(() => {
    return recuperaciones.filter(r => {
      if (filtroGradoSeccion) {
        const asig = asignaciones.find(a => a.id === r.asignacion);
        if (asig?.grado_seccion !== Number(filtroGradoSeccion)) return false;
      }
      return true;
    });
  }, [recuperaciones, filtroGradoSeccion, asignaciones]);

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formInscripcion || !formAsignacion || !formNota || !formFecha) {
      setFormError('Complete todos los campos.');
      return;
    }
    const nota = parseFloat(formNota);
    if (isNaN(nota) || nota < 0 || nota > 100) {
      setFormError('La nota debe estar entre 0 y 100.');
      return;
    }
    try {
      await crearRecuperacion({
        inscripcion: Number(formInscripcion),
        asignacion: Number(formAsignacion),
        nota_recuperacion: nota,
        aprobado: nota >= 60,
        fecha_examen: formFecha,
      });
      setFormCiclo(''); setFormGradoSeccion(''); setFormInscripcion('');
      setFormAsignacion(''); setFormNota(''); setFormFecha('');
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.non_field_errors?.[0] || 'Ya existe una recuperación registrada para esta combinación.');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Eliminar este registro de recuperación?')) return;
    await eliminarRecuperacion(id);
  };

  return (
    <div className="recuperaciones-container">

      <div className="recuperaciones-header">
        <div>
          <h2>Recuperaciones</h2>
          <p className="recuperaciones-subtitle">
            {recuperaciones.length} recuperación{recuperaciones.length !== 1 ? 'es' : ''} registrada{recuperaciones.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-nueva-recuperacion" onClick={() => setModalOpen(true)}>
          + Registrar Recuperación
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-bar">
        <select className="filtro-select" value={filtroCiclo} onChange={e => {
          setFiltroCiclo(e.target.value === '' ? '' : Number(e.target.value));
          setFiltroGradoSeccion('');
        }}>
          <option value="">Todos los ciclos</option>
          {ciclos.map(c => <option key={c.id} value={c.id}>{c.anio}</option>)}
        </select>
        <select className="filtro-select" value={filtroGradoSeccion}
          onChange={e => setFiltroGradoSeccion(e.target.value === '' ? '' : Number(e.target.value))}
          disabled={gradosSeccionesFiltro.length === 0}>
          <option value="">Todos los salones</option>
          {gradosSeccionesFiltro.map(gs => (
            <option key={gs.id} value={gs.id}>{gs.grado_nombre} - Sección {gs.seccion_nombre}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        {isLoading ? (
          <div className="loading-state">Cargando...</div>
        ) : isError ? (
          <div className="error-state">Error al cargar las recuperaciones.</div>
        ) : recuperacionesFiltradas.length === 0 ? (
          <div className="empty-state">No hay recuperaciones registradas.</div>
        ) : (
          <table className="recuperaciones-table">
            <thead>
              <tr>
                <th>Alumno</th>
                <th>Curso</th>
                <th className="th-center">Nota</th>
                <th className="th-center">Resultado</th>
                <th>Fecha Examen</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {recuperacionesFiltradas.map(rec => (
                <tr key={rec.id}>
                  <td><strong>{rec.alumno_apellido}</strong>, {rec.alumno_nombre}</td>
                  <td><span className="curso-tag">{rec.curso_nombre}</span></td>
                  <td className="td-center nota-val">{rec.nota_recuperacion}</td>
                  <td className="td-center">
                    <span className={`resultado-badge ${rec.aprobado ? 'aprobado' : 'reprobado'}`}>
                      {rec.aprobado ? '✓ Aprobado' : '✗ Reprobado'}
                    </span>
                  </td>
                  <td className="td-fecha">{rec.fecha_examen}</td>
                  <td>
                    <button className="btn-eliminar-rec" onClick={() => handleEliminar(rec.id)}>
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
          <div className="modal-content modal-recuperacion">
            <div className="modal-header">
              <h2>Registrar Recuperación</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleRegistrar} className="recuperacion-form">
              <p className="form-instructions">
                Registre el resultado del examen de recuperación de un alumno reprobado.
              </p>

              <div className="form-group">
                <label>Ciclo Escolar *</label>
                <select className="form-select" value={formCiclo} onChange={e => {
                  setFormCiclo(e.target.value === '' ? '' : Number(e.target.value));
                  setFormGradoSeccion(''); setFormInscripcion(''); setFormAsignacion('');
                }} required>
                  <option value="">-- Seleccione --</option>
                  {ciclos.map(c => <option key={c.id} value={c.id}>{c.anio}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Salón *</label>
                <select className="form-select" value={formGradoSeccion} onChange={e => {
                  setFormGradoSeccion(e.target.value === '' ? '' : Number(e.target.value));
                  setFormInscripcion(''); setFormAsignacion('');
                }} disabled={!formCiclo} required>
                  <option value="">-- Seleccione --</option>
                  {gradosSeccionesPorCiclo.map(gs => (
                    <option key={gs.id} value={gs.id}>{gs.grado_nombre} - Sección {gs.seccion_nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Alumno *</label>
                <select className="form-select" value={formInscripcion} onChange={e =>
                  setFormInscripcion(e.target.value === '' ? '' : Number(e.target.value))
                } disabled={!formGradoSeccion} required>
                  <option value="">-- Seleccione --</option>
                  {inscripciones.map(ins => (
                    <option key={ins.id} value={ins.id}>
                      {ins.estudiante_apellido}, {ins.estudiante_nombre} ({ins.estudiante_cui})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Curso *</label>
                <select className="form-select" value={formAsignacion} onChange={e =>
                  setFormAsignacion(e.target.value === '' ? '' : Number(e.target.value))
                } disabled={!formInscripcion} required>
                  <option value="">-- Seleccione --</option>
                  {asignacionesSalon
                    .filter(a => !yaRegistradas.has(`${formInscripcion}-${a.id}`))
                    .map(a => (
                      <option key={a.id} value={a.id}>{a.curso_nombre}</option>
                    ))
                  }
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nota de Recuperación *</label>
                  <input type="number" className="form-input" min={0} max={100} step={0.01}
                    value={formNota} onChange={e => setFormNota(e.target.value)} required placeholder="0 - 100" />
                </div>
                <div className="form-group">
                  <label>Fecha del Examen *</label>
                  <input type="date" className="form-input" value={formFecha}
                    onChange={e => setFormFecha(e.target.value)} required />
                </div>
              </div>

              {formNota && (
                <div className={`nota-preview ${parseFloat(formNota) >= 60 ? 'aprobado' : 'reprobado'}`}>
                  {parseFloat(formNota) >= 60 ? '✓ Alumno Aprobado' : '✗ Alumno Reprobado'}
                </div>
              )}

              {formError && <div className="error-message">{formError}</div>}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-submit" disabled={isCreating}>
                  {isCreating ? 'Guardando...' : 'Registrar'}
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
