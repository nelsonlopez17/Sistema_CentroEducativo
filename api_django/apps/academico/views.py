from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Docente, Estudiante, EstadoEstudiante, Grado, Seccion, Curso, Pensum
from .serializers import (
    DocenteSerializer, EstudianteSerializer, EstadoEstudianteSerializer,
    GradoSerializer, SeccionSerializer, CursoSerializer, PensumSerializer
)


class DocenteViewSet(viewsets.ModelViewSet):
    queryset = Docente.objects.all()
    serializer_class = DocenteSerializer


class EstadoEstudianteViewSet(viewsets.ModelViewSet):
    queryset = EstadoEstudiante.objects.all()
    serializer_class = EstadoEstudianteSerializer


class EstudianteViewSet(viewsets.ModelViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer


class GradoViewSet(viewsets.ModelViewSet):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer


class SeccionViewSet(viewsets.ModelViewSet):
    queryset = Seccion.objects.all()
    serializer_class = SeccionSerializer


class CursoViewSet(viewsets.ModelViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer


class PensumViewSet(viewsets.ModelViewSet):
    queryset = Pensum.objects.all()
    serializer_class = PensumSerializer