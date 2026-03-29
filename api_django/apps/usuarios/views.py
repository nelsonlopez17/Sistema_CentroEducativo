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


class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer


class UsuarioRolViewSet(viewsets.ModelViewSet):
    queryset = UsuarioRol.objects.all()
    serializer_class = UsuarioRolSerializer