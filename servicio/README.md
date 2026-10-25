# Componente desplegable: Treecify (Ruta A)
El servicio es la aplicación original completa. Dockerfile, docker-compose.yml,
package.json, package-lock.json y .env.example están en la raíz para conservar
el contexto de compilación de React y Express sin duplicarlos.
Construir desde la raíz: docker build -t treecify-lab:1.0 .
API: /health, /ready, /api/resumen (Bearer JWT), /metrics.
Arranque sin contenedor: npm ci && npm run build && npm start.
Use exclusivamente datos ficticios.
