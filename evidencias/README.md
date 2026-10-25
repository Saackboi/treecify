# Evidencias reales
Esta carpeta recibe únicamente resultados de comandos ejecutados.
Los resultados generados están ignorados por Git para permitir su revisión y saneamiento
antes de compartir. Si necesitan versionarse, seleccionar explícitamente los archivos
revisados; nunca añadir .env, credenciales, tokens o inspect completo.

- local/: comprobaciones nativas, políticas negativas/corregidas, canario redactado,
  historial redactado, SBOM de fuentes y análisis.
- docker/: scripts/containers.sh docker.
- podman/: scripts/containers.sh podman.
- k8s/<timestamp>/: scripts/k8s-experiments.sh.
- ci/: artefacto de una ejecución de Actions; incluye SBOM de imagen, análisis y logs.

Al entregar el informe, conservar run_id, commit y enlaces de Actions.
Los resultados locales no equivalen a pipeline verde ni a las tres ejecuciones rojas.
Ver docs/VALIDACION.md para conocer lo efectivamente ejecutado y lo pendiente.
