from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator


# ============================
# VALIDADORES
# ============================

telefono_validator = RegexValidator(
    regex=r'^\d{8}$',
    message='El número de teléfono debe tener 8 dígitos (Guatemala)'
)


# ============================
# PERSONA / TELEFONO
# ============================

class Persona(models.Model):
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    cui = models.CharField(max_length=13, unique=True)
    fecha_nacimiento = models.DateField()

    direccion = models.TextField(blank=True, null=True)

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

    def __str__(self):
        return f"{self.numero} ({self.tipo})"


# ============================
# USUARIOS Y ROLES
# ============================

class Rol(models.Model):
    nombre = models.CharField(max_length=60, unique=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombre


class Usuario(models.Model):
    username = models.CharField(max_length=60, unique=True)
    password_hash = models.CharField(max_length=255)
    activo = models.BooleanField(default=True)
    persona = models.OneToOneField(Persona, on_delete=models.RESTRICT, related_name='usuario')

    def __str__(self):
        return self.username


class UsuarioRol(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name='roles')
    rol = models.ForeignKey(Rol, on_delete=models.RESTRICT, related_name='usuarios')

    class Meta:
        unique_together = ('usuario', 'rol')


# ============================
# DOCENTE / ESTUDIANTE
# ============================

class Docente(models.Model):
    persona = models.OneToOneField(Persona, on_delete=models.RESTRICT, related_name='docente')


class EstadoEstudiante(models.Model):
    nombre = models.CharField(max_length=60, unique=True)
    descripcion = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.nombre


class Estudiante(models.Model):
    persona = models.OneToOneField(Persona, on_delete=models.RESTRICT, related_name='estudiante')
    estado = models.ForeignKey(EstadoEstudiante, on_delete=models.RESTRICT, related_name='estudiantes')


# ============================
# ESTRUCTURA ACADEMICA
# ============================

class Grado(models.Model):
    nombre = models.CharField(max_length=60, unique=True)

    def __str__(self):
        return self.nombre


class Seccion(models.Model):
    nombre = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.nombre


class CicloEscolar(models.Model):
    anio = models.IntegerField(unique=True)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(fecha_fin__gt=models.F('fecha_inicio')),
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
                check=models.Q(numero__gte=1, numero__lte=6),
                name='chk_unidad_numero'
            ),
            models.CheckConstraint(
                check=models.Q(fecha_fin__gt=models.F('fecha_inicio')),
                name='chk_unidad_fechas'
            )
        ]


# ============================
# CURSOS Y PENSUM
# ============================

class Curso(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre


class Pensum(models.Model):
    grado = models.ForeignKey(Grado, on_delete=models.RESTRICT, related_name='pensum')
    curso = models.ForeignKey(Curso, on_delete=models.RESTRICT, related_name='pensum')

    class Meta:
        unique_together = ('grado', 'curso')


class GradoSeccion(models.Model):
    grado = models.ForeignKey(Grado, on_delete=models.RESTRICT)
    seccion = models.ForeignKey(Seccion, on_delete=models.RESTRICT)
    ciclo = models.ForeignKey(CicloEscolar, on_delete=models.RESTRICT)

    class Meta:
        unique_together = ('grado', 'seccion', 'ciclo')


# ============================
# INSCRIPCION / ASIGNACION
# ============================

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

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(hora_fin__gt=models.F('hora_inicio')),
                name='chk_horario_horas'
            )
        ]


# ============================
# NOTAS
# ============================

class Nota(models.Model):
    nota = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    es_mejoramiento = models.BooleanField(default=False)
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.CASCADE, related_name='notas')
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
    nota_final = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    aprobado = models.BooleanField()
    fecha_registro = models.DateField(auto_now_add=True)
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.CASCADE)
    asignacion = models.ForeignKey(AsignacionCurso, on_delete=models.RESTRICT)

    class Meta:
        unique_together = ('inscripcion', 'asignacion')


class Recuperacion(models.Model):
    nota_recuperacion = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    aprobado = models.BooleanField()
    fecha_examen = models.DateField()
    inscripcion = models.ForeignKey(Inscripcion, on_delete=models.CASCADE)
    asignacion = models.ForeignKey(AsignacionCurso, on_delete=models.RESTRICT)

    class Meta:
        unique_together = ('inscripcion', 'asignacion')


# ============================
# AUDITORIA
# ============================

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