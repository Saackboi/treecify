# Trazabilidad para la sustentación
| Requisito | Archivos/rutas | Función | Comando o prueba | Evidencia | Explicación breve |
|---|---|---|---|---|---|
| 1. Inventario y aislamiento | docs/SEGURIDAD.md, .gitignore, sistema/README.md | Registrar stack y separar datos | git status --short; Gitleaks dir/git | docs/VALIDACION.md | Copia local; sin DB ni avatares de producción |
| 2. Configuración externa | server/config/env.js, .env.example | Validar secreto y rutas al inicio | npm test (startup) | Resultado local | Clave aleatoria de al menos 32 bytes; sin fallback |
| 2. Health y API | server/app.js, server/index.js | Health, readiness, resumen protegido y cierre | npm run smoke | evidencias/<motor>/smoke.txt | 200 sin autenticación en health, 401/200 en resumen |
| 2. Autenticación | server/security.js, server/middleware/auth.middleware.js | HS256, expiración, issuer, audience, longitud y timingSafeEqual | npm test (JWT) | 8 grupos de pruebas | Primero compara HMAC de 32 bytes, luego verifica claims |
| 2. Validación | server/routes/, server/config/multer.js | Límites y tipos; autorización por propietario | npm test | Resultado local | URL solo HTTP(S), bcrypt 12 rondas, colores hex, avatares recodificados |
| 3. Imagen | Dockerfile, .dockerignore, package-lock.json | Build reproducible; dependencias mínimas; UID 10001 | bash scripts/containers.sh docker | evidencias/docker/ | Compiladores solo en etapa build; secreto fuera de imagen |
| 3. Compose | docker-compose.yml, qr-biolink.yaml | Entorno local declarativo | docker compose up --build -d | docker compose logs | Volumen nuevo; raíz readonly; ALL capabilities descartadas |
| 3. Podman | scripts/containers.sh, docs/COMPARACION-MOTORES.md | Reutilizar Dockerfile y guardar observaciones | bash scripts/containers.sh podman | evidencias/podman/ | Rootless del motor y UID del proceso se verifican por separado |
| 4. Pipeline | .github/workflows/devsecops.yml | Controles antes de construir la imagen | push a lab/** o PR | URL de Actions y artefacto por run_id/sha | Dos jobs; timeout y permisos contents:read |
| 4-5. Secretos | .gitleaks.toml, scripts/controlled-failure.mjs | Detectar archivos y todos los commits descargados | Gitleaks dir y git --log-opts=--all | Reportes redactados | Regla propia detecta credencial siempre ficticia |
| 4. SAST | .semgrep.yml | OWASP Top Ten y reglas propias de CORS/CSP/eval | Job controles-de-codigo | Log del paso SAST | Herramienta fijada; baseline OWASP remoto debe revisarse al variar |
| 4. SCA/IaC | package-lock.json, Dockerfile, k8s/ | npm audit y Trivy fs/image | Workflow | Log y image-scan.json | Umbral HIGH/CRITICAL incluye dependencias de desarrollo en npm audit |
| 6. SBOM | scripts/sbom-summary.mjs, workflow | Generar y analizar componentes y vulnerabilidades | node scripts/sbom-summary.mjs <sbom> | sbom.cdx.json, sbom-summary.json, sbom-scan.json | El SBOM de imagen identifica la ejecución; el SBOM local de fuentes es distinto |
| 6-8. Suministro | .github/dependabot.yml, tool-pins.json, scripts/resolve-pins.py | SHA y digest oficiales; revisiones semanales | git ls-remote y API registry | tool-pins.json | Renovar digest es cambio revisable; etiquetas no son inmutables |
| 7. Políticas Docker | policy/docker/*.rego | Digest, UID, HEALTHCHECK propio y ADD remoto | Conftest verify/test | 6 pruebas Rego y validación Dockerfile | Incluye ausencia de HEALTHCHECK y usuario root final |
| 7. Políticas Kubernetes | policy/k8s/*.rego | Réplicas, probes, recursos, permisos, token y seccomp | Conftest verify/test | 7 pruebas Rego y validación YAML | Token de ServiceAccount desactivado: regla propia con caso negativo |
| 9. kind y Secret | kind-config.yaml, k8s/, scripts/kind-up.sh | Dos pods endurecidos, Service NodePort loopback | bash scripts/kind-up.sh docker | get pods y rollout | Secreto desde archivo temporal privado; nunca YAML versionado |
| 10. Resiliencia | scripts/k8s-experiments.sh | Eliminar pod, actualización imposible y undo | bash scripts/k8s-experiments.sh | timeline, traffic-summary y eventos | maxUnavailable=0 conserva pods listos durante rollout fallido |
| 11. Escala | mismo script, server/app.js | Subir a 5 y regresar al número inicial | mismo comando | scale-five, distribution y restored-pods | Instancia permite observar reparto; estado no compartido |
| 12. Observabilidad | server/observability.js | Logs JSON sin cuerpos/credenciales; contadores acotados | /metrics, kubectl logs | Un archivo por réplica | Requests pueden dar distinta métrica según pod |
| 12. Alertas y trazas | docs/LABORATORIO.md | Diseño para el informe | Revisión del diseño | Material separado | Sin despliegue de Prometheus ni trazas, según alcance |

## Decisiones y límites
1. Se conserva React/Express para la Ruta A, sin construir un servicio artificial desconectado del sistema.
2. Datos aislados: Compose conserva solo datos del laboratorio; las pruebas de comparación usan tmpfs; Kubernetes usa emptyDir por pod.
3. La excepción de política de imagen Kubernetes es estrecha: solo treecify-lab:1.0 con imagePullPolicy Never, precargada en kind. Para un registro, publicar y sustituir por digest.
4. JWT sigue en localStorage como en la aplicación original: CSP reduce superficie pero no elimina el riesgo de robo frente a XSS. Migrar a cookie HttpOnly requeriría otro cambio y protección CSRF.
5. /metrics es público para el laboratorio. En un entorno real se debe restringir a la red de monitorización, con NetworkPolicy y autenticación según la plataforma.
6. El rate limit es por proceso, no distribuido; no configura trust proxy. Un proxy real necesita diseño y límites compartidos.
7. Fijar imagen no garantiza ausencia de CVE futuras. Los controles usan bases de vulnerabilidades actualizadas y pueden fallar al aparecer nuevos avisos.
