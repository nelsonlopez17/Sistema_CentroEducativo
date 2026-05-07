from django.db import models

# Create your models here.
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.inscripciones.models import Inscripcion, AsignacionCurso
from apps.organizacion.models import Unidad


class Nota(models.Model):
    nota = models.DecimalField(max_digits=5, decimal_places=2,
                               validators=[MinValueValidator(0), MaxValueValidator(100)])
    es_mejoramiento = models.BooleanField(default=False)
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.RESTRICT, related_name='notas')
    asignacion = models.ForeignKey(AsignacionCurso, on_delete=models.RESTRICT)
    unidad = models.ForeignKey(Unidad, on_delete=models.RESTRICT)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['inscripcion', 'asignacion', 'unidad'],
                condition=models.Q(es_mejoramiento=False),
                name='uq_nota_ordinaria'
            ),
            models.UniqueConstraint(
                fields=['inscripcion', 'asignacion', 'unidad'],
                condition=models.Q(es_mejoramiento=True),
                name='uq_nota_mejoramiento'
            )
        ]


class NotaFinal(models.Model):
    nota_final = models.DecimalField(max_digits=5, decimal_places=2,
                                     validators=[MinValueValidator(0), MaxValueValidator(100)])
    aprobado = models.BooleanField()
    fecha_registro = models.DateField(auto_now_add=True)
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.RESTRICT)
    asignacion = models.ForeignKey(AsignacionCurso, on_delete=models.RESTRICT)

    class Meta:
        unique_together = ('inscripcion', 'asignacion')


class Recuperacion(models.Model):
    nota_recuperacion = models.DecimalField(max_digits=5, decimal_places=2,
                                            validators=[MinValueValidator(0), MaxValueValidator(100)])
    aprobado = models.BooleanField()
    fecha_examen = models.DateField()
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.RESTRICT)
    asignacion = models.ForeignKey(AsignacionCurso, on_delete=models.RESTRICT)

    class Meta:
        unique_together = ('inscripcion', 'asignacion')