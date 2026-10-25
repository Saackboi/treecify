# Índice de evidencias para el informe
Las capturas están en evidencias/capturas/. El índice visual se abre desde
evidencias/visor/index.html; cada página de logs conserva un enlace al original
y su hash SHA-256. El paquete ZIP incluye imágenes y fuentes.

Hay dos clases de captura, identificadas por nombre:
- *-github.jpg: página real de GitHub Actions.
- Capturas del visor: salidas reales de comandos o reportes, presentadas en un visor
  legible. No simulan una consola ni sustituyen el log original.

## Tres fallos controlados y correcciones comprobadas
| Caso | Ejecución roja | Control que falló | Corrección verde |
|---|---|---|---|
| Canario deliberadamente falso | [40231102217](https://github.com/Saackboi/treecify/actions/runs/40231102217) | Gitleaks, regla treecify-lab-canary | [40231430582](https://github.com/Saackboi/treecify/actions/runs/40231430582) |
| ServiceAccount token habilitado | [40231110096](https://github.com/Saackboi/treecify/actions/runs/40231110096) | Conftest, regla propia de Kubernetes | [40231435126](https://github.com/Saackboi/treecify/actions/runs/40231435126) |
| CORS abierto en fixture sin conectar al servidor | [40231116437](https://github.com/Saackboi/treecify/actions/runs/40231116437) | Semgrep, treecify-no-open-cors | [40231439265](https://github.com/Saackboi/treecify/actions/runs/40231439265) |

La fuga es siempre ficticia. Para corregirla se reemplazó solo el último commit
de lab/failure-secret, porque un commit de borrado conservaría el canario en HEAD.
Las ramas de política y SAST conservan el commit roto y el correctivo.
Las tres ramas están corregidas; main no cambió.

## Hallazgos adicionales corregidos
| Hallazgo real | Evidencia | Cambio |
|---|---|---|
| Clave JWT heredada en dos archivos del historial | [40229587803](https://github.com/Saackboi/treecify/actions/runs/40229587803) | Rama de laboratorio saneada con git-filter-repo; sin exclusiones |
| Dependabot sin espera de seguridad | [40229881626](https://github.com/Saackboi/treecify/actions/runs/40229881626) | cooldown de siete días |
| Base Debian y gestores globales con CVE HIGH/CRITICAL | [40230309196](https://github.com/Saackboi/treecify/actions/runs/40230309196) | Base Alpine por digest y retiro de npm/yarn/corepack del runtime |

## Recorrido sugerido de capturas
| Requisito | Evidencia visual y respaldo |
|---|---|
| Inventario, secretos y configuración | Visor 16, 28; .env.example y mapa en SEGURIDAD.md |
| Aplicación y autenticación | Visor 10, 12, 14; tests-final.log y smoke.txt |
| Docker endurecido | Visor 11 y 12; identidad, inspección saneada y build.txt |
| Podman y rootless | Visor 13, 14 y 29; limitación WSL declarada |
| Compose | Visor 15; up, ps, smoke, volumen nuevo y down |
| Pipeline exitoso | Captura de la ejecución completa verde |
| Tres fallos y sus correcciones | Capturas de las seis ejecuciones de la tabla superior; visor 18 |
| Políticas propias | Visor 17; Rego y pruebas positivas/negativas |
| Cadena de suministro y Dependabot | Visor 28; SHA, digest, checksums y cooldown |
| SBOM y análisis | Visor 19; sbom.cdx.json, summary, image-scan y sbom-scan |
| Kubernetes declarativo y Secret | Visor 20 y 21; no se fotografían valores del Secret |
| Eliminación y recuperación de pod | Visor 22; pods antes/después y timeline |
| Actualización defectuosa y rollback | Visor 23; timeout intencional y rollout undo |
| Cinco réplicas y regreso a dos | Visor 24; pods y reparto observado |
| Logs JSON y eventos 401 | Visor 25; un archivo por réplica |
| Contadores por réplica | Visor 26; cinco targets distintos |
| Tráfico y errores observados | Visor 27; traffic-summary.json y timestamps |

Para el informe de 6–10 páginas seleccionar las capturas más claras y remitir
las restantes al paquete de evidencias. No interpretar una captura como una garantía
de seguridad absoluta ni presentar la ejecución del runner como hecha en Windows.
Los umbrales de alertas y el diagrama de trazas son diseño/documentación aparte.
