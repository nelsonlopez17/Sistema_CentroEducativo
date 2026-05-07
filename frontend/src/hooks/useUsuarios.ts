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
      console.log('Actualizando Usuario con datos:', datos);

      // Preparar payload simplificado para el backend mejorado
      const payload: any = {
        email: datos.email,
        is_active: datos.is_active,
        persona: datos.persona ? {
          id: datos.persona.id,
          nombres: datos.persona.nombres,
          apellidos: datos.persona.apellidos,
          cui: datos.persona.cui,
          fecha_nacimiento: datos.persona.fecha_nacimiento,
          direccion: datos.persona.direccion
        } : undefined,
        roles: datos.roles ? datos.roles.map(r => typeof r === 'object' ? r.id : r) : undefined
      };

      const response = await api.patch(`usuarios/${usuarioId}/`, payload);
      console.log('✓ Respuesta exitosa:', response.data);

      // Actualizar el estado local con la respuesta fresca del servidor
      setUsuarios(
        usuarios.map((usuario) =>
          usuario.id === usuarioId ? { ...usuario, ...response.data } : usuario
        )
      );

    } catch (err: any) {
      console.error('❌ Error actualizando usuario:', err.response?.data || err.message);
      throw new Error(err.response?.data ? JSON.stringify(err.response.data) : err.message);
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
