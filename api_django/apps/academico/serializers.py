from rest_framework import serializers
from .models import Docente, Estudiante, EstadoEstudiante, Grado, Seccion, Curso, Pensum
from apps.usuarios.models import Persona


class PersonaSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Persona
        fields = ['id', 'nombres', 'apellidos', 'cui', 'fecha_nacimiento', 'direccion']


class DocenteSerializer(serializers.ModelSerializer):
    persona = PersonaSimpleSerializer(read_only=True)
    persona_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Docente
        fields = ['id', 'persona', 'persona_id']


class EstadoEstudianteSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoEstudiante
        fields = '__all__'


class EstudianteSerializer(serializers.ModelSerializer):
    persona = PersonaSimpleSerializer(read_only=True)
    persona_id = serializers.IntegerField(write_only=True)
    estado_nombre = serializers.CharField(source='estado.nombre', read_only=True)

    class Meta:
        model = Estudiante
        fields = ['id', 'persona', 'persona_id', 'estado', 'estado_nombre']


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
    grado_nombre = serializers.CharField(source='grado.nombre', read_only=True)
    curso_nombre = serializers.CharField(source='curso.nombre', read_only=True)

    class Meta:
        model = Pensum
        fields = ['id', 'grado', 'curso', 'grado_nombre', 'curso_nombre']