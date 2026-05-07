from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Docente, Estudiante, EstadoEstudiante, Grado, Seccion, Curso, Pensum
from .serializers import (
    DocenteSerializer, EstudianteSerializer, EstadoEstudianteSerializer,
    GradoSerializer, SeccionSerializer, CursoSerializer, PensumSerializer
)


from rest_framework.response import Response
from rest_framework import status

class LogicalDeleteViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        # Por defecto solo mostrar activos
        return self.queryset.filter(activo=True)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.activo = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocenteViewSet(LogicalDeleteViewSet):
    queryset = Docente.objects.all()
    serializer_class = DocenteSerializer


class EstadoEstudianteViewSet(viewsets.ModelViewSet):
    queryset = EstadoEstudiante.objects.all()
    serializer_class = EstadoEstudianteSerializer


class EstudianteViewSet(LogicalDeleteViewSet):
    queryset = Estudiante.objects.all()
    serializer_class = EstudianteSerializer


class GradoViewSet(LogicalDeleteViewSet):
    queryset = Grado.objects.all()
    serializer_class = GradoSerializer


class SeccionViewSet(LogicalDeleteViewSet):
    queryset = Seccion.objects.all()
    serializer_class = SeccionSerializer


class CursoViewSet(LogicalDeleteViewSet):
    queryset = Curso.objects.all()
    serializer_class = CursoSerializer


class PensumViewSet(viewsets.ModelViewSet):
    queryset = Pensum.objects.all()
    serializer_class = PensumSerializer