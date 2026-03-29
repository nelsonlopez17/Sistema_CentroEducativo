from django.db import models

# Create your models here.
from django.db import models
from apps.usuarios.models import Usuario


class Auditoria(models.Model):
    tabla = models.CharField(max_length=60)
    operacion = models.CharField(max_length=1)
    id_registro = models.IntegerField()
    datos_anteriores = models.JSONField(blank=True, null=True)
    datos_nuevos = models.JSONField(blank=True, null=True)
    usuario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    ip_cliente = models.GenericIPAddressField(null=True, blank=True)
    fecha_hora = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['tabla']),
            models.Index(fields=['tabla', 'id_registro']),
            models.Index(fields=['fecha_hora']),
            models.Index(fields=['usuario']),
        ]