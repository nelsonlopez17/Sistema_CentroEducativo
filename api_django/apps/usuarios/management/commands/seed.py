from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.usuarios.models import Persona, Telefono, Usuario, Rol, UsuarioRol
from apps.academico.models import (
    Docente, Estudiante, EstadoEstudiante,
    Grado, Seccion, Curso, Pensum
)
from apps.organizacion.models import CicloEscolar, Unidad, GradoSeccion
from apps.inscripciones.models import Inscripcion, AsignacionCurso, Horario
from apps.evaluacion.models import Nota, NotaFinal, Recuperacion


class Command(BaseCommand):
    help = 'Seeder completo del sistema'

    def handle(self, *args, **kwargs):

        self.stdout.write("🚀 Iniciando seeder...")

        # =========================
        # ROLES
        # =========================
        roles = []
        roles_nombres = ['Admin', 'Docente', 'Estudiante', 'Secretaria']

        for nombre in roles_nombres:
            rol, _ = Rol.objects.get_or_create(nombre=nombre)
            roles.append(rol)

        # =========================
        # PERSONAS + USUARIOS
        # =========================
        personas = []
        usuarios = []

        for i in range(1, 5):
            persona = Persona.objects.create(
                nombres=f'Nombre{i}',
                apellidos=f'Apellido{i}',
                cui=f'123456789012{i}',
                fecha_nacimiento='2000-01-01',
                direccion=f'Zona {i}'
            )
            personas.append(persona)

            # teléfonos
            Telefono.objects.create(
                numero=f'555000{i}',
                tipo='personal',
                persona=persona
            )

            usuario = Usuario.objects.create(
                username=f'user{i}',
                persona=persona,
                is_active=True
            )
            usuario.set_password('123456')
            usuario.save()

            usuarios.append(usuario)

            # asignar rol
            UsuarioRol.objects.create(
                usuario=usuario,
                rol=roles[i-1]
            )

        # =========================
        # ESTADO ESTUDIANTE
        # =========================
        estado_activo, _ = EstadoEstudiante.objects.get_or_create(nombre='Activo')

        # =========================
        # DOCENTES Y ESTUDIANTES
        # =========================
        docentes = []
        estudiantes = []

        for i, persona in enumerate(personas):
            docente = Docente.objects.create(persona=persona)
            docentes.append(docente)

            estudiante = Estudiante.objects.create(
                persona=persona,
                estado=estado_activo
            )
            estudiantes.append(estudiante)

        # =========================
        # GRADO / SECCION / CURSO
        # =========================
        grados = []
        secciones = []
        cursos = []

        for i in range(1, 5):
            grados.append(Grado.objects.create(nombre=f'Grado {i}'))
            secciones.append(Seccion.objects.create(nombre=chr(64+i)))  # A, B, C, D
            cursos.append(Curso.objects.create(nombre=f'Curso {i}'))

        # =========================
        # PENSUM
        # =========================
        pensums = []

        for i in range(4):
            pensum = Pensum.objects.create(
                grado=grados[i],
                curso=cursos[i]
            )
            pensums.append(pensum)

        # =========================
        # CICLO ESCOLAR
        # =========================
        ciclos = []

        for i in range(4):
            ciclo = CicloEscolar.objects.create(
                anio=2024 + i,
                fecha_inicio=f'{2024+i}-01-01',
                fecha_fin=f'{2024+i}-10-01'
            )
            ciclos.append(ciclo)

        # =========================
        # UNIDADES
        # =========================
        unidades = []

        for i in range(4):
            unidad = Unidad.objects.create(
                nombre=f'Unidad {i+1}',
                numero=i+1,
                fecha_inicio='2024-01-01',
                fecha_fin='2024-02-01',
                ciclo=ciclos[0]
            )
            unidades.append(unidad)

        # =========================
        # GRADO SECCION
        # =========================
        grado_secciones = []

        for i in range(4):
            gs = GradoSeccion.objects.create(
                grado=grados[i],
                seccion=secciones[i],
                ciclo=ciclos[i]
            )
            grado_secciones.append(gs)

        # =========================
        # INSCRIPCIONES
        # =========================
        inscripciones = []

        for i in range(4):
            ins = Inscripcion.objects.create(
                estudiante=estudiantes[i],
                grado_seccion=grado_secciones[i]
            )
            inscripciones.append(ins)

        # =========================
        # ASIGNACIONES
        # =========================
        asignaciones = []

        for i in range(4):
            asignacion = AsignacionCurso.objects.create(
                pensum=pensums[i],
                docente=docentes[i],
                grado_seccion=grado_secciones[i]
            )
            asignaciones.append(asignacion)

        # =========================
        # HORARIOS
        # =========================
        for i in range(4):
            Horario.objects.create(
                dia_semana=i+1,
                hora_inicio='08:00',
                hora_fin='09:00',
                aula=f'A{i+1}',
                asignacion=asignaciones[i]
            )

        # =========================
        # NOTAS
        # =========================
        for i in range(4):
            Nota.objects.create(
                nota=80 + i,
                es_mejoramiento=False,
                inscripcion=inscripciones[i],
                asignacion=asignaciones[i],
                unidad=unidades[i]
            )

        # =========================
        # NOTA FINAL
        # =========================
        for i in range(4):
            NotaFinal.objects.create(
                nota_final=80 + i,
                aprobado=True,
                fecha_registro=timezone.now().date(),
                inscripcion=inscripciones[i],
                asignacion=asignaciones[i]
            )

        # =========================
        # RECUPERACION
        # =========================
        for i in range(4):
            Recuperacion.objects.create(
                nota_recuperacion=70 + i,
                aprobado=True,
                fecha_examen=timezone.now().date(),
                inscripcion=inscripciones[i],
                asignacion=asignaciones[i]
            )

        self.stdout.write(self.style.SUCCESS("✅ Seeder ejecutado correctamente"))