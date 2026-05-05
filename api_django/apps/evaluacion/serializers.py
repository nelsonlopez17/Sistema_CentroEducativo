from rest_framework import serializers
from .models import Nota, NotaFinal, Recuperacion


class NotaSerializer(serializers.ModelSerializer):
    # Campos legibles (solo lectura)
    alumno_nombre = serializers.CharField(
        source='inscripcion.estudiante.persona.nombres', read_only=True)
    alumno_apellido = serializers.CharField(
        source='inscripcion.estudiante.persona.apellidos', read_only=True)
    alumno_cui = serializers.CharField(
        source='inscripcion.estudiante.persona.cui', read_only=True)
    curso_nombre = serializers.CharField(
        source='asignacion.pensum.curso.nombre', read_only=True)
    unidad_nombre = serializers.CharField(
        source='unidad.nombre', read_only=True)
    unidad_numero = serializers.IntegerField(
        source='unidad.numero', read_only=True)

    class Meta:
        model = Nota
        fields = [
            'id', 'inscripcion', 'asignacion', 'unidad', 'nota', 'es_mejoramiento',
            'alumno_nombre', 'alumno_apellido', 'alumno_cui',
            'curso_nombre', 'unidad_nombre', 'unidad_numero',
        ]


class NotaFinalSerializer(serializers.ModelSerializer):
    alumno_nombre = serializers.CharField(
        source='inscripcion.estudiante.persona.nombres', read_only=True)
    alumno_apellido = serializers.CharField(
        source='inscripcion.estudiante.persona.apellidos', read_only=True)
    curso_nombre = serializers.CharField(
        source='asignacion.pensum.curso.nombre', read_only=True)

    class Meta:
        model = NotaFinal
        fields = [
            'id', 'inscripcion', 'asignacion', 'nota_final', 'aprobado', 'fecha_registro',
            'alumno_nombre', 'alumno_apellido', 'curso_nombre',
        ]


class RecuperacionSerializer(serializers.ModelSerializer):
    alumno_nombre = serializers.CharField(
        source='inscripcion.estudiante.persona.nombres', read_only=True)
    alumno_apellido = serializers.CharField(
        source='inscripcion.estudiante.persona.apellidos', read_only=True)
    curso_nombre = serializers.CharField(
        source='asignacion.pensum.curso.nombre', read_only=True)

    class Meta:
        model = Recuperacion
        fields = [
            'id', 'inscripcion', 'asignacion', 'nota_recuperacion', 'aprobado', 'fecha_examen',
            'alumno_nombre', 'alumno_apellido', 'curso_nombre',
        ]