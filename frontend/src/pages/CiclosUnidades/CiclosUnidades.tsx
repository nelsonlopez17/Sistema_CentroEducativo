import React, { useState } from 'react';
import { useCiclos } from '../../hooks/useCiclos';
import type { CicloEscolar, Unidad } from '../../api/ciclos';
import './CiclosUnidades.css';

const CiclosUnidades: React.FC = () => {
  const {
    ciclos, isLoading, isError,
    crearCiclo, isCreatingCiclo,
    eliminarCiclo,
    crearUnidad, isCreatingUnidad,
    eliminarUnidad,
  } = useCiclos();

  const [cicloSeleccionado, setCicloSeleccionado] = useState<CicloEscolar | null>(null);

  // Form states
  const [nuevoCiclo, setNuevoCiclo] = useState({ anio: '', inicio: '', fin: '' });
  const [cicloError, setCicloError] = useState('');
  const [nuevaUnidad, setNuevaUnidad] = useState({ nombre: '', numero: '', inicio: '', fin: '' });
  const [unidadError, setUnidadError] = useState('');

  const cicloActualizado = cicloSeleccionado
    ? ciclos.find(c => c.id === cicloSeleccionado.id) || null
    : null;

  const handleCrearCiclo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCicloError('');
    try {
      await crearCiclo({
        anio: Number(nuevoCiclo.anio),
        fecha_inicio: nuevoCiclo.inicio,
        fecha_fin: nuevoCiclo.fin,
      });
      setNuevoCiclo({ anio: '', inicio: '', fin: '' });
    } catch (err: any) {
      setCicloError(err?.response?.data?.anio ? 'Ya existe un ciclo con ese año.' : 'Error al crear el ciclo.');
    }
  };

  const handleEliminarCiclo = async (id: number) => {
    if (!window.confirm('¿Eliminar este ciclo escolar y todas sus unidades?')) return;
    if (cicloSeleccionado?.id === id) setCicloSeleccionado(null);
    await eliminarCiclo(id);
  };

  const handleCrearUnidad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cicloActualizado) return;
    setUnidadError('');
    try {
      await crearUnidad({
        nombre: nuevaUnidad.nombre,
        numero: Number(nuevaUnidad.numero),
        fecha_inicio: nuevaUnidad.inicio,
        fecha_fin: nuevaUnidad.fin,
        ciclo: cicloActualizado.id,
      });
      setNuevaUnidad({ nombre: '', numero: '', inicio: '', fin: '' });
    } catch (err: any) {
      setUnidadError(err?.response?.data?.non_field_errors ? 'Ya existe una unidad con ese número.' : 'Error al crear la unidad.');
    }
  };

  return (
    <div className="module-container">
      <div className="module-header">
        <div className="header-text">
          <h1>Cronograma de Ciclos Escolares</h1>
          <p>Planificación de períodos académicos y unidades de evaluación.</p>
        </div>
      </div>

      <div className="ciclos-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', marginTop: '24px' }}>
        
        {/* PANEL IZQUIERDO: CICLOS */}
        <div className="panel card">
          <div className="panel-header-simple" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Apertura de Ciclos</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Define los años lectivos del centro.</p>
          </div>

          <form onSubmit={handleCrearCiclo} className="module-form-compact" style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label>Año Lectivo</label>
              <input
                type="number"
                className="input-field"
                placeholder="Ej. 2026"
                value={nuevoCiclo.anio}
                onChange={e => setNuevoCiclo({...nuevoCiclo, anio: e.target.value})}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Inicio</label>
                <input type="date" className="input-field" value={nuevoCiclo.inicio} onChange={e => setNuevoCiclo({...nuevoCiclo, inicio: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Fin</label>
                <input type="date" className="input-field" value={nuevoCiclo.fin} onChange={e => setNuevoCiclo({...nuevoCiclo, fin: e.target.value})} required />
              </div>
            </div>
            {cicloError && <div className="error-message-inline">{cicloError}</div>}
            <button type="submit" className="btn-primary" disabled={isCreatingCiclo} style={{ width: '100%' }}>
              {isCreatingCiclo ? 'Aperturando...' : 'Abrir Ciclo Escolar'}
            </button>
          </form>

          <div className="ciclos-scroll-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
            {isLoading ? <p style={{ textAlign: 'center' }}>Cargando...</p> : 
             ciclos.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No hay ciclos registrados.</p> :
             ciclos.map(ciclo => (
              <div
                key={ciclo.id}
                className={`ciclo-item-card ${cicloActualizado?.id === ciclo.id ? 'active' : ''}`}
                onClick={() => setCicloSeleccionado(ciclo)}
                style={{ 
                  padding: '16px', 
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)', 
                  marginBottom: '12px',
                  cursor: 'pointer',
                  backgroundColor: cicloActualizado?.id === ciclo.id ? 'var(--primary-soft)' : 'white',
                  borderColor: cicloActualizado?.id === ciclo.id ? 'var(--primary)' : 'var(--border-color)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Ciclo {ciclo.anio}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{ciclo.fecha_inicio} a {ciclo.fecha_fin}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="badge badge-info" style={{ fontSize: '10px' }}>{ciclo.unidades_count} Unidades</span>
                  <button 
                    className="btn-icon-action delete" 
                    onClick={e => { e.stopPropagation(); handleEliminarCiclo(ciclo.id); }}
                    style={{ background: 'white' }}
                  >×</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL DERECHO: UNIDADES */}
        <div className="panel card">
          {!cicloActualizado ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '20px' }}>🗓️</span>
              <h3>Gestión de Unidades</h3>
              <p>Selecciona un ciclo de la izquierda para configurar sus períodos de evaluación.</p>
            </div>
          ) : (
            <div className="animated fadeIn">
              <div className="panel-header-simple" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Unidades de Evaluación - {cicloActualizado.anio}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Configure hasta 6 unidades por ciclo lectivo.</p>
                </div>
                <span className="badge badge-success" style={{ padding: '8px 16px' }}>{cicloActualizado.unidades.length} de 6 registradas</span>
              </div>

              {cicloActualizado.unidades.length < 6 && (
                <form onSubmit={handleCrearUnidad} className="module-form-compact card" style={{ padding: '20px', backgroundColor: '#f8fafc', marginBottom: '32px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group">
                      <label>Nombre de Unidad</label>
                      <input type="text" className="input-field" placeholder="Ej. Primer Trimestre" value={nuevaUnidad.nombre} onChange={e => setNuevaUnidad({...nuevaUnidad, nombre: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>No. Unidad</label>
                      <input type="number" className="input-field" placeholder="1-6" value={nuevaUnidad.numero} onChange={e => setNuevaUnidad({...nuevaUnidad, numero: e.target.value})} required min={1} max={6} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div className="form-group">
                      <label>Fecha Inicio</label>
                      <input type="date" className="input-field" value={nuevaUnidad.inicio} onChange={e => setNuevaUnidad({...nuevaUnidad, inicio: e.target.value})} required />
                    </div>
                    <div className="form-group">
                      <label>Fecha Fin</label>
                      <input type="date" className="input-field" value={nuevaUnidad.fin} onChange={e => setNuevaUnidad({...nuevaUnidad, fin: e.target.value})} required />
                    </div>
                  </div>
                  {unidadError && <div className="error-message-inline" style={{ marginBottom: '12px' }}>{unidadError}</div>}
                  <button type="submit" className="btn-primary" disabled={isCreatingUnidad} style={{ width: '100%' }}>
                    {isCreatingUnidad ? 'Registrando...' : 'Agregar Período de Evaluación'}
                  </button>
                </form>
              )}

              <div className="units-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[...cicloActualizado.unidades]
                  .sort((a, b) => a.numero - b.numero)
                  .map((unidad) => (
                    <div key={unidad.id} className="unit-timeline-item" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div className="unit-number-blob" style={{ 
                        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0,
                        boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)'
                      }}>
                        {unidad.numero}
                      </div>
                      <div className="unit-card-content card" style={{ flex: 1, padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px' }}>{unidad.nombre}</h4>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Desde el {unidad.fecha_inicio} hasta el {unidad.fecha_fin}</p>
                        </div>
                        <button className="btn-icon-action delete" onClick={() => eliminarUnidad(unidad.id)} style={{ background: 'white' }}>×</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CiclosUnidades;

