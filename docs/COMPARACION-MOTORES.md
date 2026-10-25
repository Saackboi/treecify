# Docker y Podman: observación pendiente
No completar celdas con comportamientos supuestos. Los scripts guardan evidencia real.

| Aspecto | Docker: observado / archivo | Podman: observado / archivo | Diferencia o limitación |
|---|---|---|---|
| Versión y SO del motor | Pendiente; version.txt, info.json | Pendiente; version.txt, info.json | Registrar VM/proveedor si aplica |
| Construcción del mismo Dockerfile | Pendiente; build.txt, image-id.txt | Pendiente; build.txt, image-id.txt | Tiempos, etapas y arquitectura |
| Usuario del motor / rootless | Pendiente; info.json | Pendiente; info.json | No confundir usuario del host con UID del proceso |
| Usuario del proceso | Pendiente; identity.txt, inspect.json | Pendiente; identity.txt, inspect.json | UID esperado 10001; privilegios y readonly |
| Puertos y red | Pendiente; smoke.txt | Pendiente; smoke.txt | Loopback 3001; registrar conflictos |
| Logs e inspección | Pendiente; logs.jsonl, inspect.json | Pendiente; logs.jsonl, inspect.json | JSON y campos compatibles efectivamente probados |
| Compose | Pendiente; versión del proveedor y logs | Opcional, pendiente | No asumir mismo proveedor ni soporte total |
| Carga en kind | Pendiente; kind load docker-image | Pendiente; docker-archive y load image-archive | Registrar el proveedor que creó el clúster |

## Estado del equipo al iniciar
Se encontró Podman instalado, sin máquinas Linux creadas. No se detectaron Docker,
kind ni kubectl en PATH. Esto es un diagnóstico, no una comparación de ejecuciones.
No se arrancó ni modificó una instalación activa.
