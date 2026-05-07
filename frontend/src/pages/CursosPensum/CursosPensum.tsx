import React, { useState, useMemo } from 'react';
import { useCursos } from '../../hooks/useCursos';
import { usePensum } from '../../hooks/usePensum';
import { useGrados } from '../../hooks/useGrados';
import './CursosPensum.css';

const CursosPensum: React.FC = () => {
  const { cursos, crearCurso, eliminarCurso } = useCursos();
  const { grados } = useGrados();
  const { pensumGeneral, crearPensum, eliminarPensum } = usePensum();

  const [nuevoCursoNombre, setNuevoCursoNombre] = useState('');
  const [nuevoCursoDesc, setNuevoCursoDesc] = useState('');
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number | ''>('');
  const [cursoAAsignar, setCursoAAsignar] = useState<number | ''>('');

  const pensumDelGrado = useMemo(() => {
    if (!gradoSeleccionado) return [];
    return pensumGeneral.filter(p => p.grado === Number(gradoSeleccionado));
  }, [pensumGeneral, gradoSeleccionado]);

  const handleCrearCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCursoNombre.trim()) return;
    try {
      await crearCurso({ nombre: nuevoCursoNombre, descripcion: nuevoCursoDesc });
      setNuevoCursoNombre('');
      setNuevoCursoDesc('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAsignarCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradoSeleccionado || !cursoAAsignar) return;
    try {
      await crearPensum({ grado: Number(gradoSeleccionado), curso: Number(cursoAAsignar) });
      setCursoAAsignar('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-text">
          <h1>Cursos y Pensum Académico</h1>
          <p>Gestiona el catálogo de materias y su asignación por grado.</p>
        </div>
      </div>

      <div className="cursos-pensum-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', marginTop: '24px' }}>
        
        {/* PANEL IZQUIERDO: CATÁLOGO */}
        <div className="panel card">
          <div className="panel-header-simple" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Catálogo de Cursos</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Definición de materias institucionales.</p>
          </div>

          <form className="module-form-compact" onSubmit={handleCrearCurso} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Nombre de la Materia</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="Ej. Ciencias Naturales" 
                value={nuevoCursoNombre} 
                onChange={e => setNuevoCursoNombre(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Descripción</label>
              <textarea 
                className="input-field"
                placeholder="Descripción breve..."
                value={nuevoCursoDesc}
                onChange={e => setNuevoCursoDesc(e.target.value)}
                rows={2}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>Guardar en Catálogo</button>
          </form>

          <div className="cursos-list-modern" style={{ maxHeight: '350px', overflowY: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            {cursos.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No hay cursos registrados.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {cursos.map(curso => (
                  <li key={curso.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '10px', backgroundColor: '#f8fafc', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 600, display: 'block', fontSize: '14px' }}>{curso.nombre}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {curso.id}</span>
                    </div>
                    <button onClick={() => eliminarCurso(curso.id)} className="btn-icon-action delete" style={{ background: 'white' }}>×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: PENSUM */}
        <div className="panel card">
          <div className="panel-header-simple" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Estructura del Pensum</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Asignación de materias por cada grado académico.</p>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Seleccionar Grado Académico</label>
            <select 
              className="input-field"
              value={gradoSeleccionado} 
              onChange={e => setGradoSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">-- Elija un Grado para editar --</option>
              {grados.map(g => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </div>

          {gradoSeleccionado && (
            <div className="pensum-manager animated fadeIn">
              <form className="asignacion-form" onSubmit={handleAsignarCurso} style={{ display: 'flex', gap: '12px', marginBottom: '24px', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Materia a incluir</label>
                  <select 
                    className="input-field"
                    value={cursoAAsignar} 
                    onChange={e => setCursoAAsignar(e.target.value === '' ? '' : Number(e.target.value))} 
                    required
                  >
                    <option value="">-- Seleccionar curso --</option>
                    {cursos.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '10px 24px', height: '42px' }}>Incluir</button>
              </form>

              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Materia Asignada</th>
                      <th className="text-center">Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pensumDelGrado.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="text-center empty-row">No hay materias asignadas a este grado.</td>
                      </tr>
                    ) : (
                      pensumDelGrado.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.curso_nombre}</td>
                          <td className="actions-cell">
                            <button 
                              className="btn-icon-action delete" 
                              onClick={() => eliminarPensum(p.id)}
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
            </div>
          )}
          
          {!gradoSeleccionado && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '16px' }}>📚</span>
              <p>Selecciona un grado para comenzar a gestionar su pensum de estudios.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CursosPensum;

