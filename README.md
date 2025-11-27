# 🌳 Treecify

![Version](https://img.shields.io/badge/version-1.7.0-indigo.svg) ![Stack](https://img.shields.io/badge/stack-MERN_Lite-green.svg) ![Docker](https://img.shields.io/badge/docker-ready-2496ED.svg)

**Treecify** es una plataforma Micro-SaaS diseñada para que negocios locales y creadores gestionen su identidad digital. Permite desplegar una página de aterrizaje ("Link in Bio") ultra-rápida y generar códigos QR dinámicos para compartirla en el mundo físico.

Este proyecto destaca por su arquitectura **Monolítica Híbrida**, optimizada para el máximo rendimiento en servidores propios con **CasaOS** o VPS, utilizando una fracción de los recursos de soluciones tradicionales.

---

## ✨ Características de Treecify

![Admin Dashboard](https://i.postimg.cc/bYV8tCFc/image.png)
![Mobile View](https://i.postimg.cc/sxjYCDCN/image.png)

- **📱 Experiencia Mobile-First:** Vista pública optimizada para carga instantánea (< 1s) en smartphones.
- **⚡ Dashboard Interactivo:** Panel de administración con **Vista Previa en Tiempo Real**.
- **🗄️ Persistencia Blindada:** Base de datos **SQLite** local; tus datos son tuyos y sobreviven a cualquier reinicio.
- **🔳 Motor QR Nativo:** Generación y descarga de códigos QR (SVG/PNG) que apuntan dinámicamente a tu servidor.
- **🐳 Docker Ready:** Compilación **Multi-Arquitectura** (compatible con PC `amd64` y Servidores ARM `arm64` como Raspberry Pi).
- **🛡️ Auto-Corrección Inteligente:** El sistema detecta y repara protocolos URL (`http/https`) automáticamente.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React + Vite + Tailwind CSS (v3).
- **Backend:** Node.js + Express (ES Modules).
- **Base de Datos:** SQLite3.
- **Infraestructura:** Docker + Docker Compose.

---

## 📂 Arquitectura del Proyecto

Treecify sigue una arquitectura modular MVC para facilitar la escalabilidad futura.

```bash
treecify/
├── .dockerignore        # Seguridad y optimización de imágenes
├── docker-compose.yml   # Orquestación para instancia
├── qr-biolink.yaml      # Orquestación para CasaOS/
Producción
├── Dockerfile           # Receta de construcción Multi-Stage
├── vite.config.js       # Configuración de Proxy (Dev Mode)
├── src/
    ├── assets/          # Recursos visuales
│   ├── components/      # UI (FormPanel, PreviewPanel, QRShare)
│   ├── pages/           # Vistas (PageRender)
│   ├── server/          # Backend Node.js
│   │   ├── db.js            # Conexión Singleton a SQLite
│   │   ├── index.js         # Entry point del servidor
│   │   └── routes/          # API Controllers
│   └── App.jsx          # Layout Principal
└── package.json