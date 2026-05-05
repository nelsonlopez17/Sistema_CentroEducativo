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

  // Formulario Ciclo
  const [nuevoCicloAnio, setNuevoCicloAnio] = useState('');
  const [nuevoCicloInicio, setNuevoCicloInicio] = useState('');
  const [nuevoCicloFin, setNuevoCicloFin] = useState('');
  const [cicloError, setCicloError] = useState('');

  // Formulario Unidad
  const [nuevaUnidadNombre, setNuevaUnidadNombre] = useState('');
  const [nuevaUnidadNumero, setNuevaUnidadNumero] = useState('');
  const [nuevaUnidadInicio, setNuevaUnidadInicio] = useState('');
  const [nuevaUnidadFin, setNuevaUnidadFin] = useState('');
  const [unidadError, setUnidadError] = useState('');

  // Actualizar ciclo seleccionado cuando cambie el cache
  const cicloActualizado = cicloSeleccionado
    ? ciclos.find(c => c.id === cicloSeleccionado.id) || null
    : null;

  const handleCrearCiclo = async (e: React.FormEvent) => {
    e.preventDefault();
    setCicloError('');
    try {
      await crearCiclo({
        anio: Number(nuevoCicloAnio),
        fecha_inicio: nuevoCicloInicio,
        fecha_fin: nuevoCicloFin,
      });
      setNuevoCicloAnio('');
      setNuevoCicloInicio('');
      setNuevoCicloFin('');
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
        nombre: nuevaUnidadNombre,
        numero: Number(nuevaUnidadNumero),
        fecha_inicio: nuevaUnidadInicio,
        fecha_fin: nuevaUnidadFin,
        ciclo: cicloActualizado.id,
      });
      setNuevaUnidadNombre('');
      setNuevaUnidadNumero('');
      setNuevaUnidadInicio('');
      setNuevaUnidadFin('');
    } catch (err: any) {
      setUnidadError(err?.response?.data?.non_field_errors ? 'Ya existe una unidad con ese número en este ciclo.' : 'Error al crear la unidad.');
    }
  };

  const handleEliminarUnidad = async (id: number) => {
    if (!window.confirm('¿Eliminar esta unidad?')) return;
    await eliminarUnidad(id);
  };

  return (
    <div className="ciclos-container">
      {/* PANEL IZQUIERDO: Ciclos Escolares */}
      <div className="ciclos-panel">
        <div className="panel-header">
          <h2>Ciclos Escolares</h2>
        </div>

        {/* Formulario Nuevo Ciclo */}
        <div className="ciclos-form-card">
          <h3>Nuevo Ciclo</h3>
          <form onSubmit={handleCrearCiclo} className="ciclo-form">
            <div className="form-group">
              <label>Año *</label>
              <input
                type="number"
                placeholder="Ej. 2026"
                value={nuevoCicloAnio}
                onChange={e => setNuevoCicloAnio(e.target.value)}
                required
                min={2000}
                max={2100}
                className="form-input"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Fecha Inicio *</label>
                <input type="date" value={nuevoCicloInicio} onChange={e => setNuevoCicloInicio(e.target.value)} required className="form-input" />
              </div>
              <div className="form-group">
                <label>Fecha Fin *</label>
                <input type="date" value={nuevoCicloFin} onChange={e => setNuevoCicloFin(e.target.value)} required className="form-input" />
              </div>
            </div>
            {cicloError && <div className="error-inline">{cicloError}</div>}
            <button type="submit" className="btn-add" disabled={isCreatingCiclo}>
              {isCreatingCiclo ? 'Guardando...' : '+ Agregar Ciclo'}
            </button>
          </form>
        </div>

        {/* Lista de Ciclos */}
        <div className="ciclos-list">
          {isLoading ? (
            <div className="loading-state">Cargando ciclos...</div>
          ) : isError ? (
            <div className="error-state">Error al cargar ciclos.</div>
          ) : ciclos.length === 0 ? (
            <div className="empty-state">No hay ciclos registrados.</div>
          ) : (
            ciclos.map(ciclo => (
              <div
                key={ciclo.id}
                className={`ciclo-card ${cicloActualizado?.id === ciclo.id ? 'selected' : ''}`}
                onClick={() => setCicloSeleccionado(ciclo)}
              >
                <div className="ciclo-info">
                  <span className="ciclo-anio">{ciclo.anio}</span>
                  <span className="ciclo-fechas">{ciclo.fecha_inicio} → {ciclo.fecha_fin}</span>
                  <span className="ciclo-badge">{ciclo.unidades_count} {ciclo.unidades_count === 1 ? 'unidad' : 'unidades'}</span>
                </div>
                <button
                  className="btn-eliminar-sm"
                  onClick={e => { e.stopPropagation(); handleEliminarCiclo(ciclo.id); }}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PANEL DERECHO: Unidades del Ciclo Seleccionado */}
      <div className="unidades-panel">
        {!cicloActualizado ? (
          <div className="panel-empty">
            <div className="panel-empty-icon">📅</div>
            <p>Selecciona un ciclo escolar para gestionar sus unidades.</p>
          </div>
        ) : (
          <>
            <div className="panel-header">
              <h2>Unidades del Ciclo {cicloActualizado.anio}</h2>
              <span className="unidades-count">{cicloActualizado.unidades.length} / 6 unidades</span>
            </div>

            {/* Formulario Nueva Unidad */}
            <div className="unidades-form-card">
              <h3>Agregar Unidad</h3>
              <form onSubmit={handleCrearUnidad} className="unidad-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input type="text" placeholder="Ej. Primera Unidad" value={nuevaUnidadNombre} onChange={e => setNuevaUnidadNombre(e.target.value)} required className="form-input" />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100px' }}>
                    <label>Número *</label>
                    <input type="number" placeholder="1-6" value={nuevaUnidadNumero} onChange={e => setNuevaUnidadNumero(e.target.value)} required min={1} max={6} className="form-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha Inicio *</label>
                    <input type="date" value={nuevaUnidadInicio} onChange={e => setNuevaUnidadInicio(e.target.value)} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label>Fecha Fin *</label>
                    <input type="date" value={nuevaUnidadFin} onChange={e => setNuevaUnidadFin(e.target.value)} required className="form-input" />
                  </div>
                </div>
                {unidadError && <div className="error-inline">{unidadError}</div>}
                <button type="submit" className="btn-add" disabled={isCreatingUnidad || cicloActualizado.unidades.length >= 6}>
                  {isCreatingUnidad ? 'Guardando...' : '+ Agregar Unidad'}
                </button>
              </form>
            </div>

            {/* Lista de Unidades */}
            <div className="unidades-list">
              {cicloActualizado.unidades.length === 0 ? (
                <div className="empty-state">Este ciclo no tiene unidades configuradas.</div>
              ) : (
                [...cicloActualizado.unidades]
                  .sort((a: Unidad, b: Unidad) => a.numero - b.numero)
                  .map((unidad: Unidad) => (
                    <div key={unidad.id} className="unidad-card">
                      <div className="unidad-numero">U{unidad.numero}</div>
                      <div className="unidad-info">
                        <span className="unidad-nombre">{unidad.nombre}</span>
                        <span className="unidad-fechas">{unidad.fecha_inicio} → {unidad.fecha_fin}</span>
                      </div>
                      <button className="btn-eliminar-sm" onClick={() => handleEliminarUnidad(unidad.id)}>✕</button>
                    </div>
                  ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CiclosUnidades;
