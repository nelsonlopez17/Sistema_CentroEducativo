import React, { useState, useMemo } from 'react';
import { usePersonas } from '../../hooks/usePersonas';
import { useDocentes } from '../../hooks/useDocentes';

interface FormularioDocenteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FormularioDocenteModal: React.FC<FormularioDocenteModalProps> = ({ isOpen, onClose }) => {
  const { personas, isLoading: personasLoading, crearPersona, isCreatingPersona } = usePersonas();
  const { docentes, crearDocente, isCreating } = useDocentes();
  
  const [tab, setTab] = useState<'nuevo' | 'existente'>('nuevo');
  
  // Estados para búsqueda existente
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);
  
  // Estados compartidos
  const [errorMsg, setErrorMsg] = useState('');

  // Estados para persona nueva
  const [nuevoNombres, setNuevoNombres] = useState('');
  const [nuevoApellidos, setNuevoApellidos] = useState('');
  const [nuevoCui, setNuevoCui] = useState('');
  const [nuevaFechaNac, setNuevaFechaNac] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');

  // Filtrar personas disponibles
  const personasDisponibles = useMemo(() => {
    if (!personas) return [];
    const docentesPersonaIds = new Set(docentes.map(d => d.persona.id));
    return personas.filter(p => {
      if (docentesPersonaIds.has(p.id)) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return p.cui.toLowerCase().includes(search) || p.nombres.toLowerCase().includes(search) || p.apellidos.toLowerCase().includes(search);
    });
  }, [personas, docentes, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      let personaId = selectedPersonaId;

      if (tab === 'nuevo') {
        if (!nuevoNombres || !nuevoApellidos || !nuevoCui || !nuevaFechaNac) {
          setErrorMsg('Por favor complete todos los campos obligatorios.');
          return;
        }
        // Crear persona
        const nuevaPersona = await crearPersona({
          nombres: nuevoNombres,
          apellidos: nuevoApellidos,
          cui: nuevoCui,
          fecha_nacimiento: nuevaFechaNac,
          direccion: nuevaDireccion
        });
        personaId = nuevaPersona.id;
      } else {
        if (!personaId) {
          setErrorMsg('Debe seleccionar una persona existente.');
          return;
        }
      }

      // Crear docente
      await crearDocente(personaId);
      
      // Limpiar y cerrar
      setSearchTerm('');
      setSelectedPersonaId(null);
      setNuevoNombres('');
      setNuevoApellidos('');
      setNuevoCui('');
      setNuevaFechaNac('');
      setNuevaDireccion('');
      onClose();

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.cui ? 'Ya existe una persona con ese CUI.' : 'Ocurrió un error al registrar al docente.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Registrar Nuevo Docente</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-tabs">
          <button className={`tab-btn ${tab === 'nuevo' ? 'active' : ''}`} onClick={() => setTab('nuevo')}>
            Nueva Persona
          </button>
          <button className={`tab-btn ${tab === 'existente' ? 'active' : ''}`} onClick={() => setTab('existente')}>
            Persona Existente
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="docente-form">
          
          {tab === 'nuevo' ? (
            <div className="nuevo-registro-container">
              <p className="docente-form-instructions">Ingrese los datos biográficos para registrar a la persona y asignarla como docente.</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombres *</label>
                  <input type="text" value={nuevoNombres} onChange={e => setNuevoNombres(e.target.value)} required={tab === 'nuevo'} className="form-input" />
                </div>
                <div className="form-group">
                  <label>Apellidos *</label>
                  <input type="text" value={nuevoApellidos} onChange={e => setNuevoApellidos(e.target.value)} required={tab === 'nuevo'} className="form-input" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>CUI *</label>
                  <input type="text" value={nuevoCui} onChange={e => setNuevoCui(e.target.value)} required={tab === 'nuevo'} className="form-input" maxLength={15} />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento *</label>
                  <input type="date" value={nuevaFechaNac} onChange={e => setNuevaFechaNac(e.target.value)} required={tab === 'nuevo'} className="form-input" />
                </div>
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input type="text" value={nuevaDireccion} onChange={e => setNuevaDireccion(e.target.value)} className="form-input" />
              </div>
            </div>
          ) : (
            <div className="existente-registro-container">
              <p className="docente-form-instructions">Busque una persona ya registrada en el sistema.</p>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Buscar por CUI o Nombre"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="personas-list-container">
                {personasLoading ? (
                  <div className="loading-state">Cargando...</div>
                ) : personasDisponibles.length === 0 ? (
                  <div className="empty-state">No se encontraron personas.</div>
                ) : (
                  <ul className="personas-list">
                    {personasDisponibles.map(p => (
                      <li key={p.id} className={`persona-item ${selectedPersonaId === p.id ? 'selected' : ''}`} onClick={() => setSelectedPersonaId(p.id)}>
                        <div className="persona-cui">{p.cui}</div>
                        <div className="persona-name">{p.nombres} {p.apellidos}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isCreating || isCreatingPersona}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit" disabled={isCreating || isCreatingPersona || (tab === 'existente' && !selectedPersonaId)}>
              {isCreating || isCreatingPersona ? 'Registrando...' : 'Registrar Docente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioDocenteModal;
