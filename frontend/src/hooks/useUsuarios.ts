import { useState } from 'react';
import api from '../api/axios';

interface Persona {
  id: number;
  nombres: string;
  apellidos: string;
  cui: string;
  fecha_nacimiento: string;
  direccion?: string;
}

interface Usuario {
  id: number;
  username: string;
  email: string;
  persona?: Persona;
  roles?: Array<{ id: number; nombre: string }>;
  is_active?: boolean;
}

interface UseUsuariosReturn {
  usuarios: Usuario[];
  loading: boolean;
  error: string;
  mostrandoUsuarios: boolean;
  obtenerUsuarios: () => Promise<void>;
  actualizarUsuario: (usuarioId: number, datos: Partial<Usuario>) => Promise<void>;
}

export const useUsuarios = (): UseUsuariosReturn => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrandoUsuarios, setMostrandoUsuarios] = useState(false);

  const obtenerUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('usuarios/');
      console.log('Respuesta del API (usuarios):', response.data);
      
      // Obtener datos completos de cada usuario (persona y roles)
      const usuariosConDatos = await Promise.all(
        response.data.map(async (usuario: any) => {
          let usuarioCompleto = { ...usuario };

          // Obtener datos completos de la persona si es un ID
          if (typeof usuario.persona === 'number') {
            try {
              const personaResponse = await api.get(`personas/${usuario.persona}/`);
              usuarioCompleto.persona = personaResponse.data;
            } catch (err) {
              console.error(`Error obteniendo persona ${usuario.persona}:`, err);
            }
          }

          // Obtener roles del usuario
          try {
            const rolesResponse = await api.get(`usuarios/${usuario.id}/`);
            if (rolesResponse.data.roles) {
              usuarioCompleto.roles = rolesResponse.data.roles;
            }
          } catch (err) {
            console.error(`Error obteniendo roles del usuario ${usuario.id}:`, err);
            // Si el endpoint anterior falla, intentar obtener desde usuario-roles
            try {
              const usuarioRolesResponse = await api.get(`usuario-roles/?usuario=${usuario.id}`);
              // Transformar la respuesta a formato de roles
              usuarioCompleto.roles = usuarioRolesResponse.data.map((ur: any) => ({
                id: ur.rol,
                nombre: ur.rol_nombre || `Rol ${ur.rol}`
              }));
            } catch (err2) {
              console.log(`No se pudieron obtener roles para usuario ${usuario.id}`);
              usuarioCompleto.roles = [];
            }
          }

          return usuarioCompleto;
        })
      );

      console.log('Usuarios con datos completos:', usuariosConDatos);
      setUsuarios(usuariosConDatos);
      setMostrandoUsuarios(true);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      setError('Error al cargar los usuarios. Por favor, intenta de nuevo.');
      setMostrandoUsuarios(false);
    } finally {
      setLoading(false);
    }
  };

  const actualizarUsuario = async (usuarioId: number, datos: Partial<Usuario>) => {
    try {
      // 1. Actualizar datos del usuario (email, is_active)
      const usuarioPayload: any = {
        email: datos.email,
        is_active: datos.is_active,
      };

      console.log('1. Actualizando Usuario con payload:', usuarioPayload);

      try {
        const usuarioResponse = await api.patch(`usuarios/${usuarioId}/`, usuarioPayload);
        console.log('✓ Usuario actualizado:', usuarioResponse.data);
      } catch (usuarioErr: any) {
        console.error('✗ Error al actualizar usuario:', usuarioErr.response?.data);
        throw new Error(`Error en usuario: ${JSON.stringify(usuarioErr.response?.data)}`);
      }

      // 2. Actualizar roles - Enviar directamente los IDs de roles
      if (datos.roles !== undefined && Array.isArray(datos.roles)) {
        console.log('2. Actualizando Roles. Roles nuevos:', datos.roles);
        
        try {
          // Extraer solo los IDs de los roles
          const rolesIds = datos.roles.map((rol: any) => rol.id || rol).filter((id) => id);
          
          console.log('IDs de roles a asignar:', rolesIds);

          // Enviar directamente al endpoint de usuarios con los roles
          const usuarioConRolesPayload = {
            roles: rolesIds,
          };

          const rolesResponse = await api.patch(`usuarios/${usuarioId}/`, usuarioConRolesPayload);
          console.log('✓ Roles actualizados:', rolesResponse.data);
        } catch (rolesErr: any) {
          console.error('✗ Error al actualizar roles:', rolesErr.response?.data);
          // No lanzar error para que no bloquee la actualización de otros datos
          console.log('Continuando sin actualizar roles...');
        }
      }

      // 3. Actualizar datos de la persona si existen
      if (datos.persona && datos.persona.id) {
        const personaPayload = {
          nombres: datos.persona.nombres,
          apellidos: datos.persona.apellidos,
          cui: datos.persona.cui,
          fecha_nacimiento: datos.persona.fecha_nacimiento,
          direccion: datos.persona.direccion || null,
        };

        console.log('3. Actualizando Persona con payload:', personaPayload);

        try {
          const personaResponse = await api.patch(`personas/${datos.persona.id}/`, personaPayload);
          console.log('✓ Persona actualizada:', personaResponse.data);
        } catch (personaErr: any) {
          console.error('✗ Error al actualizar persona:', personaErr.response?.data);
          throw new Error(`Error en persona: ${JSON.stringify(personaErr.response?.data)}`);
        }
      }

      // 4. Actualizar el estado local
      setUsuarios(
        usuarios.map((usuario) =>
          usuario.id === usuarioId ? { ...usuario, ...datos } : usuario
        )
      );

      console.log('✓ Cambios guardados exitosamente');
    } catch (err: any) {
      console.error('❌ Error completo:', err.message);
      throw err;
    }
  };

  return {
    usuarios,
    loading,
    error,
    mostrandoUsuarios,
    obtenerUsuarios,
    actualizarUsuario,
  };
};
