from rest_framework import serializers
from .models import CicloEscolar, Unidad, GradoSeccion


class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidad
        fields = '__all__'


class CicloEscolarSerializer(serializers.ModelSerializer):
    unidades = UnidadSerializer(many=True, read_only=True)
    unidades_count = serializers.IntegerField(source='unidades.count', read_only=True)

    class Meta:
        model = CicloEscolar
        fields = ['id', 'anio', 'fecha_inicio', 'fecha_fin', 'unidades', 'unidades_count']


class GradoSeccionSerializer(serializers.ModelSerializer):
    grado_nombre = serializers.CharField(source='grado.nombre', read_only=True)
    seccion_nombre = serializers.CharField(source='seccion.nombre', read_only=True)
    ciclo_anio = serializers.IntegerField(source='ciclo.anio', read_only=True)

    class Meta:
        model = GradoSeccion
        fields = ['id', 'grado', 'seccion', 'ciclo', 'grado_nombre', 'seccion_nombre', 'ciclo_anio']