from django.db import models

# Create your models here.
from django.db import models
from apps.usuarios.models import Persona


class Docente(models.Model):
    persona = models.OneToOneField(Persona, on_delete=models.RESTRICT, related_name='docente')


class EstadoEstudiante(models.Model):
    nombre = models.CharField(max_length=60, unique=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)


class Estudiante(models.Model):
    persona = models.OneToOneField(Persona, on_delete=models.RESTRICT, related_name='estudiante')
    estado = models.ForeignKey(EstadoEstudiante, on_delete=models.RESTRICT, related_name='estudiantes')


class Grado(models.Model):
    nombre = models.CharField(max_length=60, unique=True)


class Seccion(models.Model):
    nombre = models.CharField(max_length=10, unique=True)


class Curso(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)


class Pensum(models.Model):
    grado = models.ForeignKey(Grado, on_delete=models.RESTRICT, related_name='pensum')
    curso = models.ForeignKey(Curso, on_delete=models.RESTRICT, related_name='pensum')

    class Meta:
        unique_together = ('grado', 'curso')