from django.db import models

# Create your models here.
from django.db import models
from apps.academico.models import Estudiante, Docente, Pensum
from apps.organizacion.models import GradoSeccion


class Inscripcion(models.Model):
    estudiante = models.ForeignKey(Estudiante, on_delete=models.RESTRICT, related_name='inscripciones')
    grado_seccion = models.ForeignKey(GradoSeccion, on_delete=models.RESTRICT, related_name='inscripciones')

    class Meta:
        unique_together = ('estudiante', 'grado_seccion')


class AsignacionCurso(models.Model):
    pensum = models.ForeignKey(Pensum, on_delete=models.RESTRICT)
    docente = models.ForeignKey(Docente, on_delete=models.RESTRICT)
    grado_seccion = models.ForeignKey(GradoSeccion, on_delete=models.RESTRICT)

    class Meta:
        unique_together = ('pensum', 'grado_seccion')


class Horario(models.Model):
    DIA_CHOICES = [(i, i) for i in range(1, 6)]

    dia_semana = models.PositiveSmallIntegerField(choices=DIA_CHOICES)
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    aula = models.CharField(max_length=30, blank=True, null=True)
    asignacion = models.ForeignKey(AsignacionCurso, on_delete=models.CASCADE, related_name='horarios')