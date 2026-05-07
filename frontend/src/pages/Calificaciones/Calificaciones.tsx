import React, { useState, useMemo, useEffect } from 'react';
import { useNotas } from '../../hooks/useNotas';
import { useAsignaciones } from '../../hooks/useAsignaciones';
import { useCiclos } from '../../hooks/useCiclos';
import { useDocentes } from '../../hooks/useDocentes';
import { useAuth } from '../../store/useAuth';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Calificaciones.css';


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

const Calificaciones: React.FC = () => {
  const { user } = useAuth();
  const { ciclos } = useCiclos();
  const { asignaciones } = useAsignaciones();
  const { gradosSecciones } = useGradosSecciones();
  const { docentes } = useDocentes();

  // Selección en cascada
  const [selCiclo, setSelCiclo] = useState<number | ''>('');
  const [selGradoSeccion, setSelGradoSeccion] = useState<number | ''>('');
  const [selAsignacion, setSelAsignacion] = useState<number | ''>('');
  const [selUnidad, setSelUnidad] = useState<number | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [verDetalles, setVerDetalles] = useState<Inscripcion | null>(null);
  const [modo, setModo] = useState<'ingreso' | 'consulta'>('ingreso');
  const [globalStudent, setGlobalStudent] = useState<Inscripcion | null>(null);

  const { notas, isLoading: notasLoading, crearNota, actualizarNota, isCreating } = useNotas(
    selAsignacion ? { asignacion: Number(selAsignacion) } : undefined
  );
  const { inscripciones } = useInscripcionesSalon(selGradoSeccion);

  const docenteActual = useMemo(() => {
    if (!user) return null;
    return docentes.find(d => (d.persona as any).usuario_id === user.id);
  }, [user, docentes]);

  const esDocente = user?.roles.some(r => r.toLowerCase() === 'docente');

  const ciclosDisponibles = useMemo(() => {
    if (!esDocente || !docenteActual) return ciclos;
    const misAsignaciones = asignaciones.filter(a => a.docente === docenteActual.id);
    const misCicloIds = new Set(gradosSecciones.filter(gs => misAsignaciones.some(a => a.grado_seccion === gs.id)).map(gs => gs.ciclo));
    return ciclos.filter(c => misCicloIds.has(c.id));
  }, [ciclos, esDocente, docenteActual, asignaciones, gradosSecciones]);

  const unidadesCiclo = useMemo(() => {
    if (!selCiclo) return [];
    const ciclo = ciclos.find(c => c.id === Number(selCiclo));
    return ciclo ? [...ciclo.unidades].sort((a: Unidad, b: Unidad) => a.numero - b.numero) : [];
  }, [ciclos, selCiclo]);

  const gradosSeccionesCiclo = useMemo(() => {
    const gsBase = selCiclo ? gradosSecciones.filter(gs => gs.ciclo === Number(selCiclo)) : [];
    if (!esDocente || !docenteActual) return gsBase;
    const misAsignaciones = asignaciones.filter(a => a.docente === docenteActual.id);
    return gsBase.filter(gs => misAsignaciones.some(a => a.grado_seccion === gs.id));
  }, [gradosSecciones, selCiclo, esDocente, docenteActual, asignaciones]);

  const asignacionesSalon = useMemo(() => {
    const aBase = selGradoSeccion ? asignaciones.filter(a => a.grado_seccion === Number(selGradoSeccion)) : [];
    if (!esDocente || !docenteActual) return aBase;
    return aBase.filter(a => a.docente === docenteActual.id);
  }, [asignaciones, selGradoSeccion, esDocente, docenteActual]);

  const filteredInscripciones = useMemo(() => {
    const base = modo === 'consulta' ? (selCiclo ? [] : []) : inscripciones; 
    // Para consulta global necesitamos todas las inscripciones del ciclo
    // Pero useInscripcionesSalon solo trae las de un salón.
    // Vamos a simplificar: si es consulta, buscar entre todas las inscripciones del ciclo.
    return inscripciones.filter(ins => {
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
      return ins.estudiante_nombre.toLowerCase().includes(s) || 
             ins.estudiante_apellido.toLowerCase().includes(s) ||
             ins.estudiante_cui.includes(s);
    });
  }, [inscripciones, searchTerm, modo, selCiclo]);

  // Hook extra para búsqueda global en modo consulta
  const { data: todasInscripcionesCiclo } = useQuery<Inscripcion[]>({
    queryKey: ['todas-inscripciones-ciclo', selCiclo],
    queryFn: async () => {
      const resp = await api.get('/inscripciones/');
      // Filtrar por ciclo (necesitamos unir con grado_seccion)
      return resp.data.filter((i: any) => {
        const gs = gradosSecciones.find(g => g.id === i.grado_seccion);
        return gs && gs.ciclo === Number(selCiclo);
      });
    },
    enabled: modo === 'consulta' && !!selCiclo,
  });

  const filteredGlobal = useMemo(() => {
    if (!todasInscripcionesCiclo || !searchTerm) return todasInscripcionesCiclo || [];
    const s = searchTerm.toLowerCase();
    return todasInscripcionesCiclo.filter(ins => 
      ins.estudiante_nombre.toLowerCase().includes(s) || 
      ins.estudiante_apellido.toLowerCase().includes(s) ||
      ins.estudiante_cui.includes(s)
    );
  }, [todasInscripcionesCiclo, searchTerm]);

  const notasMap = useMemo(() => {
    const map = new Map<string, { id: number; nota: string; es_mejoramiento: boolean }>();
    notas.forEach(n => {
      if (!selUnidad || n.unidad === Number(selUnidad)) {
        map.set(`${n.inscripcion}-${n.unidad}`, { id: n.id, nota: n.nota, es_mejoramiento: n.es_mejoramiento });
      }
    });
    return map;
  }, [notas, selUnidad]);

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
    <div className="module-container">
      <div className="module-header">
        <div className="header-text">
          <h1>Gestión de Calificaciones</h1>
          <p>Administre y consulte el rendimiento académico de los estudiantes.</p>
        </div>
      </div>

      <div className="module-tabs" style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          className={`tab-btn ${modo === 'ingreso' ? 'active' : ''}`} 
          onClick={() => { setModo('ingreso'); setGlobalStudent(null); }}
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: modo === 'ingreso' ? '3px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: 600, color: modo === 'ingreso' ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          📝 Ingreso de Notas
        </button>
        <button 
          className={`tab-btn ${modo === 'consulta' ? 'active' : ''}`} 
          onClick={() => { setModo('consulta'); setGlobalStudent(null); }}
          style={{ padding: '12px 24px', background: 'none', border: 'none', borderBottom: modo === 'consulta' ? '3px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: 600, color: modo === 'consulta' ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          📊 Consulta Global / Boletas
        </button>
      </div>

      <div className="selectores-cascade card animated fadeIn">
        <div style={{ display: 'grid', gridTemplateColumns: modo === 'ingreso' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)', gap: '16px' }}>
          <div className="form-group">
            <label>Ciclo Lectivo</label>
            <select className="input-field" value={selCiclo} onChange={e => {
              setSelCiclo(e.target.value === '' ? '' : Number(e.target.value));
              setSelGradoSeccion(''); setSelAsignacion(''); setSelUnidad(''); setGlobalStudent(null);
            }}>
              <option value="">-- Seleccionar --</option>
              {ciclosDisponibles.map(c => <option key={c.id} value={c.id}>{c.anio}</option>)}
            </select>
          </div>

          {modo === 'ingreso' ? (
            <>
              <div className="form-group">
                <label>Salón / Grado</label>
                <select className="input-field" value={selGradoSeccion} onChange={e => {
                  setSelGradoSeccion(e.target.value === '' ? '' : Number(e.target.value));
                  setSelAsignacion(''); setSelUnidad('');
                }} disabled={!selCiclo}>
                  <option value="">-- Seleccionar --</option>
                  {gradosSeccionesCiclo.map(gs => (
                    <option key={gs.id} value={gs.id}>{gs.grado_nombre} - {gs.seccion_nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Materia / Curso</label>
                <select className="input-field" value={selAsignacion} onChange={e => {
                  setSelAsignacion(e.target.value === '' ? '' : Number(e.target.value));
                  setSelUnidad('');
                }} disabled={!selGradoSeccion}>
                  <option value="">-- Seleccionar --</option>
                  {asignacionesSalon.map(a => (
                    <option key={a.id} value={a.id}>{a.curso_nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Unidad Evaluativa</label>
                <select className="input-field" value={selUnidad} onChange={e =>
                  setSelUnidad(e.target.value === '' ? '' : Number(e.target.value))
                } disabled={!selAsignacion}>
                  <option value="">-- Seleccionar --</option>
                  {unidadesCiclo.map((u: Unidad) => (
                    <option key={u.id} value={u.id}>Unidad {u.numero}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div className="form-group">
              <label>Buscar Alumno (Nombre o CUI)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Escriba para buscar..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                disabled={!selCiclo}
              />
            </div>
          )}
        </div>
      </div>

      {modo === 'consulta' && selCiclo && !globalStudent && (
        <div className="search-results animated fadeIn" style={{ marginTop: '16px' }}>
          {filteredGlobal.length > 0 ? (
            <div className="card" style={{ padding: '0' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {filteredGlobal.slice(0, 5).map(ins => (
                  <li 
                    key={ins.id} 
                    onClick={() => setGlobalStudent(ins)}
                    style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    className="hover-bg"
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>{ins.estudiante_nombre} {ins.estudiante_apellido}</span>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>CUI: {ins.estudiante_cui}</p>
                    </div>
                    <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }}>Seleccionar</button>
                  </li>
                ))}
              </ul>
            </div>
          ) : searchTerm && (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No se encontraron alumnos en este ciclo.</p>
          )}
        </div>
      )}

      {modo === 'consulta' && globalStudent && (
        <VistaBoletaGlobal 
          student={globalStudent} 
          cicloId={Number(selCiclo)} 
          unidades={unidadesCiclo}
          onBack={() => setGlobalStudent(null)}
        />
      )}

      {modo === 'ingreso' && (
        (!selAsignacion || !selUnidad) ? (
          <div className="panel-placeholder card" style={{ marginTop: '24px', textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📊</div>
            <h3 style={{ color: 'var(--text-main)' }}>Esperando Selección</h3>
            <p style={{ color: 'var(--text-muted)' }}>Utilice los filtros superiores para cargar el listado de alumnos y registrar sus calificaciones.</p>
          </div>
        ) : (
          <div className="table-container animated fadeIn" style={{ marginTop: '24px' }}>
            <div className="table-header-info card" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
              <div>
                <span className="badge-info" style={{ marginRight: '12px' }}>{asignaciones.find(a => a.id === Number(selAsignacion))?.curso_nombre}</span>
                <span className="badge-success">Unidad {unidadesCiclo.find((u: Unidad) => u.id === Number(selUnidad))?.numero}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="search-input-wrapper">
                  <input 
                    type="text" 
                    placeholder="Filtrar por nombre o CUI..." 
                    className="input-field" 
                    style={{ width: '250px', padding: '8px 12px' }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {filteredInscripciones.length} Alumnos
                </span>
              </div>
            </div>

            <table className="modern-table">
              <thead>
                <tr>
                  <th>CUI / Estudiante</th>
                  <th className="text-center" style={{ width: '150px' }}>Nota (0-100)</th>
                  <th className="text-center">Estado</th>
                  <th className="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredInscripciones.length === 0 ? (
                  <tr><td colSpan={4} className="text-center empty-row">No se encontraron alumnos.</td></tr>
                ) : (
                  filteredInscripciones.map(ins => {
                    const key = getNotaKey(ins.id, Number(selUnidad));
                    const notaActual = notasMap.get(key);
                    const editVal = editValues[key];
                    const valor = editVal !== undefined ? editVal : (notaActual?.nota ?? '');
                    const aprobada = notaActual ? parseFloat(notaActual.nota) >= 60 : null;

                    return (
                      <tr key={ins.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-sm" style={{ backgroundColor: '#eff6ff', color: '#1e40af' }}>{ins.estudiante_nombre.charAt(0)}</div>
                            <div>
                              <div className="user-name-cell">{ins.estudiante_apellido}, {ins.estudiante_nombre}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ins.estudiante_cui}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <input
                            type="number"
                            className="input-field text-center"
                            style={{ maxWidth: '80px', fontWeight: 700, fontSize: '16px' }}
                            min={0} max={100} step={0.01}
                            value={valor}
                            onChange={e => setEditValues(prev => ({ ...prev, [key]: e.target.value }))}
                            placeholder="—"
                          />
                        </td>
                        <td className="text-center">
                          {notaActual ? (
                            <span className={`badge ${aprobada ? 'badge-success' : 'badge-danger'}`} style={{ minWidth: '100px' }}>
                              {aprobada ? 'Aprobado' : 'Reprobado'}
                            </span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#64748b', minWidth: '100px' }}>Pendiente</span>
                          )}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn-primary"
                            style={{ padding: '8px 16px', fontSize: '12px', marginRight: '8px' }}
                            onClick={() => handleGuardarNota(ins.id, Number(selUnidad))}
                            disabled={isCreating || editVal === undefined}
                          >
                            {isCreating ? '...' : 'Guardar'}
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: '8px 16px', fontSize: '12px' }}
                            onClick={() => setVerDetalles(ins)}
                          >
                            🔍 Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )
      )}

      {verDetalles && (
        <ModalDetallesNota
          isOpen={!!verDetalles}
          onClose={() => setVerDetalles(null)}
          inscripcion={verDetalles}
          asignacionId={Number(selAsignacion)}
          unidades={unidadesCiclo}
          todasLasNotas={notas}
        />
      )}
    </div>
  );
};

// --- COMPONENTE MODAL DETALLES ---
const ModalDetallesNota: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  inscripcion: Inscripcion;
  asignacionId: number;
  unidades: Unidad[];
  todasLasNotas: any[];
}> = ({ isOpen, onClose, inscripcion, asignacionId, unidades, todasLasNotas }) => {
  const { asignaciones } = useAsignaciones();
  if (!isOpen) return null;

  const cursoActual = asignaciones.find(a => a.id === asignacionId);
  const nombreCurso = cursoActual ? cursoActual.curso_nombre : 'Curso No Identificado';

  const notasAlumno = todasLasNotas.filter(n => n.inscripcion === inscripcion.id);
  const promedio = notasAlumno.length > 0 
    ? (notasAlumno.reduce((acc, n) => acc + parseFloat(n.nota), 0) / unidades.length).toFixed(2)
    : '0.00';

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(124, 58, 237);
    doc.text('FICHA DE CALIFICACIONES', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Sistema de Gestión Educativa INBACOOP', 105, 28, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`Estudiante: ${inscripcion.estudiante_nombre} ${inscripcion.estudiante_apellido}`, 20, 45);
    doc.text(`CUI: ${inscripcion.estudiante_cui}`, 20, 52);
    doc.text(`Materia: ${nombreCurso}`, 20, 59);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 66);

    const tableData = unidades.map(u => {
      const nota = notasAlumno.find(n => n.unidad === u.id);
      const valor = nota ? parseFloat(nota.nota) : 0;
      return [`Unidad ${u.numero}`, nota ? valor.toFixed(2) : 'N/A', nota ? (valor >= 60 ? 'APROBADO' : 'REPROBADO') : 'PENDIENTE'];
    });

    autoTable(doc, {
      startY: 70,
      head: [['Unidad', 'Nota', 'Resultado']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [124, 58, 237] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`PROMEDIO: ${promedio}`, 20, finalY + 15);
    doc.save(`Ficha_${inscripcion.estudiante_cui}.pdf`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h3>Detalles de Calificaciones</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
            <h4 style={{ margin: 0 }}>{inscripcion.estudiante_nombre} {inscripcion.estudiante_apellido}</h4>
            <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 600 }}>{nombreCurso}</p>
            <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>CUI: {inscripcion.estudiante_cui}</p>
          </div>

          <table className="modern-table mini">
            <thead>
              <tr><th>Unidad</th><th className="text-center">Nota</th></tr>
            </thead>
            <tbody>
              {unidades.map(u => {
                const nota = notasAlumno.find(n => n.unidad === u.id);
                return (
                  <tr key={u.id}>
                    <td>Unidad {u.numero}</td>
                    <td className="text-center font-bold">{nota ? nota.nota : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: '15px', textAlign: 'right', fontWeight: 700 }}>Promedio: {promedio}</div>
        </div>
        <div className="modal-actions" style={{ justifyContent: 'center', gap: '12px' }}>
          <button className="btn-secondary" onClick={onClose}>Cerrar</button>
          <button className="btn-primary" onClick={handleDownloadPDF}>Descargar PDF</button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE VISTA BOLETA GLOBAL ---
const VistaBoletaGlobal: React.FC<{
  student: Inscripcion;
  cicloId: number;
  unidades: Unidad[];
  onBack: () => void;
}> = ({ student, cicloId, unidades, onBack }) => {
  const { asignaciones } = useAsignaciones();
  const { data: todasLasNotas, isLoading } = useQuery({
    queryKey: ['notas-global-alumno', student.id],
    queryFn: async () => (await api.get(`/notas/?inscripcion=${student.id}`)).data
  });

  const asignacionesSalon = useMemo(() => {
    return asignaciones.filter(a => a.grado_seccion === student.grado_seccion);
  }, [asignaciones, student]);

  const handleDownloadFullBoleta = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(20);
    doc.setTextColor(124, 58, 237);
    doc.text('BOLETA OFICIAL DE CALIFICACIONES', 148, 20, { align: 'center' });
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139);
    doc.text(`Sistema de Gestión Educativa - Ciclo ${new Date().getFullYear()}`, 148, 28, { align: 'center' });

    doc.setTextColor(30, 41, 59);
    doc.text(`Estudiante: ${student.estudiante_nombre} ${student.estudiante_apellido}`, 20, 45);
    doc.text(`CUI: ${student.estudiante_cui}`, 20, 52);

    const head = [['Curso', ...unidades.map(u => `U${u.numero}`), 'Promedio']];
    const body = asignacionesSalon.map(a => {
      let suma = 0; let count = 0;
      const row = [a.curso_nombre];
      unidades.forEach(u => {
        const nota = todasLasNotas?.find((n: any) => n.asignacion === a.id && n.unidad === u.id);
        if (nota) {
          const val = parseFloat(nota.nota);
          row.push(val.toFixed(0)); suma += val; count++;
        } else row.push('-');
      });
      row.push(count > 0 ? (suma / count).toFixed(2) : '0.00');
      return row;
    });

    autoTable(doc, {
      startY: 60, head: head, body: body, theme: 'striped', headStyles: { fillColor: [124, 58, 237] },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.line(40, finalY + 40, 100, finalY + 40);
    doc.text('Firma Director(a)', 70, finalY + 45, { align: 'center' });
    doc.line(190, finalY + 40, 250, finalY + 40);
    doc.text('Firma Docente', 220, finalY + 45, { align: 'center' });

    doc.save(`Boleta_${student.estudiante_cui}.pdf`);
  };

  if (isLoading) return <div className="loader">Cargando datos...</div>;

  return (
    <div className="boleta-global-container animated slideUp" style={{ marginTop: '24px' }}>
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <button className="btn-secondary" onClick={onBack} style={{ marginBottom: '12px' }}>← Volver</button>
            <h2 style={{ margin: 0 }}>Historial: {student.estudiante_nombre} {student.estudiante_apellido}</h2>
          </div>
          <button className="btn-primary" onClick={handleDownloadFullBoleta}>📥 Descargar Boleta Completa</button>
        </div>
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Curso</th>
                {unidades.map(u => <th key={u.id} className="text-center">U{u.numero}</th>)}
                <th className="text-center">Promedio</th>
              </tr>
            </thead>
            <tbody>
              {asignacionesSalon.map(a => {
                let suma = 0; let count = 0;
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.curso_nombre}</td>
                    {unidades.map(u => {
                      const nota = todasLasNotas?.find((n: any) => n.asignacion === a.id && n.unidad === u.id);
                      if (nota) { suma += parseFloat(nota.nota); count++; }
                      return <td key={u.id} className="text-center">{nota ? nota.nota : '-'}</td>;
                    })}
                    <td className="text-center font-bold">{(count > 0 ? suma / count : 0).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Calificaciones;
