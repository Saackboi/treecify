# Procedimiento técnico de laboratorio
Los comandos Bash se ejecutan desde la raíz. Windows: Git Bash o WSL.
No ejecutar contra servidor activo. Los puertos se publican solo en loopback.
Las salidas se deben revisar antes de adjuntar al informe.

## Contenedor y comparación
1. Con Docker disponible: `bash scripts/containers.sh docker`.
2. Con Podman disponible y su máquina Linux iniciada: `bash scripts/containers.sh podman`.
3. Revisar version, info, build, smoke, logs, inspect e identidad del usuario en
   `evidencias/docker/` y `evidencias/podman/`.
4. Completar docs/COMPARACION-MOTORES.md usando exclusivamente resultados observados.
5. Para Compose: crear .env desde .env.example y clave nueva; ejecutar
   `docker compose up --build -d`, `npm run smoke`, `docker compose logs api` y
   `docker compose down`. El volumen persiste para repetir la demostración.
   No usar volúmenes o bind mounts de otra instalación.
6. Compose con Podman es opcional: registrar proveedor y versión antes de probar
   `podman compose up --build -d`. Un fallo de proveedor no equivale a fallo de OCI.

Los scripts de comparación usan tmpfs para /data: cada ejecución parte vacía y
borra su propio contenedor al terminar. No guardan Config.Env de inspect.
El comando info puede contener nombres y rutas del equipo; censurarlos al compartir.

## Políticas
```bash
bash scripts/policy-check.sh
# O con Podman:
ENGINE=podman bash scripts/policy-check.sh
```

Conftest procesa Dockerfile como instrucciones y Kubernetes como documentos YAML.
verify ejecuta casos unitarios positivos y negativos. test evalúa los archivos reales.
La regla HEALTHCHECK de Docker y la de ServiceAccount de Kubernetes son propias.
Los fixtures negativos se generan en tmp/ durante la verificación local, sin
introducir manifiestos inseguros dentro de k8s/.

## Tres fallos reales de Actions (no simulados)
Primero resolver el bloqueo de secretos heredados descrito en SEGURIDAD.md y
publicar el código de laboratorio. Guardar URL de ejecución, commit, causa, arreglo
y URL verde para cada caso. Estas ejecuciones aún deben producirse en GitHub.

### Caso 1: fuga deliberadamente falsa
```bash
git switch -c lab/failure-secret
node scripts/controlled-failure.mjs inject secret
git add lab-false-credential.txt
git commit -m "lab: provocar detección de credencial ficticia"
git push -u origin lab/failure-secret
# Esperar el rojo de Gitleaks y guardar la URL / captura redactada.
node scripts/controlled-failure.mjs restore secret
git add -A
# Reemplazar SOLO el último commit de ESTA rama de laboratorio.
git commit --amend --no-edit
git push --force-with-lease origin lab/failure-secret
```

El amend es necesario porque un commit de borrado conserva la fuga en el historial.
Nunca trasladar este procedimiento de reescritura a main ni a ramas compartidas.
La ejecución roja permanece en Actions como evidencia aunque el commit se sustituya.
El valor generado por el script es un canario inerte; no se utiliza para autenticación.

### Caso 2: violación de política
Volver a la rama base del laboratorio, crear `lab/failure-policy` y ejecutar
`node scripts/controlled-failure.mjs inject policy`. Commit/push para observar el
deny de automountServiceAccountToken. Restaurar con `restore policy`, hacer
commit/push de corrección y guardar ambos enlaces. No desplegar el YAML roto.

### Caso 3: SAST
Desde la base crear `lab/failure-sast`; ejecutar `inject sast` con el mismo script.
Introduce un middleware CORS abierto en un archivo sin conectar a la aplicación.
Commit/push debe fallar por la regla local de Semgrep. Usar `restore sast`,
hacer commit/push y guardar el verde. No permite detectar una vulnerabilidad real
en una aplicación ajena ni modifica producción.

El script exige una rama lab/failure- y guarda respaldo solo en tmp/.
Los fallos unitarios locales NO sustituyen las tres ejecuciones rojas de Actions.

## SBOM
El job imagen exporta la imagen a tar para escanearla sin montar el socket Docker
en herramientas de terceros. Produce:
- sbom.cdx.json: inventario CycloneDX de la imagen construida.
- sbom-summary.json: total de componentes, tipos y cobertura de PURL.
- image-id.txt: identidad local de la imagen; el nombre del artefacto incluye run_id y commit.
- image-scan.json y sbom-scan.json: vulnerabilidades de imagen y del inventario.

Descargar el artefacto desde la ejecución. Revisar librerías, versiones, licencias,
componentes sin PURL y severidades; justificar deuda pendiente.
El identificador local de Docker no equivale a un digest de manifiesto en un registro.
El SBOM local de fuentes, si existe, se llama source-sbom.cdx.json y no reemplaza
el SBOM de imagen obligatorio.

## Kubernetes
```bash
npm ci
bash scripts/kind-up.sh docker
# Alternativa completa usando Podman:
# bash scripts/kind-up.sh podman
bash scripts/k8s-experiments.sh
```

El script de creación rechaza un clúster treecify-lab ya existente. Para retomar uno
creado antes, verificar su contexto, secreto e imagen y ejecutar solo los experimentos.
No cambie el contexto dentro de los scripts por un servidor remoto.
La ruta Podman usa docker-archive y kind load image-archive; registrar problemas
del proveedor rootless, puertos o compatibilidad en la comparación.

El experimento guarda:
- Pods iniciales y recuperados tras eliminación.
- Actualización a imagen inexistente, timeout esperado, eventos y rollback.
- Cinco réplicas, 30 respuestas con instancia y retorno a réplicas iniciales.
- Tráfico continuo con timestamp/código y resumen de errores.
- Solicitud 401 provocada, logs JSON y métricas por cada pod.
- Línea temporal para calcular recuperación con los datos observados.

El token de reparto tiene sujeto ficticio id=1; /api/resumen responde el número de
enlaces de ese sujeto en cada base local vacía. No se presenta como un usuario
persistente compartido. Login, nuevas cuentas y avatares no tienen consistencia
entre pods. Para una arquitectura real se requiere base de datos compartida y
almacenamiento de objetos, además de revisar sesiones, migraciones y límites.

## Logs, métricas y diseño de alertas
Los registros se escriben a stdout con ts, level, event, instancia, ruta y estado.
No se registran Authorization, cuerpos, correos, passwords ni query strings.
Las etiquetas de métricas usan rutas de plantilla para evitar cardinalidad por usuario.

Alertas de diseño para el informe (no hay Prometheus instalado):
| Señal | Umbral propuesto | Respuesta |
|---|---|---|
| Proporción de 401 | >20% durante 5 minutos y al menos 30 solicitudes | Revisar abuso, claves y expiración; aplicar limitación compartida |
| Pods no listos | Una o más réplicas no listas durante >2 minutos | Revisar probes, recursos, eventos y último rollout |
| Errores 5xx | >5% durante 5 minutos y al menos 30 solicitudes | Correlacionar instancia, DB y logs de despliegue |

Cada pod mantiene su contador; un recolector debe consultar todos los targets.
Consultar /metrics por Service devuelve una réplica, no el total agregado.
Las trazas se explican con diagrama en el informe, no se implementan en este código.
