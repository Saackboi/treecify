
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import linksRouter from './routes/links.routes.js'
import authRouter from './routes/auth.route.js'

const app = express();
const PORT = 3001; // Correremos el backend en el puerto 3001

// --- MIDDLEWARE ---
// Habilitar CORS para desarrollo (ajustar en producción)
app.use(cors());
// Helmet ayuda a proteger la app de vulnerabilidades web conocidas
// Configuramos para permitir cargar imagenes y scripts (necesario para React)
app.use(helmet({
    contentSecurityPolicy: false
}));
// Parsear JSON (vital para recibir datos de formularios React)
app.use(express.json());

// --- RUTAS (API Endpoints) ---
app.use('/api/links', linksRouter) // Todo lo que empiece por /api/links lo va a manejar este archivo
app.use('/api/auth', authRouter) // Todo lo que empiece por /api/auth lo va a manejar este archivo

// --- SERVIDOR FRONTEND ---
// DECIRLE A EXPRESS DONDE ESTA LA CARPETA 'dist'
const distPath = path.resolve(process.cwd(), 'dist')
app.use(express.static(distPath))

// "CATCH-ALL" Route
// Si alguien entra a "/Ver" con esto le decimos: "Manda al index.html" y le deja el trabajo a react
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
})

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
    console.log(`Listo para conectar con React`);
});