import React, { useState, useMemo } from 'react';
import { usePersonas } from '../../hooks/usePersonas';
import { useDocentes } from '../../hooks/useDocentes';

interface FormularioDocenteModalProps {
  isOpen: boolean;
  onClose: () => void;
  docenteAEditar?: any; // Para futura funcionalidad de edición
}

const FormularioDocenteModal: React.FC<FormularioDocenteModalProps> = ({ isOpen, onClose, docenteAEditar }) => {
  const { personas, isLoading: personasLoading, crearPersona, isCreatingPersona } = usePersonas();
  const { docentes, crearDocente, isCreating } = useDocentes();
  
  const [tab, setTab] = useState<'nuevo' | 'existente'>('nuevo');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState<number | null>(null);
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
    // No mostrar personas que ya son docentes
    const docentesPersonaIds = new Set(docentes.map(d => d.persona.id));
    return personas.filter(p => {
      if (docentesPersonaIds.has(p.id)) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return p.cui.includes(search) || p.nombres.toLowerCase().includes(search) || p.apellidos.toLowerCase().includes(search);
    });
  }, [personas, docentes, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      let personaId = selectedPersonaId;

      if (tab === 'nuevo') {
        const { nombres, apellidos, cui, fecha_nacimiento, direccion } = formData;
        
        if (!nombres || !apellidos || !cui || !fecha_nacimiento) {
          setErrorMsg('Por favor complete todos los campos obligatorios.');
          return;
        }

        // Verificar si el CUI ya existe en las personas cargadas
        const personaExistente = personas.find(p => p.cui === cui);
        if (personaExistente) {
          setErrorMsg('Ya existe una persona con este CUI. Use la pestaña "Persona Existente".');
          setTab('existente');
          setSearchTerm(cui);
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

      await crearDocente(personaId!);
      resetForm();
      onClose();

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.cui ? 'Ya existe una persona con ese CUI.' : 'Error al registrar al docente.');
    }
  };

  const resetForm = () => {
    setSearchTerm('');
    setSelectedPersonaId(null);
    setFormData({ nombres: '', apellidos: '', cui: '', fecha_nacimiento: '', direccion: '' });
    setErrorMsg('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>{docenteAEditar ? 'Editar Docente' : 'Registrar Nuevo Docente'}</h3>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        {!docenteAEditar && (
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
        )}
        
        <form onSubmit={handleSubmit} className="modal-form">
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
                  <label>CUI *</label>
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
                <label>Dirección</label>
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
              <div className="personas-selector card" style={{ marginTop: '12px', padding: '10px', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)' }}>
                {personasLoading ? (
                  <p style={{ textAlign: 'center', padding: '10px' }}>Cargando personas...</p>
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
              disabled={isCreating || isCreatingPersona || (tab === 'existente' && !selectedPersonaId)}
            >
              {isCreating || isCreatingPersona ? 'Procesando...' : docenteAEditar ? 'Guardar Cambios' : 'Registrar Docente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioDocenteModal;

