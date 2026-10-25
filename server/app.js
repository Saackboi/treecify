import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { config } from './config/env.js';
import { log, metrics, observe } from './observability.js';
import db from './db.js';
import linksRouter from './routes/links.routes.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import { verifyToken } from './middleware/auth.middleware.js';

export const app = express();
app.disable('x-powered-by');
app.use(observe);
app.use(helmet({ contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"],
    // React and SweetAlert use inline styles; scripts stay same-origin.
    styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'blob:'],
    connectSrc: ["'self'"], objectSrc: ["'none'"], frameAncestors: ["'none'"],
    upgradeInsecureRequests: null,
} } }));
app.use(cors({ origin(origin, callback) {
    if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
    const error = new Error('Origen no permitido'); error.status = 403; callback(error);
} }));
app.use(express.json({ limit: '16kb' }));
app.get('/health', (req, res) => res.json({ estado: 'ok', instancia: config.instance }));
app.get('/ready', (req, res) => db.get('SELECT 1', [], err => res.status(err ? 503 : 200).json({ estado: err ? 'unavailable' : 'ready', instancia: config.instance })));
app.get('/metrics', (req, res) => res.type('text/plain; version=0.0.4').send(metrics()));
app.get('/api/resumen', verifyToken, (req, res, next) => {
    db.get('SELECT COUNT(*) AS total_registros FROM links WHERE user_id = ?', [req.user.id], (err, row) => {
        if (err) return next(err);
        res.json({ ...row, instancia: config.instance });
    });
});
app.use('/api/links', linksRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api', (req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
app.use('/uploads', express.static(config.uploadDir, { dotfiles: 'deny', fallthrough: false }));
app.use(express.static(config.distPath, { dotfiles: 'deny' }));
app.get(/.*/, (req, res) => res.sendFile(path.join(config.distPath, 'index.html')));
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : err.status || (err.name === 'MulterError' ? 400 : 500);
    log(status >= 500 ? 'error' : 'warn', 'request_rejected', { status });
    res.status(status).json({ success: false, message: status >= 500 ? 'Error interno del servidor' : 'Solicitud no válida' });
});
