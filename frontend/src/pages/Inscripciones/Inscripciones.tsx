import React, { useState, useMemo } from 'react';
import { useInscripciones } from '../../hooks/useInscripciones';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import { useCiclos } from '../../hooks/useCiclos';
import './Inscripciones.css';

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

const Inscripciones: React.FC = () => {
  const { inscripciones, isLoading, isError, crearInscripcion, isCreating, eliminarInscripcion } = useInscripciones();
  const { estudiantes } = useEstudiantes();
  const { ciclos } = useCiclos();
  const { gradosSecciones } = useGradosSecciones();

  const [filtroCiclo, setFiltroCiclo] = useState<number | ''>('');
  const [filtroGradoSeccion, setFiltroGradoSeccion] = useState<number | ''>('');
  const [busquedaAlumno, setBusquedaAlumno] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [formEstudiante, setFormEstudiante] = useState<number | ''>('');
  const [formGradoSeccion, setFormGradoSeccion] = useState<number | ''>('');
  const [formCiclo, setFormCiclo] = useState<number | ''>('');
  const [formError, setFormError] = useState('');

  const gradosSeccionesPorCiclo = useMemo(() => {
    if (!formCiclo) return [];
    return gradosSecciones.filter(gs => gs.ciclo === Number(formCiclo));
  }, [gradosSecciones, formCiclo]);

  // Lista de IDs de estudiantes ya inscritos en el ciclo seleccionado en el modal
  const estudiantesYaInscritosEnCiclo = useMemo(() => {
    if (!formCiclo) return new Set<number>();
    // Necesitamos identificar qué salones pertenecen a este ciclo
    const salonesDelCiclo = new Set(gradosSecciones.filter(gs => gs.ciclo === Number(formCiclo)).map(gs => gs.id));
    return new Set(
      inscripciones
        .filter(i => salonesDelCiclo.has(i.grado_seccion))
        .map(i => i.estudiante)
    );
  }, [inscripciones, formCiclo, gradosSecciones]);

  const inscripcionesFiltradas = useMemo(() => {
    return inscripciones.filter(i => {
      if (filtroGradoSeccion && i.grado_seccion !== Number(filtroGradoSeccion)) return false;
      if (filtroCiclo) {
        const salon = gradosSecciones.find(gs => gs.id === i.grado_seccion);
        if (!salon || salon.ciclo !== Number(filtroCiclo)) return false;
      }
      if (busquedaAlumno) {
        const s = busquedaAlumno.toLowerCase();
        if (!i.estudiante_nombre.toLowerCase().includes(s) &&
            !i.estudiante_apellido.toLowerCase().includes(s) &&
            !i.estudiante_cui.toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [inscripciones, filtroGradoSeccion, filtroCiclo, busquedaAlumno, gradosSecciones]);

  const gradosSeccionesPorFiltroCiclo = useMemo(() => {
    if (!filtroCiclo) return gradosSecciones;
    return gradosSecciones.filter(gs => gs.ciclo === Number(filtroCiclo));
  }, [gradosSecciones, filtroCiclo]);

  const handleInscribir = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formEstudiante || !formGradoSeccion || !formCiclo) {
      setFormError('Complete todos los campos obligatorios.');
      return;
    }
    try {
      await crearInscripcion({ estudiante: Number(formEstudiante), grado_seccion: Number(formGradoSeccion) });
      resetForm();
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.non_field_errors?.[0] || 'Error al procesar la inscripción.');
    }
  };

  const resetForm = () => {
    setFormEstudiante('');
    setFormGradoSeccion('');
    setFormCiclo('');
    setFormError('');
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm('¿Desea retirar esta inscripción? Esta acción es irreversible.')) return;
    await eliminarInscripcion(id);
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-text">
          <h1>Control de Inscripciones</h1>
          <p>Registro y seguimiento de alumnos por grado y ciclo lectivo.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <span className="icon">+</span> Registrar Inscripción
        </button>
      </div>

      <div className="filtros-bar card">
        <div className="search-group" style={{ flex: 2 }}>
          <input
            type="text"
            className="input-field"
            placeholder="Buscar por Alumno o CUI..."
            value={busquedaAlumno}
            onChange={e => setBusquedaAlumno(e.target.value)}
          />
        </div>
        <div className="select-group" style={{ flex: 3, display: 'flex', gap: '12px' }}>
          <select
            className="input-field"
            value={filtroCiclo}
            onChange={e => { setFiltroCiclo(e.target.value === '' ? '' : Number(e.target.value)); setFiltroGradoSeccion(''); }}
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
              <option key={gs.id} value={gs.id}>{gs.grado_nombre} - Sección {gs.seccion_nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="loading-container"><div className="loader"></div></div>
        ) : isError ? (
          <div className="error-card">⚠️ Error al cargar los registros de inscripción.</div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>CUI / ID</th>
                <th>Alumno(a)</th>
                <th>Salón Asignado</th>
                <th className="text-center">Retirar</th>
              </tr>
            </thead>
            <tbody>
              {inscripcionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center empty-row">No se encontraron registros activos.</td>
                </tr>
              ) : (
                inscripcionesFiltradas.map(ins => (
                  <tr key={ins.id}>
                    <td className="font-mono" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{ins.estudiante_cui}</td>
                    <td>
                      <span className="user-name-cell">{ins.estudiante_apellido}, {ins.estudiante_nombre}</span>
                    </td>
                    <td>
                      <span className="badge-info">{ins.grado_seccion_str}</span>
                    </td>
                    <td className="actions-cell">
                      <button className="btn-icon-action delete" onClick={() => handleEliminar(ins.id)} title="Retirar Alumno">
                        🚪
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
              <h3>Nueva Inscripción Académica</h3>
              <button className="btn-close" onClick={() => { setModalOpen(false); resetForm(); }}>&times;</button>
            </div>
            <form onSubmit={handleInscribir} className="modal-form">
              <div className="form-group">
                <label>1. Seleccionar Alumno(a)</label>
                <select
                  className="input-field"
                  value={formEstudiante}
                  onChange={e => setFormEstudiante(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                >
                  <option value="">-- Buscar Alumno --</option>
                  {estudiantes.map(est => (
                    <option key={est.id} value={est.id}>
                      {est.persona.apellidos}, {est.persona.nombres} ({est.persona.cui})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>2. Ciclo Escolar</label>
                <select
                  className="input-field"
                  value={formCiclo}
                  onChange={e => { setFormCiclo(e.target.value === '' ? '' : Number(e.target.value)); setFormGradoSeccion(''); }}
                  disabled={!formEstudiante}
                  required
                >
                  <option value="">-- Seleccionar Año Lectivo --</option>
                  {ciclos.map(c => {
                    const yaInscrito = estudiantesYaInscritosEnCiclo.has(Number(formEstudiante));
                    return (
                      <option key={c.id} value={c.id} disabled={yaInscrito}>
                        {c.anio} {yaInscrito ? '(Ya inscrito en este ciclo)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-group">
                <label>3. Salón / Grado y Sección</label>
                <select
                  className="input-field"
                  value={formGradoSeccion}
                  onChange={e => setFormGradoSeccion(e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={!formCiclo || gradosSeccionesPorCiclo.length === 0}
                  required
                >
                  <option value="">-- Seleccionar Salón --</option>
                  {gradosSeccionesPorCiclo.map(gs => (
                    <option key={gs.id} value={gs.id}>{gs.grado_nombre} - Sección {gs.seccion_nombre}</option>
                  ))}
                </select>
              </div>

              {formError && <div className="error-message-inline">{formError}</div>}

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setModalOpen(false); resetForm(); }}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={isCreating}>
                  {isCreating ? 'Inscribiendo...' : 'Confirmar e Inscribir'}
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


