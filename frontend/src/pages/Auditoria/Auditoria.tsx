import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { obtenerAuditoria } from '../../api/auditoria';
import './Auditoria.css';

const OPERACIONES: Record<string, { label: string; cls: string }> = {
  I: { label: 'Inserción', cls: 'op-insert' },
  U: { label: 'Actualización', cls: 'op-update' },
  D: { label: 'Eliminación', cls: 'op-delete' },
};

const Auditoria: React.FC = () => {
  const { data: registros = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['auditoria'],
    queryFn: obtenerAuditoria,
    refetchOnWindowFocus: true,
  });

  const [filtroTabla, setFiltroTabla] = useState('');
  const [filtroOp, setFiltroOp] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Tablas únicas presentes en los registros
  const tablasUnicas = useMemo(() =>
    [...new Set(registros.map(r => r.tabla))].sort(),
    [registros]
  );

  const registrosFiltrados = useMemo(() => {
    return registros.filter(r => {
      if (filtroTabla && r.tabla !== filtroTabla) return false;
      if (filtroOp && r.operacion !== filtroOp) return false;
      if (busqueda) {
        const s = busqueda.toLowerCase();
        if (!r.tabla.toLowerCase().includes(s) && !String(r.id_registro).includes(s)) return false;
      }
      return true;
    });
  }, [registros, filtroTabla, filtroOp, busqueda]);

  const formatFecha = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const toggleExpand = (id: number) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div className="auditoria-container">

      <div className="auditoria-header">
        <div>
          <h2>Auditoría del Sistema</h2>
          <p className="auditoria-subtitle">
            {registros.length} registro{registros.length !== 1 ? 's' : ''} de actividad
          </p>
        </div>
        <button className="btn-refrescar" onClick={() => refetch()}>
          ↻ Actualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-bar">
        <input
          type="text"
          className="filtro-input"
          placeholder="Buscar tabla o ID..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select className="filtro-select" value={filtroTabla} onChange={e => setFiltroTabla(e.target.value)}>
          <option value="">Todas las tablas</option>
          {tablasUnicas.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="filtro-select" value={filtroOp} onChange={e => setFiltroOp(e.target.value)}>
          <option value="">Todas las operaciones</option>
          <option value="I">Inserción</option>
          <option value="U">Actualización</option>
          <option value="D">Eliminación</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="table-wrapper">
        {isLoading ? (
          <div className="loading-state">Cargando registros de auditoría...</div>
        ) : isError ? (
          <div className="error-state">Error al cargar el historial.</div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="empty-state">No hay registros que coincidan con los filtros.</div>
        ) : (
          <table className="auditoria-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Tabla</th>
                <th>ID</th>
                <th>Operación</th>
                <th>IP</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.map(reg => {
                const op = OPERACIONES[reg.operacion] || { label: reg.operacion, cls: '' };
                const isExpanded = expandedId === reg.id;
                return (
                  <React.Fragment key={reg.id}>
                    <tr className={`audit-row ${isExpanded ? 'expanded' : ''}`}>
                      <td className="td-fecha">{formatFecha(reg.fecha_hora)}</td>
                      <td><span className="tabla-tag">{reg.tabla}</span></td>
                      <td className="td-id">#{reg.id_registro}</td>
                      <td>
                        <span className={`op-badge ${op.cls}`}>{op.label}</span>
                      </td>
                      <td className="td-ip">{reg.ip_cliente || '—'}</td>
                      <td>
                        {(reg.datos_anteriores || reg.datos_nuevos) && (
                          <button className="btn-detalle" onClick={() => toggleExpand(reg.id)}>
                            {isExpanded ? 'Ocultar' : 'Ver más'}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="detail-row">
                        <td colSpan={6}>
                          <div className="detail-grid">
                            {reg.datos_anteriores && (
                              <div className="detail-block antes">
                                <span className="detail-label">Datos Anteriores</span>
                                <pre>{JSON.stringify(reg.datos_anteriores, null, 2)}</pre>
                              </div>
                            )}
                            {reg.datos_nuevos && (
                              <div className="detail-block despues">
                                <span className="detail-label">Datos Nuevos</span>
                                <pre>{JSON.stringify(reg.datos_nuevos, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Auditoria;
