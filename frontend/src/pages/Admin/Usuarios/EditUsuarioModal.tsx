import React, { useState, useEffect } from 'react';

interface Persona {
  id: number;
  nombres: string;
  apellidos: string;
  cui: string;
  fecha_nacimiento: string;
  direccion?: string;
}

interface Rol {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  username: string;
  email: string;
  persona?: Persona;
  roles?: Rol[];
  is_active?: boolean;
}

interface EditUsuarioModalProps {
  isOpen: boolean;
  usuario: Usuario | null;
  rolesDisponibles: Rol[];
  onClose: () => void;
  onSave: (usuarioId: number, datos: Partial<Usuario>) => Promise<void>;
  loading?: boolean;
}

const EditUsuarioModal: React.FC<EditUsuarioModalProps> = ({
  isOpen,
  usuario,
  rolesDisponibles,
  onClose,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Partial<Usuario>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (usuario) {
      console.log('Inicializando formData con usuario:', usuario);
      setFormData({
        email: usuario.email,
        persona: usuario.persona ? {
          id: usuario.persona.id,
          nombres: usuario.persona.nombres,
          apellidos: usuario.persona.apellidos,
          cui: usuario.persona.cui,
          fecha_nacimiento: usuario.persona.fecha_nacimiento,
          direccion: usuario.persona.direccion,
        } : undefined,
        roles: usuario.roles || [],
        is_active: usuario.is_active,
      });
      setError('');
    }
  }, [usuario, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;

    // Validar CUI (máximo 13 caracteres)
    if (name === 'persona.cui' && value.length > 13) {
      console.warn('CUI no puede exceder 13 caracteres');
      return;
    }

    if (name.startsWith('persona.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        persona: {
          ...formData.persona,
          [field]: value,
        } as Persona,
      });
    } else if (name === 'is_active') {
      setFormData({
        ...formData,
        is_active: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleRoleChange = (roleId: number) => {
    const currentRoles = formData.roles || [];
    const isSelected = currentRoles.some((r) => r.id === roleId);

    const updatedRoles = isSelected
      ? currentRoles.filter((r) => r.id !== roleId)
      : [...currentRoles, rolesDisponibles.find((r) => r.id === roleId)].filter(
          Boolean
        ) as Rol[];

    setFormData({
      ...formData,
      roles: updatedRoles,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setSaving(true);
    setError('');
    try {
      console.log('=== ENVIANDO DATOS ===');
      console.log('Usuario seleccionado:', usuario);
      console.log('FormData:', formData);
      console.log('FormData.persona:', formData.persona);
      console.log('FormData.persona.id:', formData.persona?.id);
      await onSave(usuario.id, formData);
      console.log('Guardado exitosamente, cerrando modal...');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al guardar';
      console.error('Error capturado en modal:', errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !usuario) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Editar Usuario: {usuario.username}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-section">
            <h3>Datos de Contacto</h3>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Datos Personales</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombres">Nombres</label>
                <input
                  type="text"
                  id="nombres"
                  name="persona.nombres"
                  value={formData.persona?.nombres || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="apellidos">Apellidos</label>
                <input
                  type="text"
                  id="apellidos"
                  name="persona.apellidos"
                  value={formData.persona?.apellidos || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="cui">
                CUI <span className="char-count">({(formData.persona?.cui || '').length}/13)</span>
              </label>
              <input
                type="text"
                id="cui"
                name="persona.cui"
                value={formData.persona?.cui || ''}
                onChange={handleInputChange}
                maxLength={13}
                placeholder="13 dígitos máximo"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Roles</h3>
            <div className="roles-container">
              {rolesDisponibles.map((rol) => (
                <label key={rol.id} className="role-checkbox">
                  <input
                    type="checkbox"
                    checked={
                      formData.roles?.some((r) => r.id === rol.id) || false
                    }
                    onChange={() => handleRoleChange(rol.id)}
                  />
                  <span>{rol.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="is_active" className="checkbox-label">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active || false}
                  onChange={handleInputChange}
                />
                <span>Usuario Activo</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancelar"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar"
              disabled={saving || loading}
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUsuarioModal;
