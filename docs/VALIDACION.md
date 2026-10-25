# Validación final del laboratorio
Fecha: 25 de octubre de 2026, America/Bogota.

## Resultados ejecutados
| Comprobación | Resultado |
|---|---|
| Aplicación | 8 grupos de pruebas aprobados; lint y compilación correctos |
| SQLite | Se usa node:sqlite de Node 24; se eliminó sqlite3 y la necesidad de compiladores |
| Docker real | Engine 29.8.2 dentro de Fedora 44/WSL; build, health, 401/200, métricas y UID 10001 comprobados |
| Podman real | Cliente Windows 5.8.3 y servidor 5.8.9; rootless; mismo Dockerfile; humo correcto en puerto 3002 |
| Restricciones | Readonly, no-new-privileges, UID/GID 10001 y descarte de capacidades inspeccionados en ambos motores |
| Recursos Docker | Configurados 512 MiB, 1 CPU, 100 procesos; el motor advierte falta de límite de swap en WSL |
| Recursos Podman rootless | WSL no delega cgroups; la comparación explícita usa ulimit y registra ausencia de límites CPU/memoria |
| Compose | 5.6.0: volumen nuevo treecify-lab_lab-data, contenedor Healthy, humo correcto y apagado comprobado |
| Proveedor Podman Compose | Se encontró Docker Compose 5.6.0 dentro de la máquina; no se afirma compatibilidad completa |
| Rego | 6 pruebas Docker y 7 Kubernetes aprobadas; archivos reales pasan; violaciones detectadas |
| Secretos | Árbol y todos los commits de HEAD de laboratorio pasan Gitleaks sin allowlist |
| Historial original | main y etiquetas no se reescribieron; la clave antigua requiere rotación si se utilizó |
| GitHub Actions | Código, imagen y Kubernetes ejecutados y verdes |
| Fallos controlados | Tres rojos por secreto ficticio, política propia y SAST; tres correcciones verdes |
| Imagen y SBOM | CycloneDX 1.7 con 137 componentes (136 bibliotecas y un SO), 136 PURL; cero HIGH/CRITICAL en imagen y SBOM |
| Kubernetes | kind 0.31.0 y nodo 1.35.0 por digest en runner Linux; despliegue y experimentos aprobados |
| Recuperación | Pod eliminado y reemplazado; en ejecución de referencia se observó recuperación en 9 s |
| Rollout fallido | Imagen inexistente rechazó disponibilidad de nueva réplica; timeout intencional de 30 s y rollback correcto |
| Escala | Cinco pods Ready y regreso a dos réplicas; SQLite/avatares independientes por pod |
| Observabilidad | Eventos 401 y métricas obtenidos por cada una de las cinco réplicas; logs JSON válidos |
| Tráfico de referencia | 155 solicitudes de prueba; 155 respuestas 200 y cero errores durante los escenarios |
| Capturas | Interfaz real de GitHub y visor de logs originales, con fuente y hash; índice en evidencias/ |

## Ejecuciones de referencia
- Pipeline completo, incluidos experimentos Kubernetes: [40231701262](https://github.com/Saackboi/treecify/actions/runs/40231701262).
- Primer pipeline verde de imagen y controles: [40230814876](https://github.com/Saackboi/treecify/actions/runs/40230814876).
- Las parejas rojo/verde y sus causas están en [EVIDENCIAS.md](EVIDENCIAS.md).

Los reportes descargados de Actions se verificaron contra el SHA-256 del artefacto.
La ejecución de referencia corresponde a 21d149c; una nueva ejecución puede cambiar
nombres de pods, reparto, tiempos y contadores. Son observaciones, no garantías generales.

## Diferencias reales entre Windows y runner
La creación de kind en el WSL de este equipo falló por la jerarquía/delegación de
cgroups. Se conservó su salida en evidencias/k8s-create.txt. No se quitaron controles
de Kubernetes: el mismo código se ejecutó correctamente en un clúster kind efímero
local al runner Ubuntu de GitHub Actions. Las capturas identifican explícitamente
este entorno; no se presentan como un clúster exitoso en el equipo Windows.

Podman rootless pudo construir y ejecutar la aplicación. Su modo OCI predeterminado
omitía HEALTHCHECK; --format docker lo conserva. Las opciones tmpfs uid/gid del cliente
remoto no eran admitidas: se usa mode=1777 en almacenamiento efímero de un único
contenedor, manteniendo el proceso con UID 10001. La falta de cgroups se registra
mediante PODMAN_ROOTLESS_CGROUPS=unavailable; no es un fallback silencioso ni afecta
las restricciones de Docker Compose, Kubernetes o CI.

## Deuda que no se ha ocultado
- Tres avisos moderados de desarrollo en Tailwind/PostCSS, bajo el umbral HIGH/CRITICAL.
- La rotación de la clave en cualquier servidor activo debe confirmarla su administrador.
- main mantiene el historial original; no integrar la rama saneada hasta coordinar ese historial.
- SQLite y archivos locales no proporcionan persistencia compartida ni alta disponibilidad de datos.
- JWT en localStorage, rate limit por proceso y /metrics público se documentan como límites del laboratorio.
- Informe PDF, diagramas, aportes individuales y defensa siguen siendo entregables del grupo.

Todos los cambios y pruebas se hicieron en Workspace 2 y entornos de laboratorio.
Workspace 1 solo se leyó. No se accedió al servidor activo ni se modificó main.
