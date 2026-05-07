from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets
from .models import Persona, Telefono, Usuario, Rol, UsuarioRol
from .serializers import (
    PersonaSerializer, TelefonoSerializer,
    UsuarioSerializer, RolSerializer, UsuarioRolSerializer
)


class PersonaViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.all()
    serializer_class = PersonaSerializer
    search_fields = ['nombres', 'apellidos', 'cui']


class TelefonoViewSet(viewsets.ModelViewSet):
    queryset = Telefono.objects.all()
    serializer_class = TelefonoSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    search_fields = ['username']

    def perform_update(self, serializer):
        data = self.request.data
        try:
            # 1. Guardar cambios básicos del usuario (email, is_active, etc.)
            usuario = serializer.save()
            
            # 2. Actualizar Persona vinculada (Nombres, Apellidos, CUI, etc.)
            if 'persona' in data and isinstance(data['persona'], dict):
                p_data = data['persona']
                p_id = p_data.get('id')
                if p_id:
                    Persona.objects.filter(id=p_id).update(
                        nombres=p_data.get('nombres'),
                        apellidos=p_data.get('apellidos'),
                        cui=p_data.get('cui'),
                        fecha_nacimiento=p_data.get('fecha_nacimiento'),
                        direccion=p_data.get('direccion')
                    )

            # 3. Actualizar Roles (Limpiar y recrear)
            if 'roles' in data:
                roles_input = data.get('roles', [])
                # Asegurar que sea una lista de IDs
                roles_ids = []
                for r in roles_input:
                    if isinstance(r, dict):
                        roles_ids.append(r.get('id'))
                    else:
                        roles_ids.append(r)
                
                UsuarioRol.objects.filter(usuario=usuario).delete()
                for rid in roles_ids:
                    if rid:
                        rol = Rol.objects.filter(id=rid).first()
                        if rol:
                            UsuarioRol.objects.create(usuario=usuario, rol=rol)
                            
        except Exception as e:
            print(f"Error actualizando usuario: {str(e)}")
            from rest_framework import serializers
            raise serializers.ValidationError({"detail": str(e)})




class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer


class UsuarioRolViewSet(viewsets.ModelViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer