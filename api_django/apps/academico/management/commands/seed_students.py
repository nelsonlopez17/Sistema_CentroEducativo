from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.usuarios.models import Persona
from apps.academico.models import Estudiante, EstadoEstudiante
from datetime import date

class Command(BaseCommand):
    help = 'Agrega alumnos de prueba a la base de datos'

    def add_arguments(self, parser):
        parser.add_argument(
            '--cantidad',
            type=int,
            default=10,
            help='Cantidad de alumnos a crear (por defecto 10)'
        )

    def handle(self, *args, **options):
        cantidad = options['cantidad']
        
        # Crear o obtener estado "Activo"
        estado_activo, created = EstadoEstudiante.objects.get_or_create(
            nombre='Activo',
            defaults={'descripcion': 'Estudiante activo en el sistema'}
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS('✓ Estado "Activo" creado'))
        
        # Datos de prueba
        nombres_lista = [
            'Juan', 'María', 'Carlos', 'Ana', 'Pedro',
            'Laura', 'Jorge', 'Isabel', 'Miguel', 'Sofia',
            'Diego', 'Patricia', 'Antonio', 'Carmen', 'Francisco'
        ]
        
        apellidos_lista = [
            'García', 'Martínez', 'López', 'González', 'Rodríguez',
            'Hernández', 'Pérez', 'Sánchez', 'Ramírez', 'Torres'
        ]
        
        estudiantes_creados = 0
        estudiantes_existentes = 0
        
        for i in range(cantidad):
            nombres = nombres_lista[i % len(nombres_lista)]
            apellidos = apellidos_lista[i % len(apellidos_lista)]
            cui = f'{80000000000 + i:013d}'  # CUI único para cada estudiante
            
            # Crear o obtener persona
            persona, persona_created = Persona.objects.get_or_create(
                cui=cui,
                defaults={
                    'nombres': nombres,
                    'apellidos': apellidos,
                    'fecha_nacimiento': date(2005, 1, 15),
                    'direccion': f'Calle Principal {i+1}, Ciudad'
                }
            )
            
            # Crear o obtener estudiante
            estudiante, estudiante_created = Estudiante.objects.get_or_create(
                persona=persona,
                defaults={'estado': estado_activo}
            )
            
            if estudiante_created and persona_created:
                estudiantes_creados += 1
            elif not estudiante_created:
                estudiantes_existentes += 1
        
        # Mostrar resultados
        self.stdout.write(self.style.SUCCESS(f'\n✓ Proceso completado'))
        self.stdout.write(self.style.SUCCESS(f'  - Alumnos creados: {estudiantes_creados}'))
        if estudiantes_existentes > 0:
            self.stdout.write(self.style.WARNING(f'  - Alumnos que ya existían: {estudiantes_existentes}'))
