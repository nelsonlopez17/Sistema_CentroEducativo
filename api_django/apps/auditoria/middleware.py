import json
from .models import Auditoria
from django.utils.deprecation import MiddlewareMixin

class AuditoriaMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        # Evitar auditar si la respuesta no es exitosa o si no es una operación de escritura
        if response.status_code < 200 or response.status_code >= 300:
            return response
            
        if request.method not in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return response

        try:
            # 1. Identificar tabla desde la URL
            path_parts = [p for p in request.path.split('/') if p]
            if len(path_parts) < 2:
                return response
            
            # El primer elemento suele ser 'api', el segundo la tabla
            tabla = path_parts[1]
            
            # Evitar auditar la propia tabla de auditoría para prevenir bucles
            if tabla == 'auditoria':
                return response

            # 2. Identificar operación
            operacion = {'POST': 'I', 'PUT': 'U', 'PATCH': 'U', 'DELETE': 'D'}.get(request.method, 'O')

            # 3. Identificar ID del registro
            id_registro = 0
            if request.method == 'POST':
                try:
                    # Intentar obtener ID de la respuesta sin bloquear
                    content = response.content.decode('utf-8') if hasattr(response, 'content') else '{}'
                    resp_data = json.loads(content)
                    id_registro = resp_data.get('id', 0)
                except:
                    pass
            else:
                try:
                    # Tomar el último segmento numérico de la URL
                    for part in reversed(path_parts):
                        if part.isdigit():
                            id_registro = int(part)
                            break
                except:
                    pass

            # 4. Obtener Datos (Safe Read)
            datos_nuevos = None
            if request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    # Solo leer si el Content-Type es JSON
                    if 'application/json' in request.content_type:
                        datos_nuevos = json.loads(request.body)
                except:
                    pass

            # 5. Guardar Auditoría
            Auditoria.objects.create(
                tabla=tabla,
                operacion=operacion,
                id_registro=id_registro,
                usuario=request.user if request.user.is_authenticated else None,
                ip_cliente=self._get_client_ip(request),
                datos_nuevos=datos_nuevos
            )

        except Exception as e:
            # No bloquear el flujo principal por un error en auditoría
            pass
        
        return response

    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')

