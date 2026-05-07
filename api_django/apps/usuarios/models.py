from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
from django.db import models
from django.core.validators import RegexValidator
from django.contrib.auth.models import AbstractUser


telefono_validator = RegexValidator(
    regex=r'^\d{8}$',
    message='El número debe tener 8 dígitos'
)

class Persona(models.Model):
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    cui = models.CharField(max_length=13, unique=True)
    fecha_nacimiento = models.DateField()
    direccion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)


    def __str__(self):
        return f"{self.nombres} {self.apellidos}"


class Telefono(models.Model):
    TIPO_CHOICES = [
        ('personal', 'Personal'),
        ('trabajo', 'Trabajo'),
        ('emergencia', 'Emergencia'),
    ]

    numero = models.CharField(max_length=8, validators=[telefono_validator])
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, default='personal')
    persona = models.ForeignKey(Persona, on_delete=models.CASCADE, related_name='telefonos')
    

    class Meta:
        unique_together = ('numero', 'persona')


class Rol(models.Model):
    nombre = models.CharField(max_length=60, unique=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)


class Usuario(AbstractUser):
    persona = models.OneToOneField(
        'usuarios.Persona',
        on_delete=models.RESTRICT,
        related_name='usuario'
    )


class UsuarioRol(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='roles')
    rol = models.ForeignKey(Rol, on_delete=models.RESTRICT, related_name='usuarios')

    class Meta:
        unique_together = ('usuario', 'rol')