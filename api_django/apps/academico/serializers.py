from rest_framework import serializers
from .models import Docente, Estudiante, EstadoEstudiante, Grado, Seccion, Curso, Pensum
from apps.usuarios.models import Persona


class PersonaSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = ['id', 'nombres', 'apellidos', 'cui', 'fecha_nacimiento', 'direccion']


class DocenteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Docente
        fields = '__all__'


class EstadoEstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoEstudiante
        fields = '__all__'


class EstudianteSerializer(serializers.ModelSerializer):
    persona = PersonaSimpleSerializer(read_only=True)
    estado_nombre = serializers.CharField(source='estado.nombre', read_only=True)

    class Meta:
        model = Estudiante
        fields = ['id', 'persona', 'estado', 'estado_nombre']


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