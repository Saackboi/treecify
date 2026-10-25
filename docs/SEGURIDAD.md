# Inventario inicial y secretos
## Sistema
| Elemento | Inventario |
|---|---|
| Origen | Saackboi/treecify, main; la copia de laboratorio conserva su historial |
| Ruta | A: aplicación web ejecutable en Linux |
| Frontend | React 19, Vite 7, Tailwind 3, React Router |
| Backend | Node 24.22.1, Express 5, sqlite3, bcryptjs, jsonwebtoken |
| Persistencia | SQLite local y avatares; sin estado compartido entre réplicas |
| Entradas | Registro/login, perfiles, enlaces, subida de avatar, frontend SPA |
| Componentes nuevos | sharp, express-rate-limit, health/readiness, logs/métricas, CI, políticas, kind |
| Exposición original | JWT_SECRET literal en Compose y archivo CasaOS; sin valores reproducidos aquí |

La clave publicada debe tratarse como comprometida si se usó en cualquier despliegue.
Este trabajo no accede al servidor activo ni confirma que se haya rotado allí.

## Mapa de secretos por entorno
| Entorno | Inventario / ubicación | Inyección | Persistencia |
|---|---|---|---|
| Desarrollo local | JWT_SECRET en .env ignorado | dotenv al arrancar | Archivo privado; nunca compartir |
| Compose | JWT_SECRET en entorno/.env | Interpolación requerida por Compose | No se escribe en imagen |
| Docker/Podman comparativo | Aleatorio de 48 bytes | Variable de entorno con -e JWT_SECRET | Solo la ejecución local |
| CI | Aleatorio generado para el runner | Solo en el paso de humo | Efímero; add-mask protege salida accidental |
| kind | Secret treecify-secret en namespace treecify-lab | secretKeyRef | Se crea desde archivo temporal con permisos restringidos |
| Tokens de prueba | JWT sintético con duración de 1 hora | Authorization: Bearer | No se guardan en evidencias |

Los Secret Kubernetes son base64, no cifrado. Pueden requerir cifrado de etcd,
RBAC, External Secrets o bóveda en escenarios reales. No se versiona YAML de secretos.

## Rotación (registro a completar por responsable)
| Elemento | Disparador | Procedimiento | Responsable / verificación |
|---|---|---|---|
| Clave histórica | Publicación previa | Generar clave nueva en cada entorno donde se utilizó; reiniciar emisor y verificador; invalidar sesiones antiguas | Pendiente confirmar por administrador del entorno activo |
| Clave local | Al crear laboratorio o compartir accidentalmente | Reemplazar .env; reiniciar app/Compose | Operador; JWT anterior debe devolver 401 |
| Secret kind | Antes de una nueva demostración o exposición | Recrear solo treecify-secret en contexto kind-treecify-lab; rollout restart deployment/treecify | Operador; probar token nuevo y rechazo del anterior |
| CI | En cada ejecución | Generación efímera automática | Workflow; sin secreto persistente |
| Entorno comprometido por herramienta CI | Incidente de suministro | Detener workflow, revocar/rotar credenciales accesibles, revisar logs y artefactos, verificar ejecutables y reanudar con referencias revisadas | Dueño del repositorio y cada credencial afectada |

## Historial: bloqueo real, no excepción
Gitleaks detectó generic-api-key en:
- commit 0294c5c14a17302e85b2792a505f95134956328b, docker-compose.yml, línea histórica 25;
- mismo commit, qr-biolink.yaml, línea histórica 29.

No se incluye el valor ni se añade allowlist. El pipeline seguirá bloqueando su historial.
La copia actual sí elimina ambos valores. Una limpieza coordinada requiere:
1. Rotar la credencial primero y comprobar el rechazo de tokens antiguos.
2. Hacer respaldo y acordar la reescritura con colaboradores.
3. En una copia desechable, usar git-filter-repo para reemplazar el secreto exacto
   mediante archivo local privado, sin ponerlo en el comando o esta documentación.
4. Revisar todas las referencias, ejecutar Gitleaks sobre ellas y atender los
   procedimientos de GitHub para datos sensibles en cachés o forks.
5. Actualizar las ramas remotas con autorización del dueño; los colaboradores
   deben volver a clonar o limpiar referencias antiguas.

Borrar una línea o hacer revert NO elimina un secreto de commits anteriores.
No se reescribió ni forzó ninguna rama remota durante esta implementación.
No activar una exclusión general de generic-api-key para conseguir una ejecución verde.

## Reglas de fallo y deuda
- Gitleaks: cualquier secreto detectado bloquea, con redacción.
- Semgrep: cualquier resultado de las reglas configuradas bloquea.
- npm audit: HIGH/CRITICAL de runtime o desarrollo bloquean.
- Trivy fs/image/SBOM: HIGH/CRITICAL bloquean; no se usa ignore-unfixed.
- Conftest: cualquier deny bloquea.
- Tres vulnerabilidades moderadas de la cadena Tailwind 3/PostCSS permanecen bajo el umbral:
  migrar a Tailwind 4 requiere revisar estilos. No hay excepción de CVE que esconda hallazgos.
- El entorno de GitHub Actions debe considerarse expuesto si ejecuta una herramienta
  comprometida con credenciales accesibles. Fijar SHA/digest reduce la mutabilidad
  de referencias; no prueba por sí solo la legitimidad del código.
