import React from 'react';

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

interface UsuariosTableProps {
  usuarios: Usuario[];
  mostrandoUsuarios: boolean;
  onEdit: (usuario: Usuario) => void;
}

const UsuariosTable: React.FC<UsuariosTableProps> = ({
  usuarios,
  mostrandoUsuarios,
  onEdit,
}) => {
  if (!mostrandoUsuarios) {
    return null;
  }

  return (
    <div className="usuarios-table-container">
      {usuarios.length > 0 ? (
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>CUI</th>
              <th>Roles</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.username}</td>
                <td>{usuario.email}</td>
                <td>{usuario.persona?.nombres || '-'}</td>
                <td>{usuario.persona?.apellidos || '-'}</td>
                <td>{usuario.persona?.cui || '-'}</td>
                <td>
                  {usuario.roles && usuario.roles.length > 0
                    ? usuario.roles.map((rol) => rol.nombre).join(', ')
                    : '-'}
                </td>
                <td>
                  <span className={`estado ${usuario.is_active ? 'activo' : 'inactivo'}`}>
                    {usuario.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-editar"
                    onClick={() => onEdit(usuario)}
                    title="Editar usuario"
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-usuarios">No hay usuarios registrados.</p>
      )}
    </div>
  );
};

export default UsuariosTable;
