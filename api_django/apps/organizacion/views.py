from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import CicloEscolar, Unidad, GradoSeccion
from .serializers import CicloEscolarSerializer, UnidadSerializer, GradoSeccionSerializer


class CicloEscolarViewSet(viewsets.ModelViewSet):
    queryset = CicloEscolar.objects.all()
    serializer_class = CicloEscolarSerializer


class UnidadViewSet(viewsets.ModelViewSet):
    queryset = Unidad.objects.all()
    serializer_class = UnidadSerializer


class GradoSeccionViewSet(viewsets.ModelViewSet):
    queryset = GradoSeccion.objects.all()
    serializer_class = GradoSeccionSerializer