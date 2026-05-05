import React, { useState, useMemo } from 'react';
import { useGrados } from '../../hooks/useGrados';
import { useSecciones } from '../../hooks/useSecciones';
import { useCiclos } from '../../hooks/useCiclos';
import { useGradoSeccion } from '../../hooks/useGradoSeccion';
import './GradosSecciones.css';

const GradosSecciones: React.FC = () => {
  const { grados, crearGrado, eliminarGrado } = useGrados();
  const { secciones, crearSeccion, eliminarSeccion } = useSecciones();
  const { ciclos, crearCiclo } = useCiclos();
  const { gradosSecciones, crearGradoSeccion, eliminarGradoSeccion } = useGradoSeccion();

  // Estados locales para formularios
  const [nuevoGrado, setNuevoGrado] = useState('');
  const [nuevaSeccion, setNuevaSeccion] = useState('');
  
  // Estado para el ciclo seleccionado
  const [cicloActivoId, setCicloActivoId] = useState<number | ''>('');
  
  // Estados para crear ciclo
  const [mostrarFormCiclo, setMostrarFormCiclo] = useState(false);
  const [nuevoCicloAnio, setNuevoCicloAnio] = useState(new Date().getFullYear());
  const [nuevoCicloInicio, setNuevoCicloInicio] = useState('');
  const [nuevoCicloFin, setNuevoCicloFin] = useState('');

  // Estados para crear union Grado-Seccion
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number | ''>('');
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<number | ''>('');

  // Filtrar uniones por ciclo activo
  const unionesDelCiclo = useMemo(() => {
    if (!cicloActivoId) return [];
    return gradosSecciones.filter((gs) => gs.ciclo === Number(cicloActivoId));
  }, [gradosSecciones, cicloActivoId]);

  // Handlers Catálogos
  const handleCrearGrado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoGrado.trim()) return;
    try {
      await crearGrado(nuevoGrado);
      setNuevoGrado('');
    } catch (err) {
      alert('Error al crear grado');
    }
  };

  const handleCrearSeccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaSeccion.trim()) return;
    try {
      await crearSeccion(nuevaSeccion);
      setNuevaSeccion('');
    } catch (err) {
      alert('Error al crear sección');
    }
  };

  // Handler Ciclo
  const handleCrearCiclo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const ciclo = await crearCiclo({
        anio: nuevoCicloAnio,
        fecha_inicio: nuevoCicloInicio,
        fecha_fin: nuevoCicloFin
      });
      setCicloActivoId(ciclo.id);
      setMostrarFormCiclo(false);
    } catch (err) {
      alert('Error al crear ciclo');
    }
  };

  // Handler Union
  const handleCrearUnion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cicloActivoId || !gradoSeleccionado || !seccionSeleccionada) return;
    try {
      await crearGradoSeccion({
        grado: Number(gradoSeleccionado),
        seccion: Number(seccionSeleccionada),
        ciclo: Number(cicloActivoId)
      });
      setGradoSeleccionado('');
      setSeccionSeleccionada('');
    } catch (err) {
      alert('Error al crear la unión (puede que ya exista)');
    }
  };

  return (
    <div className="grados-secciones-container">
      
      {/* Selector de Ciclo Escolar */}
      <div className="panel-ciclo top-panel">
        <div className="ciclo-header">
          <h2>Configuración para el Ciclo Escolar</h2>
          <div className="ciclo-actions">
            <select 
              value={cicloActivoId} 
              onChange={(e) => setCicloActivoId(e.target.value === '' ? '' : Number(e.target.value))}
              className="ciclo-select"
            >
              <option value="">-- Seleccione un Ciclo --</option>
              {ciclos.map(c => (
                <option key={c.id} value={c.id}>{c.anio}</option>
              ))}
            </select>
            <button className="btn-outline" onClick={() => setMostrarFormCiclo(!mostrarFormCiclo)}>
              {mostrarFormCiclo ? 'Cancelar' : '+ Nuevo Ciclo'}
            </button>
          </div>
        </div>

        {mostrarFormCiclo && (
          <form className="form-ciclo" onSubmit={handleCrearCiclo}>
            <div className="form-row">
              <div className="form-group">
                <label>Año</label>
                <input type="number" value={nuevoCicloAnio} onChange={e => setNuevoCicloAnio(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label>Fecha Inicio</label>
                <input type="date" value={nuevoCicloInicio} onChange={e => setNuevoCicloInicio(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Fecha Fin</label>
                <input type="date" value={nuevoCicloFin} onChange={e => setNuevoCicloFin(e.target.value)} required />
              </div>
              <button type="submit" className="btn-submit align-bottom">Guardar Ciclo</button>
            </div>
          </form>
        )}
      </div>

      <div className="tres-columnas">
        {/* Columna Grados */}
        <div className="panel catalogo-panel">
          <h3>Catálogo de Grados</h3>
          <form className="catalogo-form" onSubmit={handleCrearGrado}>
            <input 
              type="text" 
              placeholder="Ej. Primero Básico" 
              value={nuevoGrado} 
              onChange={e => setNuevoGrado(e.target.value)} 
            />
            <button type="submit" className="btn-submit">+</button>
          </form>
          <ul className="catalogo-list">
            {grados.map(g => (
              <li key={g.id}>
                <span>{g.nombre}</span>
                <button onClick={() => eliminarGrado(g.id)} className="btn-eliminar-small">×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna Secciones */}
        <div className="panel catalogo-panel">
          <h3>Catálogo de Secciones</h3>
          <form className="catalogo-form" onSubmit={handleCrearSeccion}>
            <input 
              type="text" 
              placeholder="Ej. A" 
              maxLength={10}
              value={nuevaSeccion} 
              onChange={e => setNuevaSeccion(e.target.value)} 
            />
            <button type="submit" className="btn-submit">+</button>
          </form>
          <ul className="catalogo-list">
            {secciones.map(s => (
              <li key={s.id}>
                <span>{s.nombre}</span>
                <button onClick={() => eliminarSeccion(s.id)} className="btn-eliminar-small">×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna Uniones (Grado-Seccion) */}
        <div className="panel union-panel">
          <h3>Salones Asignados (Grado + Sección)</h3>
          {!cicloActivoId ? (
            <div className="empty-message">Seleccione un ciclo escolar arriba para ver o asignar salones.</div>
          ) : (
            <>
              <form className="union-form" onSubmit={handleCrearUnion}>
                <select value={gradoSeleccionado} onChange={e => setGradoSeleccionado(e.target.value === '' ? '' : Number(e.target.value))} required>
                  <option value="">-- Grado --</option>
                  {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
                <select value={seccionSeleccionada} onChange={e => setSeccionSeleccionada(e.target.value === '' ? '' : Number(e.target.value))} required>
                  <option value="">-- Sección --</option>
                  {secciones.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
                <button type="submit" className="btn-submit">Unir</button>
              </form>

              <div className="uniones-list-container">
                {unionesDelCiclo.length === 0 ? (
                  <div className="empty-message-small">No hay salones asignados a este ciclo.</div>
                ) : (
                  <table className="uniones-table">
                    <thead>
                      <tr>
                        <th>Grado</th>
                        <th>Sección</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {unionesDelCiclo.map(u => (
                        <tr key={u.id}>
                          <td>{u.grado_nombre}</td>
                          <td>{u.seccion_nombre}</td>
                          <td>
                            <button onClick={() => eliminarGradoSeccion(u.id)} className="btn-eliminar-small">Quitar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradosSecciones;
