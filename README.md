# 🌳 Treecify

![Version](https://img.shields.io/badge/version-3.1.0-indigo.svg) ![Stack](https://img.shields.io/badge/stack-MERN_Lite-green.svg) ![Docker](https://img.shields.io/badge/docker-multi__arch-2496ED.svg)

**Treecify** es una plataforma Micro-SaaS "Self-Hosted" diseñada para que negocios locales y creadores gestionen su identidad digital. Permite crear una página de aterrizaje ("Link in Bio") totalmente personalizada, ultra-rápida y generar códigos QR dinámicos para el mundo físico.

La versión **v3.0** introduce personalización visual completa, gestión de avatares y una arquitectura Docker blindada para producción en entornos mixtos (AMD64/ARM64).

---

## ✨ Novedades v3.0 & Características

![Admin Dashboard](https://i.postimg.cc/zfXy7gbd/image.png)
![Admin Dashboard](https://i.postimg.cc/FFJ7TmR6/image.png)

- **🎨 Personalización Total:** Nuevo **Panel de Diseño**. Elige entre temas predefinidos o personaliza colores de fondo, botones y textos manualmente.
- **📸 Gestión de Avatares:** Subida de imágenes de perfil con **Multer**. Incluye limpieza automática de archivos antiguos para ahorrar espacio y URLs anti-caché.
- **📱 Mobile-First & Instantáneo:** Renderizado optimizado para carga < 1s en móviles.
- **⚡ Dashboard Reactivo:** Vista previa en tiempo real. Los cambios de foto y colores se reflejan al instante sin recargar.
- **🗄️ Persistencia Blindada:** Base de datos **SQLite** y sistema de archivos local para imágenes. Tus datos sobreviven a reinicios.
- **🐳 Docker Multi-Arch:** Construido sobre `node:slim` con soporte nativo para **x86_64** y **ARM64** (Raspberry Pi, CasaOS), solucionando problemas de compilación nativa (SQLite).
- **🔒 Seguridad Mejorada:** Validación de sesión robusta, manejo de `Mixed Content` vía variables de entorno y limpieza de localStorage en tokens expirados.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React + Vite + Tailwind CSS (v3).
- **Backend:** Node.js + Express (ES Modules).
- **Gestión de Archivos:** Multer (Configuración modular).
- **Base de Datos:** SQLite3 (Driver `sqlite3` compilado para multi-arquitectura).
- **Infraestructura:** Docker + Docker Compose (Soporte HTTPS Proxy).

---

## 📂 Arquitectura del Proyecto

Estructura modularizada para separar configuración, rutas y lógica de negocio.

```bash
treecify/
├── .dockerignore        # Ignora uploads locales y node_modules
├── docker-compose.yml   # Orquestación con volúmenes persistentes
├── Dockerfile           # Build Multi-Stage basado en Debian Slim
├── vite.config.js       # Proxy reverso para desarrollo
├── uploads/             # Carpeta de persistencia de imágenes (Mapeada en Docker)
├── src/
│   ├── config/          # Configuraciones externas
│   ├── components/      # UI Modular
│   ├── hooks/           # Custom Hooks (useDashboard)
│   ├── server/          # Backend Node.js
│   └── App.jsx          # Estado Global
└── package.json