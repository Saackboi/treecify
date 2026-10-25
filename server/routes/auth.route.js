import express from 'express';
import { rateLimit } from 'express-rate-limit';
import db from '../db.js';
import bcrypt from 'bcryptjs';
import { signToken, validUsername, validEmail, validPassword } from '../security.js';

const router = express.Router();
router.use(rateLimit({ windowMs: 60000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }));
router.post('/register', async (req, res, next) => {
    const { username, email, password } = req.body || {};
    if (!validUsername(username) || !validEmail(email) || !validPassword(password)) {
        return res.status(400).json({ success: false, message: 'Usuario de 3-32 caracteres; email válido; contraseña de 12 caracteres a 72 bytes.' });
    }
    try {
        const hash = await bcrypt.hash(password, 12);
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email.toLowerCase(), hash], function (err) {
            if (err?.code === 'SQLITE_CONSTRAINT') return res.status(409).json({ message: 'Usuario o email no disponible' });
            if (err) return next(err);
            const user = { id: this.lastID, username, email: email.toLowerCase() };
            res.status(201).json({ success: true, token: signToken(user), user });
        });
    } catch (error) { next(error); }
});
router.post('/login', (req, res, next) => {
    const { email, password } = req.body || {};
    if (!validEmail(email) || !validPassword(password)) return res.status(400).json({ message: 'Datos de acceso inválidos' });
    db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, user) => {
        if (err) return next(err);
        try {
            if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ message: 'Credenciales inválidas' });
            res.json({ success: true, token: signToken(user), user: { id: user.id, username: user.username, email: user.email } });
        } catch (error) { next(error); }
    });
});
export default router;
