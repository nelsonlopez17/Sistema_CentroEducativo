import React, { useState, useMemo } from 'react';
import { useCursos } from '../../hooks/useCursos';
import { usePensum } from '../../hooks/usePensum';
import { useGrados } from '../../hooks/useGrados';
import './CursosPensum.css';

const CursosPensum: React.FC = () => {
  // Hooks
  const { cursos, crearCurso, eliminarCurso } = useCursos();
  const { grados } = useGrados();
  const { pensumGeneral, crearPensum, eliminarPensum } = usePensum();

  // Estados Locales para Cursos
  const [nuevoCursoNombre, setNuevoCursoNombre] = useState('');
  const [nuevoCursoDesc, setNuevoCursoDesc] = useState('');

  // Estados Locales para Pensum
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number | ''>('');
  const [cursoAAsignar, setCursoAAsignar] = useState<number | ''>('');

  // Filtrar Pensum por Grado Seleccionado
  const pensumDelGrado = useMemo(() => {
    if (!gradoSeleccionado) return [];
    return pensumGeneral.filter(p => p.grado === Number(gradoSeleccionado));
  }, [pensumGeneral, gradoSeleccionado]);

  // Handlers
  const handleCrearCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoCursoNombre.trim()) return;
    try {
      await crearCurso({ nombre: nuevoCursoNombre, descripcion: nuevoCursoDesc });
      setNuevoCursoNombre('');
      setNuevoCursoDesc('');
    } catch (err) {
      alert('Error al crear el curso');
    }
  };

  const handleAsignarCurso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradoSeleccionado || !cursoAAsignar) return;
    try {
      await crearPensum({ grado: Number(gradoSeleccionado), curso: Number(cursoAAsignar) });
      setCursoAAsignar('');
    } catch (err) {
      alert('Error al asignar el curso al pensum (puede que ya esté asignado)');
    }
  };

  return (
    <div className="cursos-pensum-container">
      <div className="dos-columnas">
        
        {/* PANEL IZQUIERDO: CATÁLOGO DE CURSOS */}
        <div className="panel catalogo-cursos-panel">
          <div className="panel-header">
            <h2>Catálogo Global de Cursos</h2>
            <p>Agrega aquí todas las materias que ofrece la institución.</p>
          </div>

          <form className="form-crear-curso" onSubmit={handleCrearCurso}>
            <div className="form-group">
              <label>Nombre del Curso</label>
              <input 
                type="text" 
                placeholder="Ej. Matemáticas" 
                value={nuevoCursoNombre} 
                onChange={e => setNuevoCursoNombre(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Descripción (Opcional)</label>
              <textarea 
                placeholder="Ej. Curso de matemáticas avanzadas..."
                value={nuevoCursoDesc}
                onChange={e => setNuevoCursoDesc(e.target.value)}
                rows={2}
              />
            </div>
            <button type="submit" className="btn-submit">Guardar Curso</button>
          </form>

          <div className="cursos-list-container">
            {cursos.length === 0 ? (
              <div className="empty-message-small">No hay cursos registrados.</div>
            ) : (
              <ul className="cursos-list">
                {cursos.map(curso => (
                  <li key={curso.id}>
                    <div className="curso-info">
                      <span className="curso-nombre">{curso.nombre}</span>
                      {curso.descripcion && <span className="curso-desc">{curso.descripcion}</span>}
                    </div>
                    <button onClick={() => eliminarCurso(curso.id)} className="btn-eliminar-small">×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* PANEL DERECHO: PENSUM DE ESTUDIOS */}
        <div className="panel pensum-panel">
          <div className="panel-header">
            <h2>Configurador de Pensum</h2>
            <p>Selecciona un grado para gestionar las materias que lo componen.</p>
          </div>

          <div className="selector-grado">
            <label>Grado a configurar:</label>
            <select 
              value={gradoSeleccionado} 
              onChange={e => setGradoSeleccionado(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">-- Seleccione un Grado --</option>
              {grados.map(g => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </div>

          {!gradoSeleccionado ? (
            <div className="empty-message">Por favor, selecciona un grado para ver su pensum.</div>
          ) : (
            <div className="pensum-content">
              {/* Formulario para asignar curso */}
              <form className="form-asignar-curso" onSubmit={handleAsignarCurso}>
                <select 
                  value={cursoAAsignar} 
                  onChange={e => setCursoAAsignar(e.target.value === '' ? '' : Number(e.target.value))} 
                  required
                >
                  <option value="">-- Seleccione un Curso para asignar --</option>
                  {cursos.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                <button type="submit" className="btn-submit">Asignar</button>
              </form>

              {/* Tabla de Pensum */}
              <div className="pensum-list-container">
                <h3>Materias asignadas a este grado:</h3>
                {pensumDelGrado.length === 0 ? (
                  <div className="empty-message-small">Este grado aún no tiene materias en su pensum.</div>
                ) : (
                  <table className="uniones-table">
                    <thead>
                      <tr>
                        <th>Materia (Curso)</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pensumDelGrado.map(p => (
                        <tr key={p.id}>
                          <td>{p.curso_nombre}</td>
                          <td style={{ width: '80px', textAlign: 'center' }}>
                            <button 
                              className="btn-eliminar-small" 
                              onClick={() => eliminarPensum(p.id)}
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CursosPensum;
