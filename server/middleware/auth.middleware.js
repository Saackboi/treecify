import { validateToken } from '../security.js';
export function verifyToken(req, res, next) {
    const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '');
    try {
        if (!match) throw new Error('Credencial ausente');
        req.user = validateToken(match[1]);
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Token ausente, inválido o expirado.' });
    }
}
