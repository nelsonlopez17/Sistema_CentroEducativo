from rest_framework import serializers
from .models import Docente, Estudiante, EstadoEstudiante, Grado, Seccion, Curso, Pensum


class DocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Docente
        fields = '__all__'


class EstadoEstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoEstudiante
        fields = '__all__'


class EstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Estudiante
        fields = '__all__'


class GradoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grado
        fields = '__all__'


class SeccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seccion
        fields = '__all__'


class CursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curso
        fields = '__all__'


class PensumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pensum
        fields = '__all__'