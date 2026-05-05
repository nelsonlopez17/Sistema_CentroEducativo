from rest_framework import serializers
from .models import Inscripcion, AsignacionCurso, Horario


class InscripcionSerializer(serializers.ModelSerializer):
    # Campos legibles (solo lectura)
    estudiante_nombre = serializers.CharField(
        source='estudiante.persona.nombres', read_only=True)
    estudiante_apellido = serializers.CharField(
        source='estudiante.persona.apellidos', read_only=True)
    estudiante_cui = serializers.CharField(
        source='estudiante.persona.cui', read_only=True)
    grado_seccion_str = serializers.SerializerMethodField()

    def get_grado_seccion_str(self, obj):
        gs = obj.grado_seccion
        return f"{gs.grado.nombre} - Sección {gs.seccion.nombre} ({gs.ciclo.anio})"

    class Meta:
        model = Inscripcion
        fields = [
            'id', 'estudiante', 'grado_seccion',
            'estudiante_nombre', 'estudiante_apellido',
            'estudiante_cui', 'grado_seccion_str',
        ]


class AsignacionCursoSerializer(serializers.ModelSerializer):
    docente_nombre = serializers.CharField(
        source='docente.persona.nombres', read_only=True)
    docente_apellido = serializers.CharField(
        source='docente.persona.apellidos', read_only=True)
    curso_nombre = serializers.CharField(
        source='pensum.curso.nombre', read_only=True)
    grado_seccion_str = serializers.SerializerMethodField()

    def get_grado_seccion_str(self, obj):
        gs = obj.grado_seccion
        return f"{gs.grado.nombre} - Sección {gs.seccion.nombre} ({gs.ciclo.anio})"

    class Meta:
        model = AsignacionCurso
        fields = [
            'id', 'pensum', 'docente', 'grado_seccion',
            'docente_nombre', 'docente_apellido',
            'curso_nombre', 'grado_seccion_str',
        ]


class HorarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Horario
        fields = '__all__'