
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter


from apps.usuarios.views import *
from apps.academico.views import *
from apps.organizacion.views import *
from apps.inscripciones.views import *
from apps.evaluacion.views import *
from apps.auditoria.views import *

router = DefaultRouter()

# usuarios
router.register(r'personas', PersonaViewSet)
router.register(r'telefonos', TelefonoViewSet)
router.register(r'usuarios', UsuarioViewSet)
router.register(r'roles', RolViewSet)
router.register(r'usuario-roles', UsuarioRolViewSet)

# academico
router.register(r'docentes', DocenteViewSet)
router.register(r'estudiantes', EstudianteViewSet)
router.register(r'estados-estudiante', EstadoEstudianteViewSet)
router.register(r'grados', GradoViewSet)
router.register(r'secciones', SeccionViewSet)
router.register(r'cursos', CursoViewSet)
router.register(r'pensum', PensumViewSet)

# organizacion
router.register(r'ciclos', CicloEscolarViewSet)
router.register(r'unidades', UnidadViewSet)
router.register(r'grado-seccion', GradoSeccionViewSet)

# inscripciones
router.register(r'inscripciones', InscripcionViewSet)
router.register(r'asignaciones', AsignacionCursoViewSet)
router.register(r'horarios', HorarioViewSet)

# evaluacion
router.register(r'notas', NotaViewSet)
router.register(r'notas-finales', NotaFinalViewSet)
router.register(r'recuperaciones', RecuperacionViewSet)

# auditoria
router.register(r'auditoria', AuditoriaViewSet)


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/', include('apps.auth.urls')),
]