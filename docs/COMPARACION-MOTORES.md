# Docker y Podman: comparación observada
| Aspecto | Docker | Podman | Diferencia observada |
|---|---|---|---|
| Versiones | Engine/CLI 29.8.2 en Fedora 44, máquina WSL del laboratorio | CLI Windows 5.8.3; servidor Linux 5.8.9 | Misma VM/kernel compartido; motores y almacenes independientes |
| Construcción | BuildKit; imagen final construida y probada | Buildah; mismo Dockerfile construido y probado | node:24.22.1-alpine fijado por digest; cachés e identificadores distintos |
| Formato y healthcheck | HEALTHCHECK conservado | OCI predeterminado lo omitía; --format docker lo conserva | Compatibilidad de formato no implica que todos los metadatos se conserven |
| Privilegios del motor | Docker daemon root dentro de VM aislada | Servicio Podman rootless con mapeos de UID/GID | Rootless del motor es distinto del UID del proceso |
| Usuario del contenedor | UID/GID 10001:10001, inspección e id comprobados | UID/GID 10001:10001, inspección e id comprobados | Ambos procesos no root |
| Controles comunes | Readonly, no-new-privileges y cap_drop ALL | Readonly, no-new-privileges y capacidades descartadas | Podman expande ALL a una lista concreta en inspect |
| Recursos | Configurados 512 MiB, 1 CPU y 100 procesos; advertencia de swap | WSL no delega cgroups; se registró variante rootless sin CPU/memoria y con ulimit | Limitación real; no se afirma equivalencia de restricciones |
| tmpfs | Admitía uid/gid en opciones originales | Cliente remoto rechazó uid/gid | Se usa mode=1777 en tmpfs efímero de contenedor único |
| Puertos | Loopback 3001 | Loopback 3002 | Cambio explícito para evitar conflictos durante comparación |
| Logs | JSON a stdout, health 200 y resumen 401/200 | Mismos eventos y respuestas | Se guardaron logs e inspección sin Config.Env |
| Compose | 5.6.0, contenedor Healthy y volumen de laboratorio nuevo | Proveedor externo Docker Compose 5.6.0 identificado en VM | No se afirma que Compose completo pasara en Podman rootless |
| kind | Intento Windows/WSL falló por cgroups; ejecutado correctamente con Docker en runner Linux | No se afirma carga kind exitosa en Podman/WSL | Ruta Podman documentada, condición local no soportada en este WSL |

## Archivos de respaldo
- evidencias/docker/: version, info, build, identity, inspect, logs y smoke.
- evidencias/podman/: mismos archivos, runtime-limitations.txt y compose-provider.txt.
- evidencias/compose/: volumen, arranque Healthy, humo, logs y apagado.
- evidencias/k8s-create.txt: intento fallido del equipo Windows.
- evidencias/k8s-ci/: experimentos exitosos en runner Linux.

La regresión coincide con los problemas públicos de cgroups en WSL:
[Podman #29966](https://github.com/podman-container-tools/podman/issues/29966).
No se modificó el kernel ni se desactivaron los controles Kubernetes para conseguir
una ejecución verde. Se identificó el entorno correcto en cada evidencia.
