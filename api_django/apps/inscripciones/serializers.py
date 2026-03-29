from rest_framework import serializers
from .models import Inscripcion, AsignacionCurso, Horario


class InscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscripcion
        fields = '__all__'


class AsignacionCursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignacionCurso
        fields = '__all__'


class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = '__all__'