from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Inscripcion, AsignacionCurso, Horario
from .serializers import InscripcionSerializer, AsignacionCursoSerializer, HorarioSerializer


class InscripcionViewSet(viewsets.ModelViewSet):
    queryset = Inscripcion.objects.all()
    serializer_class = InscripcionSerializer


class AsignacionCursoViewSet(viewsets.ModelViewSet):
    queryset = AsignacionCurso.objects.all()
    serializer_class = AsignacionCursoSerializer


class HorarioViewSet(viewsets.ModelViewSet):
    queryset = Horario.objects.all()
    serializer_class = HorarioSerializer