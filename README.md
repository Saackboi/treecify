# Treecify · LAB-TE2-03
Copia de laboratorio de [Saackboi/treecify](https://github.com/Saackboi/treecify),
Ruta A: React + Express + SQLite. Trabajo en la rama publicada [`lab/devsecops`](https://github.com/Saackboi/treecify/tree/lab/devsecops).
Solo datos ficticios y entornos locales. No utiliza rutas ni volúmenes del servidor activo.

## Ejecutar sin contenedor
Requiere Node **24.22.1** y npm. En PowerShell, use `npm.cmd` si la política de ejecución bloquea `npm.ps1`.

```powershell
Copy-Item .env.example .env
# Genere una clave nueva y copie el resultado en JWT_SECRET dentro de .env:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
npm.cmd ci
npm.cmd test
npm.cmd run lint
npm.cmd run build
npm.cmd start
```

En otra terminal: `npm.cmd run smoke`. El humo crea un usuario ficticio con sufijo
aleatorio. La aplicación abre en http://localhost:3001; la contraseña requiere
12 caracteres como mínimo y 72 bytes como máximo.

Configuración: `PORT`, `PUBLIC_URL`, `CORS_ORIGINS`, `JWT_SECRET`, `DB_PATH`,
`UPLOAD_DIR`, `INSTANCE_NAME`. Una clave ausente, corta o de ejemplo impide arrancar.
No copie el valor histórico del repositorio.

## Contrato HTTP
| Ruta | Acceso | Resultado |
|---|---|---|
| GET /health | Público | 200, estado e instancia |
| GET /ready | Público | 200 si SQLite responde, 503 en fallo |
| GET /api/resumen | JWT Bearer HS256 | Conteo de enlaces del sujeto + instancia; 401 sin token válido |
| GET /metrics | Público, solo laboratorio | Contador Prometheus por ruta/código/instancia |
| POST /api/auth/register | Público con límite por IP | Usuario ficticio, contraseña bcrypt y JWT de una hora |
| POST /api/auth/login | Público con límite por IP | JWT con issuer y audience |
| /api/links y /api/user | JWT, salvo perfil público | Datos acotados al usuario y validación de entradas |

Los avatares admiten PNG/JPEG/WebP hasta 2 MiB y 16 millones de píxeles de entrada:
se decodifican, redimensionan y recodifican a WebP sin metadatos antes de publicarlos.
Los nombres son UUID; no se usa el nombre recibido como ruta. CSP restringe scripts
al mismo origen y permite estilos inline que usa la interfaz actual.

## Docker, Podman, Kubernetes y pipeline
- `docker compose up --build -d`: datos nuevos en volumen **treecify-lab_lab-data**, puerto loopback 3001.
- `bash scripts/containers.sh docker` y `bash scripts/containers.sh podman`: comparaciones reales con datos efímeros; guardan evidencia saneada.
- En este WSL, Podman se comprobó con `PODMAN_ROOTLESS_CGROUPS=unavailable LAB_PORT=3002 bash scripts/containers.sh podman`; la limitación de recursos queda registrada.
- `bash scripts/compose-check.sh`: verifica Compose con imagen ya construida y clave efímera.
- `bash scripts/policy-check.sh`: 13 pruebas Rego y validación de Dockerfile/Kubernetes.
- `bash scripts/kind-up.sh docker` o `bash scripts/kind-up.sh podman`: clúster nuevo **treecify-lab**, secreto generado fuera de Git.
- `bash scripts/k8s-experiments.sh`: eliminación de pod, imagen inexistente/rollback, 5 réplicas y retorno, tráfico, logs y métricas por réplica.

Use Bash de WSL o Git Bash para los scripts. Podman en Windows requiere una máquina
Linux iniciada. El proveedor Compose de Podman es opcional y debe verificarse aparte.
Los scripts Kubernetes fijan contexto y namespace; no dependen del contexto activo.

**SQLite y avatares no se comparten entre pods.** Kubernetes usa `emptyDir`: los
datos ficticios se pierden al reemplazar un pod. La prueba de reparto usa un sujeto
JWT sintético y consultas sin escritura. No demuestra alta disponibilidad de datos.

## Recorrido y estado verificable
- [Guía técnica y trazabilidad](docs/TRAZABILIDAD.md)
- [Operación, evidencias y fallos controlados](docs/LABORATORIO.md)
- [Inventario y gestión de secretos](docs/SEGURIDAD.md)
- [Resultados verificados y límites](docs/VALIDACION.md)
- [Capturas y parejas rojo/verde](docs/EVIDENCIAS.md)
- [Comparación Docker–Podman para completar con resultados](docs/COMPARACION-MOTORES.md)

El workflow ejecuta pruebas, Gitleaks, Semgrep, npm audit, Trivy, Conftest,
construcción, humo endurecido, SBOM CycloneDX y análisis, además de Kubernetes real en kind.
El pipeline completo y los tres casos rojo/verde ya se ejecutaron. Las capturas y logs
están en evidencias/; el visor se genera con python scripts/build-evidence-gallery.py.
Falla ante secretos, hallazgos SAST, políticas incumplidas o vulnerabilidades
HIGH/CRITICAL; no usa `continue-on-error` en controles. Las acciones usan SHA completo
y las imágenes externas digest verificado. Dependabot revisa npm, Actions y Docker.

**Historial del laboratorio saneado:** todos los commits alcanzables desde HEAD de esta rama pasan Gitleaks.
El control recorre todo el historial de HEAD, no otras ramas ajenas a esta entrega.
Se conservan main y las etiquetas originales sin reescritura: allí permanece la antigua
exposición, que requiere rotación si se utilizó en un despliegue. No se añadió allowlist.
Una PR de esta rama debe revisarse sin integrar main hasta coordinar su saneamiento.

La disposición original del código se conserva para compilar la aplicación:
`sistema/` y `servicio/` explican su correspondencia con la estructura del enunciado.
El informe PDF, diagramas, aportes individuales y defensa
son entregables separados; este repositorio prepara su recorrido técnico.
