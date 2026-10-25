# Validación de la implementación
Fecha: 25 de octubre de 2026, America/Bogota. Resultados locales; no son ejecuciones de GitHub Actions.

## Ejecutado
| Comprobación | Resultado observado |
|---|---|
| npm ci y dependencias nativas | Instalación correcta en Node 24.22.1; sqlite3 6.0.1 operativo |
| npm test | 8 grupos aprobados, 0 fallos |
| npm run smoke:local | Arranque real de server/index.js, HTTP 200/401, JWT válido, readiness, instancia, métricas y logs JSON comprobados |
| npm run lint | Sin errores en frontend, backend, scripts y pruebas |
| npm run build | Frontend compilado con Vite 7.3.7 |
| Conftest verify policy/docker | 6 pruebas aprobadas |
| Conftest verify policy/k8s | 7 pruebas aprobadas |
| Conftest test Dockerfile | 5 comprobaciones aprobadas |
| Conftest test k8s/ | 33 comprobaciones aprobadas |
| Violación real de Dockerfile en archivo temporal | Exit 1 esperado; archivo real corregido pasa |
| Violación de ServiceAccount en YAML temporal | Exit 1 esperado; manifiesto real corregido pasa |
| Credencial deliberadamente falsa en temporal | Gitleaks exit 1 esperado, reporte redactado, valor retirado después |
| Gitleaks dir sobre árbol actual | Sin fugas |
| Gitleaks git --log-opts=--all | Bloquea: 2 hallazgos heredados del commit original, detallados en SEGURIDAD.md |
| npm audit | 0 altas/críticas; 3 moderadas en cadena Tailwind/PostCSS |
| Trivy config HIGH/CRITICAL | 4 archivos analizados, 0 hallazgos en el umbral |
| Trivy sobre dependencias runtime | 0 vulnerabilidades HIGH/CRITICAL |
| SBOM local de fuentes | CycloneDX 1.7, 452 componentes, 451 bibliotecas y 1 aplicación; 451 PURL |
| Trivy sbom sobre inventario local con dev dependencies | Sin HIGH/CRITICAL; resultado JSON guardado |
| Actionlint 1.7.12 | Workflow sin errores; revisión de shellcheck no ejecutada |
| Bash -n | Los cuatro scripts Bash pasan revisión de sintaxis |

Las herramientas nativas Conftest 0.71.1, Gitleaks 8.30.1, Trivy 0.76.1 y
Actionlint 1.7.12 se descargaron de sus publicaciones oficiales y se verificaron
por SHA-256. Están en tmp/tools/ ignorado por Git. Las imágenes OCI del workflow
se consultaron en el registro oficial y se fijaron por digest en tool-pins.json.
Las acciones se verificaron con git ls-remote de sus repositorios oficiales.

Las pruebas HTTP usaron carpetas temporales, claves aleatorias y datos ficticios.
El humo automático eliminó su base y archivos temporales después de cerrar el servidor.
Los reportes locales saneados están en evidencias/local/ y no se añaden automáticamente a Git.

## Lectura del SBOM local
El inventario permite identificar paquetes por PURL (451 de 452 componentes).
El componente aplicación representa este proyecto y no tiene PURL.
El análisis HIGH/CRITICAL pasa; esto no contradice los hallazgos moderados de npm audit,
porque ese umbral no los bloquea. Las licencias del inventario de fuentes no se
consideran completas al no recopilar todas desde node_modules. Revisarlas al analizar
el SBOM de imagen y distinguir paquetes compilados del árbol de desarrollo.

## Preparado, pendiente de ejecución en el entorno correspondiente
| Parte | Qué falta |
|---|---|
| Semgrep | Ejecutar la imagen fijada sobre las reglas OWASP y locales; no se ejecutó Semgrep en Windows |
| Docker / Podman | Construir y ejecutar ambas imágenes, inspeccionar usuario y restricciones y completar comparación |
| Compose | Ejecutar con Docker y comprobar volumen nuevo; proveedor Podman opcional |
| Kubernetes | Instalar/disponer de Docker, kind y kubectl; crear clúster local y ejecutar experimentos |
| GitHub Actions | Publicar cambios y ejecutar; primero resolver los secretos heredados que bloquean el historial |
| Tres rojos y correcciones de Actions | Producir con las ramas y scripts documentados; las pruebas negativas locales no los reemplazan |
| SBOM de imagen | Se genera al construir la imagen en CI; el SBOM de fuentes no lo sustituye |
| Secretos del entorno activo | El administrador debe confirmar rotación; no se tocó producción |
| Entregables separados | Informe PDF, diagramas, capturas, análisis arquitectónico, aportes individuales y defensa |

No se crearon commits ni se publicaron cambios en GitHub. Los cambios están en
la copia de laboratorio, rama lab/devsecops, para revisión y commits de los integrantes.
