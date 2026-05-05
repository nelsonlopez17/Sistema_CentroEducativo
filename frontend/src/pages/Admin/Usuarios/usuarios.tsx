import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUsuarios } from "../../../hooks/useUsuarios";
import UsuariosTable from "./UsuariosTable";
import EditUsuarioModal from "./EditUsuarioModal";
import './usuarios.css';

interface Usuario {
  id: number;
  username: string;
  email: string;
  persona?: any;
  roles?: any[];
  is_active?: boolean;
}

const rolesDisponibles = [
  { id: 1, nombre: 'Admin' },
  { id: 2, nombre: 'Docente' },
  { id: 3, nombre: 'Estudiante' },
  { id: 4, nombre: 'Encargado' },
];

const Usuarios: React.FC = () => {
  const navigate = useNavigate();
  const { usuarios, loading, error, mostrandoUsuarios, obtenerUsuarios, actualizarUsuario } =
    useUsuarios();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState('');

  // Cargar usuarios al montar el componente
  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalOpen(true);
    setErrorModal('');
  };

  const handleGuardarUsuario = async (usuarioId: number, datos: Partial<Usuario>) => {
    try {
      await actualizarUsuario(usuarioId, datos);
      setModalOpen(false);
    } catch (err) {
      setErrorModal(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  return (
    <div className="usuarios-container">
      <nav className="usuarios-nav">
        <button className="btn-volver" onClick={() => navigate('/inicio')}>
          ← Volver
        </button>
        <h1>Gestión de Usuarios</h1>
        <div></div>
      </nav>

      <main className="usuarios-main">
        <div className="usuarios-header">
          <h2>Usuarios Registrados</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <UsuariosTable 
          usuarios={usuarios} 
          mostrandoUsuarios={mostrandoUsuarios}
          onEdit={handleEditarUsuario}
        />

        <EditUsuarioModal
          isOpen={modalOpen}
          usuario={usuarioSeleccionado}
          rolesDisponibles={rolesDisponibles}
          onClose={() => {
            setModalOpen(false);
            setUsuarioSeleccionado(null);
          }}
          onSave={handleGuardarUsuario}
          loading={loading}
        />
      </main>
    </div>
  );
};

export default Usuarios;