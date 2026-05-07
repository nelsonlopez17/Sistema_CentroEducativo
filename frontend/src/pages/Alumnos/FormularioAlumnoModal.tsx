import React, { useState, useMemo } from 'react';
import { usePersonas } from '../../hooks/usePersonas';
import { useEstudiantes } from '../../hooks/useEstudiantes';
import { useEstadosEstudiante } from '../../hooks/useEstadosEstudiante';

interface FormularioAlumnoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FormularioAlumnoModal: React.FC<FormularioAlumnoModalProps> = ({ isOpen, onClose }) => {
  const { personas, isLoading: personasLoading, crearPersona, isCreatingPersona } = usePersonas();
  const { estudiantes, crearEstudiante, isCreating } = useEstudiantes();
  const { estados, isLoading: estadosLoading } = useEstadosEstudiante();
  
  const [tab, setTab] = useState<'nuevo' | 'existente'>('nuevo');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | ''>('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states for new persona
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cui: '',
    fecha_nacimiento: '',
    direccion: ''
  });

  const personasDisponibles = useMemo(() => {
    if (!personas) return [];
    const estudiantesPersonaIds = new Set(estudiantes.map(e => e.persona.id));
    return personas.filter(p => {
      if (estudiantesPersonaIds.has(p.id)) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return p.cui.toLowerCase().includes(search) || p.nombres.toLowerCase().includes(search) || p.apellidos.toLowerCase().includes(search);
    });
  }, [personas, estudiantes, searchTerm]);

  const validateCUI = (cui: string) => /^\d{13}$/.test(cui);
  const validateNames = (name: string) => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedEstadoId) {
      setErrorMsg('Debe seleccionar un estado para el alumno.');
      return;
    }

    try {
      let personaId = selectedPersonaId;

      if (tab === 'nuevo') {
        const { nombres, apellidos, cui, fecha_nacimiento, direccion } = formData;
        
        if (!nombres || !apellidos || !cui || !fecha_nacimiento) {
          setErrorMsg('Por favor complete todos los campos obligatorios.');
          return;
        }

        if (!validateCUI(cui)) {
          setErrorMsg('El CUI debe contener exactamente 13 dígitos numéricos.');
          return;
        }

        if (!validateNames(nombres) || !validateNames(apellidos)) {
          setErrorMsg('Los nombres y apellidos solo pueden contener letras.');
          return;
        }

        const nuevaPersona = await crearPersona({
          nombres, apellidos, cui, fecha_nacimiento, direccion
        });
        personaId = nuevaPersona.id;
      } else {
        if (!personaId) {
          setErrorMsg('Debe seleccionar una persona existente.');
          return;
        }
      }

      await crearEstudiante({ persona_id: personaId, estado: Number(selectedEstadoId) });
      
      resetForm();
      onClose();

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.cui ? 'Ya existe una persona con ese CUI.' : 'Ocurrió un error al registrar al alumno.');
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedPersonaId(null);
    setSelectedEstadoId('');
    setFormData({ nombres: '', apellidos: '', cui: '', fecha_nacimiento: '', direccion: '' });
    setErrorMsg('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Registro de Alumno</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-tabs" style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid var(--border-color)' }}>
          <button 
            className={`tab-btn ${tab === 'nuevo' ? 'active' : ''}`} 
            onClick={() => { setTab('nuevo'); setErrorMsg(''); }}
            style={{ padding: '16px 20px', border: 'none', background: 'none', borderBottom: tab === 'nuevo' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: 600, color: tab === 'nuevo' ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            Nueva Persona
          </button>
          <button 
            className={`tab-btn ${tab === 'existente' ? 'active' : ''}`} 
            onClick={() => { setTab('existente'); setErrorMsg(''); }}
            style={{ padding: '16px 20px', border: 'none', background: 'none', borderBottom: tab === 'existente' ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: 600, color: tab === 'existente' ? 'var(--primary)' : 'var(--text-muted)' }}
          >
            Persona Existente
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Estado Académico Inicial *</label>
            <select 
              value={selectedEstadoId} 
              onChange={(e) => setSelectedEstadoId(e.target.value === '' ? '' : Number(e.target.value))}
              className="input-field"
              required
            >
              <option value="">-- Seleccione Estado --</option>
              {estados.map(estado => (
                <option key={estado.id} value={estado.id}>{estado.nombre}</option>
              ))}
            </select>
          </div>

          {tab === 'nuevo' ? (
            <div className="form-sections" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Nombres *</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={formData.nombres} 
                    onChange={e => setFormData({...formData, nombres: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Apellidos *</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={formData.apellidos} 
                    onChange={e => setFormData({...formData, apellidos: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>CUI (13 dígitos) *</label>
                  <input 
                    type="text" 
                    className="input-field"
                    value={formData.cui} 
                    onChange={e => setFormData({...formData, cui: e.target.value})} 
                    required 
                    maxLength={13}
                  />
                </div>
                <div className="form-group">
                  <label>Fecha de Nacimiento *</label>
                  <input 
                    type="date" 
                    className="input-field"
                    value={formData.fecha_nacimiento} 
                    onChange={e => setFormData({...formData, fecha_nacimiento: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Dirección de Residencia</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={formData.direccion} 
                  onChange={e => setFormData({...formData, direccion: e.target.value})} 
                />
              </div>
            </div>
          ) : (
            <div className="search-section">
              <div className="form-group">
                <label>Búsqueda por CUI o Nombre</label>
                <input 
                  type="text" 
                  placeholder="Ingrese datos de la persona..."
                  className="input-field"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="personas-selector card" style={{ marginTop: '12px', padding: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                {personasLoading ? (
                  <p style={{ textAlign: 'center', padding: '10px' }}>Cargando...</p>
                ) : personasDisponibles.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: '10px', color: 'var(--text-muted)' }}>No se encontraron personas disponibles.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {personasDisponibles.map(p => (
                      <li 
                        key={p.id} 
                        onClick={() => setSelectedPersonaId(p.id)}
                        style={{ 
                          padding: '10px 12px', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          marginBottom: '4px',
                          backgroundColor: selectedPersonaId === p.id ? 'var(--primary-soft)' : 'transparent',
                          border: selectedPersonaId === p.id ? '1px solid var(--primary)' : '1px solid transparent',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{p.nombres} {p.apellidos}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{p.cui}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {errorMsg && <div className="error-message-inline">{errorMsg}</div>}

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose} 
              disabled={isCreating || isCreatingPersona}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={isCreating || isCreatingPersona || (!selectedEstadoId) || (tab === 'existente' && !selectedPersonaId)}
            >
              {isCreating || isCreatingPersona ? 'Procesando...' : 'Registrar Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioAlumnoModal;

