from django.db import models

# Create your models here.
from django.db import models
from apps.academico.models import Grado, Seccion


class CicloEscolar(models.Model):
    anio = models.IntegerField(unique=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=models.Q(fecha_fin__gt=models.F('fecha_inicio')),
                name='chk_ciclo_fechas'
            )
        ]


class Unidad(models.Model):
    nombre = models.CharField(max_length=60)
    numero = models.PositiveSmallIntegerField()
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    ciclo = models.ForeignKey(CicloEscolar, on_delete=models.CASCADE, related_name='unidades')

    class Meta:
        unique_together = ('ciclo', 'numero')
        constraints = [
            models.CheckConstraint(
                condition=models.Q(numero__gte=1, numero__lte=6),
                name='chk_unidad_numero'
            ),
            models.CheckConstraint(
                condition=models.Q(fecha_fin__gt=models.F('fecha_inicio')),
                name='chk_unidad_fechas'
            )
        ]


class GradoSeccion(models.Model):
    grado = models.ForeignKey(Grado, on_delete=models.RESTRICT)
    seccion = models.ForeignKey(Seccion, on_delete=models.RESTRICT)
    ciclo = models.ForeignKey(CicloEscolar, on_delete=models.RESTRICT)

    class Meta:
        unique_together = ('grado', 'seccion', 'ciclo')