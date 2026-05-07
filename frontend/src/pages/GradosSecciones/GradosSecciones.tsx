import React, { useState, useMemo } from 'react';
import { useGrados } from '../../hooks/useGrados';
import { useSecciones } from '../../hooks/useSecciones';
import { useCiclos } from '../../hooks/useCiclos';
import { useGradoSeccion } from '../../hooks/useGradoSeccion';
import './GradosSecciones.css';

const GradosSecciones: React.FC = () => {
  const { grados, crearGrado, eliminarGrado } = useGrados();
  const { secciones, crearSeccion, eliminarSeccion } = useSecciones();
  const { ciclos } = useCiclos();
  const { gradosSecciones, crearGradoSeccion, eliminarGradoSeccion } = useGradoSeccion();

  const [nuevoGrado, setNuevoGrado] = useState('');
  const [nuevaSeccion, setNuevaSeccion] = useState('');
  const [cicloActivoId, setCicloActivoId] = useState<number | ''>('');
  const [gradoSeleccionado, setGradoSeleccionado] = useState<number | ''>('');
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<number | ''>('');

  const unionesDelCiclo = useMemo(() => {
    if (!cicloActivoId) return [];
    return gradosSecciones.filter((gs) => gs.ciclo === Number(cicloActivoId));
  }, [gradosSecciones, cicloActivoId]);

  const handleCrearGrado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoGrado.trim()) return;
    try {
      await crearGrado(nuevoGrado);
      setNuevoGrado('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCrearSeccion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaSeccion.trim()) return;
    try {
      await crearSeccion(nuevaSeccion);
      setNuevaSeccion('');
    } catch (err) {
      console.error(err);
    }
  };

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
      console.error(err);
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-text">
          <h1>Grados, Secciones y Salones</h1>
          <p>Define los niveles académicos y conforma los salones por ciclo escolar.</p>
        </div>
        <div className="header-controls">
          <select 
            className="select-field"
            style={{ minWidth: '200px' }}
            value={cicloActivoId} 
            onChange={(e) => setCicloActivoId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">-- Seleccionar Ciclo --</option>
            {ciclos.map(c => <option key={c.id} value={c.id}>Ciclo Lectivo {c.anio}</option>)}
          </select>
        </div>
      </div>

      <div className="grados-secciones-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '24px', marginTop: '24px' }}>
        
        {/* COLUMNA GRADOS */}
        <div className="panel card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Catálogo de Grados</h3>
          <form className="module-form-compact" onSubmit={handleCrearGrado} style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="input-field"
              placeholder="Ej. 1ro Básico" 
              value={nuevoGrado} 
              onChange={e => setNuevoGrado(e.target.value)} 
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 16px' }}>+</button>
          </form>
          <ul className="catalogo-list-modern" style={{ listStyle: 'none', padding: 0, maxHeight: '400px', overflowY: 'auto' }}>
            {grados.map(g => (
              <li key={g.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>{g.nombre}</span>
                <button onClick={() => eliminarGrado(g.id)} className="btn-icon-action delete" style={{ background: 'white' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMNA SECCIONES */}
        <div className="panel card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Catálogo de Secciones</h3>
          <form className="module-form-compact" onSubmit={handleCrearSeccion} style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="input-field"
              placeholder="Ej. A" 
              maxLength={10}
              value={nuevaSeccion} 
              onChange={e => setNuevaSeccion(e.target.value)} 
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 16px' }}>+</button>
          </form>
          <ul className="catalogo-list-modern" style={{ listStyle: 'none', padding: 0, maxHeight: '400px', overflowY: 'auto' }}>
            {secciones.map(s => (
              <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Sección {s.nombre}</span>
                <button onClick={() => eliminarSeccion(s.id)} className="btn-icon-action delete" style={{ background: 'white' }}>×</button>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMNA SALONES (UNIÓN) */}
        <div className="panel card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Conformación de Salones</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Asigna grados y secciones al ciclo seleccionado.</p>
          
          {!cicloActivoId ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px dashed var(--border-color)' }}>
              <p>Seleccione un ciclo en la parte superior para gestionar los salones.</p>
            </div>
          ) : (
            <div className="animated fadeIn">
              <form className="union-form" onSubmit={handleCrearUnion} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '24px' }}>
                <select className="input-field" value={gradoSeleccionado} onChange={e => setGradoSeleccionado(e.target.value === '' ? '' : Number(e.target.value))} required>
                  <option value="">-- Grado --</option>
                  {grados.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
                <select className="input-field" value={seccionSeleccionada} onChange={e => setSeccionSeleccionada(e.target.value === '' ? '' : Number(e.target.value))} required>
                  <option value="">-- Sección --</option>
                  {secciones.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
                <button type="submit" className="btn-primary" style={{ padding: '0 20px' }}>Unir</button>
              </form>

              <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Grado</th>
                      <th>Sección</th>
                      <th className="text-center">Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unionesDelCiclo.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center empty-row">No hay salones definidos para este ciclo.</td>
                      </tr>
                    ) : (
                      unionesDelCiclo.map(u => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600 }}>{u.grado_nombre}</td>
                          <td>Sección {u.seccion_nombre}</td>
                          <td className="actions-cell">
                            <button onClick={() => eliminarGradoSeccion(u.id)} className="btn-icon-action delete">🗑️</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GradosSecciones;

