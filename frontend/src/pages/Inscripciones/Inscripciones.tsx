import React, { useState, useMemo } from 'react';
import { useInscripciones } from '../../hooks/useInscripciones';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import { useCiclos } from '../../hooks/useCiclos';
import './Inscripciones.css';

// Hook auxiliar para grado-seccion
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

interface GradoSeccion {
  id: number;
  grado: number;
  seccion: number;
  ciclo: number;
  grado_nombre: string;
  seccion_nombre: string;
  ciclo_anio: number;
}

const useGradosSecciones = () => {
  const q = useQuery<GradoSeccion[]>({
    queryKey: ['grado-seccion'],
    queryFn: async () => (await api.get('/grado-seccion/')).data,
  });
  return { gradosSecciones: q.data || [], isLoading: q.isLoading };
};

// ─────────────────────────────────────────────
const Inscripciones: React.FC = () => {
  const { inscripciones, isLoading, isError, crearInscripcion, isCreating, eliminarInscripcion } = useInscripciones();
  const { estudiantes } = useEstudiantes();
  const { ciclos } = useCiclos();
  const { gradosSecciones } = useGradosSecciones();

  // Filtros de pantalla
  const [filtroCiclo, setFiltroCiclo] = useState<number | ''>('');
  const [filtroGradoSeccion, setFiltroGradoSeccion] = useState<number | ''>('');
  const [busquedaAlumno, setBusquedaAlumno] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formEstudiante, setFormEstudiante] = useState<number | ''>('');
  const [formGradoSeccion, setFormGradoSeccion] = useState<number | ''>('');
  const [formCiclo, setFormCiclo] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  // Grado-secciones filtradas por ciclo seleccionado en modal
  const gradosSeccionesPorCiclo = useMemo(() => {
    if (!formCiclo) return [];
    return gradosSecciones.filter(gs => gs.ciclo === Number(formCiclo));
  }, [gradosSecciones, formCiclo]);

  // IDs de estudiantes ya inscritos en el grado-seccion seleccionado
  const estudiantesYaInscritos = useMemo(() => {
    if (!formGradoSeccion) return new Set<number>();
    return new Set(
      inscripciones
        .filter(i => i.grado_seccion === Number(formGradoSeccion))
        .map(i => i.estudiante)
    );
  }, [inscripciones, formGradoSeccion]);

  // Inscripciones filtradas para la tabla
  const inscripcionesFiltradas = useMemo(() => {
    return inscripciones.filter(i => {
      if (filtroGradoSeccion && i.grado_seccion !== Number(filtroGradoSeccion)) return false;
      if (busquedaAlumno) {
        const s = busquedaAlumno.toLowerCase();
        if (!i.estudiante_nombre.toLowerCase().includes(s) &&
            !i.estudiante_apellido.toLowerCase().includes(s) &&
            !i.estudiante_cui.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [inscripciones, filtroGradoSeccion, busquedaAlumno]);

  const gradosSeccionesPorFiltroCiclo = useMemo(() => {
    if (!filtroCiclo) return gradosSecciones;
    return gradosSecciones.filter(gs => gs.ciclo === Number(filtroCiclo));
  }, [gradosSecciones, filtroCiclo]);

  const handleInscribir = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formEstudiante || !formGradoSeccion) {
      setFormError('Seleccione un alumno y un salón.');
      return;
    }
    try {
      await crearInscripcion({ estudiante: Number(formEstudiante), grado_seccion: Number(formGradoSeccion) });
      setFormEstudiante('');
      setFormGradoSeccion('');
      setFormCiclo('');
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.non_field_errors?.[0] || 'Error al inscribir al alumno.');
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Retirar esta inscripción?')) return;
    await eliminarInscripcion(id);
  };

  return (
    <div className="inscripciones-container">

      {/* Header */}
      <div className="inscripciones-header">
        <div>
          <h2>Inscripciones</h2>
          <p className="inscripciones-subtitle">
            {inscripciones.length} alumno{inscripciones.length !== 1 ? 's' : ''} inscritos en total
          </p>
        </div>
        <button className="btn-nueva-inscripcion" onClick={() => setModalOpen(true)}>
          + Nueva Inscripción
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-bar">
        <input
          type="text"
          className="filtro-input"
          placeholder="Buscar alumno por nombre o CUI..."
          value={busquedaAlumno}
          onChange={e => setBusquedaAlumno(e.target.value)}
        />
        <select
          className="filtro-select"
          value={filtroCiclo}
          onChange={e => { setFiltroCiclo(e.target.value === '' ? '' : Number(e.target.value)); setFiltroGradoSeccion(''); }}
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
            <option key={gs.id} value={gs.id}>{gs.grado_nombre} - Sección {gs.seccion_nombre} ({gs.ciclo_anio})</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        {isLoading ? (
          <div className="loading-state">Cargando inscripciones...</div>
        ) : isError ? (
          <div className="error-state">Error al cargar las inscripciones.</div>
        ) : inscripcionesFiltradas.length === 0 ? (
          <div className="empty-state">No hay inscripciones que coincidan con los filtros.</div>
        ) : (
          <table className="inscripciones-table">
            <thead>
              <tr>
                <th>CUI</th>
                <th>Alumno</th>
                <th>Salón</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inscripcionesFiltradas.map(ins => (
                <tr key={ins.id}>
                  <td className="td-cui">{ins.estudiante_cui}</td>
                  <td><strong>{ins.estudiante_apellido}</strong>, {ins.estudiante_nombre}</td>
                  <td><span className="salon-badge">{ins.grado_seccion_str}</span></td>
                  <td>
                    <button className="btn-retirar" onClick={() => handleEliminar(ins.id)}>
                      Retirar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Inscripción */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-inscripcion">
            <div className="modal-header">
              <h2>Nueva Inscripción</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleInscribir} className="inscripcion-form">
              <p className="form-instructions">
                Seleccione el ciclo escolar, el salón y el alumno a inscribir.
              </p>

              <div className="form-group">
                <label>Ciclo Escolar *</label>
                <select
                  className="form-select"
                  value={formCiclo}
                  onChange={e => { setFormCiclo(e.target.value === '' ? '' : Number(e.target.value)); setFormGradoSeccion(''); }}
                  required
                >
                  <option value="">-- Seleccione un Ciclo --</option>
                  {ciclos.map(c => (
                    <option key={c.id} value={c.id}>{c.anio} ({c.fecha_inicio} → {c.fecha_fin})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Salón (Grado + Sección) *</label>
                <select
                  className="form-select"
                  value={formGradoSeccion}
                  onChange={e => setFormGradoSeccion(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={!formCiclo || gradosSeccionesPorCiclo.length === 0}
                  required
                >
                  <option value="">-- Seleccione un Salón --</option>
                  {gradosSeccionesPorCiclo.map(gs => (
                    <option key={gs.id} value={gs.id}>{gs.grado_nombre} - Sección {gs.seccion_nombre}</option>
                  ))}
                </select>
                {formCiclo && gradosSeccionesPorCiclo.length === 0 && (
                  <span className="hint-text">No hay salones creados para este ciclo. Créalos en Grados y Secciones.</span>
                )}
              </div>

              <div className="form-group">
                <label>Alumno *</label>
                <select
                  className="form-select"
                  value={formEstudiante}
                  onChange={e => setFormEstudiante(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={!formGradoSeccion}
                  required
                >
                  <option value="">-- Seleccione un Alumno --</option>
                  {estudiantes
                    .filter(est => !estudiantesYaInscritos.has(est.id))
                    .map(est => (
                      <option key={est.id} value={est.id}>
                        {est.persona.apellidos}, {est.persona.nombres} ({est.persona.cui})
                      </option>
                    ))
                  }
                </select>
              </div>

              {formError && <div className="error-message">{formError}</div>}

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-submit" disabled={isCreating}>
                  {isCreating ? 'Inscribiendo...' : 'Inscribir Alumno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inscripciones;
