from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import Nota, NotaFinal, Recuperacion
from .serializers import NotaSerializer, NotaFinalSerializer, RecuperacionSerializer


class NotaViewSet(viewsets.ModelViewSet):
    queryset = Nota.objects.all()
    serializer_class = NotaSerializer
    filterset_fields = ['inscripcion', 'asignacion', 'unidad']



class NotaFinalViewSet(viewsets.ModelViewSet):
    queryset = NotaFinal.objects.all()
    serializer_class = NotaFinalSerializer


class RecuperacionViewSet(viewsets.ModelViewSet):
    queryset = Recuperacion.objects.all()
    serializer_class = RecuperacionSerializer