import React, { useState, useMemo } from 'react';
import { useNotas } from '../../hooks/useNotas';
import { useAsignaciones } from '../../hooks/useAsignaciones';
import { useCiclos } from '../../hooks/useCiclos';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import './Calificaciones.css';

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

interface Inscripcion {
  id: number;
  estudiante: number;
  grado_seccion: number;
  estudiante_nombre: string;
  estudiante_apellido: string;
  estudiante_cui: string;
}

interface Unidad {
  id: number;
  nombre: string;
  numero: number;
  ciclo: number;
}

const useGradosSecciones = () => {
  const q = useQuery<GradoSeccion[]>({ queryKey: ['grado-seccion'], queryFn: async () => (await api.get('/grado-seccion/')).data });
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
  return { inscripciones: q.data || [], isLoading: q.isLoading };
};

// ── Componente Principal ─────────────────────────────────────────────────────
const Calificaciones: React.FC = () => {
  const { ciclos } = useCiclos();
  const { asignaciones } = useAsignaciones();
  const { gradosSecciones } = useGradosSecciones();

  // Selección en cascada
  const [selCiclo, setSelCiclo] = useState<number | ''>('');
  const [selGradoSeccion, setSelGradoSeccion] = useState<number | ''>('');
  const [selAsignacion, setSelAsignacion] = useState<number | ''>('');
  const [selUnidad, setSelUnidad] = useState<number | ''>('');

  const { notas, isLoading: notasLoading, crearNota, actualizarNota, isCreating } = useNotas(
    selAsignacion ? { asignacion: Number(selAsignacion) } : undefined
  );
  const { inscripciones } = useInscripcionesSalon(selGradoSeccion);

  // Unidades del ciclo seleccionado
  const unidadesCiclo = useMemo(() => {
    if (!selCiclo) return [];
    const ciclo = ciclos.find(c => c.id === Number(selCiclo));
    return ciclo ? [...ciclo.unidades].sort((a: Unidad, b: Unidad) => a.numero - b.numero) : [];
  }, [ciclos, selCiclo]);

  // GradosSecciones filtradas por ciclo
  const gradosSeccionesCiclo = useMemo(() =>
    selCiclo ? gradosSecciones.filter(gs => gs.ciclo === Number(selCiclo)) : [],
    [gradosSecciones, selCiclo]
  );

  // Asignaciones filtradas por grado-seccion
  const asignacionesSalon = useMemo(() =>
    selGradoSeccion ? asignaciones.filter(a => a.grado_seccion === Number(selGradoSeccion)) : [],
    [asignaciones, selGradoSeccion]
  );

  // Mapa de notas ya ingresadas: inscripcion_id + unidad_id → nota
  const notasMap = useMemo(() => {
    const map = new Map<string, { id: number; nota: string; es_mejoramiento: boolean }>();
    notas.forEach(n => {
      if (!selUnidad || n.unidad === Number(selUnidad)) {
        map.set(`${n.inscripcion}-${n.unidad}`, { id: n.id, nota: n.nota, es_mejoramiento: n.es_mejoramiento });
      }
    });
    return map;
  }, [notas, selUnidad]);

  // Edición inline de nota
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const getNotaKey = (inscripcionId: number, unidadId: number) => `${inscripcionId}-${unidadId}`;

  const handleGuardarNota = async (inscripcionId: number, unidadId: number) => {
    const key = getNotaKey(inscripcionId, unidadId);
    const valor = editValues[key];
    if (valor === undefined || valor === '') return;
    const nota = parseFloat(valor);
    if (isNaN(nota) || nota < 0 || nota > 100) return;

    const existente = notasMap.get(key);
    try {
      if (existente) {
        await actualizarNota({ id: existente.id, nota });
      } else {
        await crearNota({
          inscripcion: inscripcionId,
          asignacion: Number(selAsignacion),
          unidad: unidadId,
          nota,
        });
      }
      setEditValues(prev => { const n = { ...prev }; delete n[key]; return n; });
    } catch (err) {
      console.error('Error guardando nota:', err);
    }
  };


  return (
    <div className="calificaciones-container">

      {/* Header */}
      <div className="calificaciones-header">
        <div>
          <h2>Registro de Calificaciones</h2>
          <p className="calificaciones-subtitle">Seleccione el salón, el curso y la unidad para registrar notas.</p>
        </div>
      </div>

      {/* Selectores en cascada */}
      <div className="selectores-cascade">
        <div className="selector-group">
          <label>Ciclo Escolar</label>
          <select className="sel-input" value={selCiclo} onChange={e => {
            setSelCiclo(e.target.value === '' ? '' : Number(e.target.value));
            setSelGradoSeccion(''); setSelAsignacion(''); setSelUnidad('');
          }}>
            <option value="">-- Seleccione --</option>
            {ciclos.map(c => <option key={c.id} value={c.id}>{c.anio}</option>)}
          </select>
        </div>

        <div className="selector-arrow">→</div>

        <div className="selector-group">
          <label>Salón</label>
          <select className="sel-input" value={selGradoSeccion} onChange={e => {
            setSelGradoSeccion(e.target.value === '' ? '' : Number(e.target.value));
            setSelAsignacion(''); setSelUnidad('');
          }} disabled={!selCiclo}>
            <option value="">-- Seleccione --</option>
            {gradosSeccionesCiclo.map(gs => (
              <option key={gs.id} value={gs.id}>{gs.grado_nombre} - Sección {gs.seccion_nombre}</option>
            ))}
          </select>
        </div>

        <div className="selector-arrow">→</div>

        <div className="selector-group">
          <label>Curso</label>
          <select className="sel-input" value={selAsignacion} onChange={e => {
            setSelAsignacion(e.target.value === '' ? '' : Number(e.target.value));
          }} disabled={!selGradoSeccion}>
            <option value="">-- Seleccione --</option>
            {asignacionesSalon.map(a => (
              <option key={a.id} value={a.id}>{a.curso_nombre} ({a.docente_apellido})</option>
            ))}
          </select>
        </div>

        <div className="selector-arrow">→</div>

        <div className="selector-group">
          <label>Unidad</label>
          <select className="sel-input" value={selUnidad} onChange={e =>
            setSelUnidad(e.target.value === '' ? '' : Number(e.target.value))
          } disabled={!selAsignacion}>
            <option value="">-- Seleccione --</option>
            {unidadesCiclo.map((u: Unidad) => (
              <option key={u.id} value={u.id}>U{u.numero} - {u.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla de notas */}
      {!selAsignacion || !selUnidad ? (
        <div className="panel-placeholder">
          <div className="placeholder-icon">📋</div>
          <p>Complete los filtros anteriores para mostrar el listado de alumnos y registrar sus notas.</p>
        </div>
      ) : notasLoading ? (
        <div className="loading-state">Cargando datos...</div>
      ) : inscripciones.length === 0 ? (
        <div className="empty-state">No hay alumnos inscritos en este salón.</div>
      ) : (
        <div className="notas-table-wrapper">
          <div className="notas-table-header">
            <span className="notas-table-title">
              {asignaciones.find(a => a.id === Number(selAsignacion))?.curso_nombre} —{' '}
              {unidadesCiclo.find((u: Unidad) => u.id === Number(selUnidad))?.nombre}
            </span>
            <span className="notas-count">{inscripciones.length} alumnos</span>
          </div>
          <table className="notas-table">
            <thead>
              <tr>
                <th>CUI</th>
                <th>Apellidos, Nombres</th>
                <th className="th-nota">Nota (0-100)</th>
                <th className="th-estado">Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.map(ins => {
                const key = getNotaKey(ins.id, Number(selUnidad));
                const notaActual = notasMap.get(key);
                const editVal = editValues[key];
                const valor = editVal !== undefined ? editVal : (notaActual?.nota ?? '');
                const aprobada = notaActual ? parseFloat(notaActual.nota) >= 60 : null;

                return (
                  <tr key={ins.id}>
                    <td className="td-cui">{ins.estudiante_cui}</td>
                    <td><strong>{ins.estudiante_apellido}</strong>, {ins.estudiante_nombre}</td>
                    <td className="td-nota">
                      <input
                        type="number"
                        className="nota-input"
                        min={0}
                        max={100}
                        step={0.01}
                        value={valor}
                        onChange={e => setEditValues(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder="—"
                      />
                    </td>
                    <td>
                      {notaActual ? (
                        <span className={`estado-nota ${aprobada ? 'aprobado' : 'reprobado'}`}>
                          {aprobada ? '✓ Aprobado' : '✗ Reprobado'}
                        </span>
                      ) : (
                        <span className="estado-nota pendiente">Pendiente</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn-guardar-nota"
                        onClick={() => handleGuardarNota(ins.id, Number(selUnidad))}
                        disabled={isCreating || editVal === undefined}
                      >
                        Guardar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Calificaciones;
