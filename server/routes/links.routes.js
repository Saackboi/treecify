import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validUsername, validText, validUrl } from '../security.js';

const router = express.Router();
router.get('/public/:username', (req, res, next) => {
    if (!validUsername(req.params.username)) return res.status(400).json({ message: 'Usuario inválido' });
    db.get('SELECT id, username, bio, bg_color, btn_color, text_color, profile_img FROM users WHERE username = ?', [req.params.username], (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        db.all('SELECT id, title, url, clicks FROM links WHERE user_id = ? ORDER BY id DESC', [user.id], (error, rows) => {
            if (error) return next(error);
            res.json({ success: true, user, links: rows });
        });
    });
});
router.use(verifyToken);
router.get('/', (req, res, next) => {
    db.all('SELECT * FROM links WHERE user_id = ? ORDER BY id DESC', [req.user.id], (err, rows) => {
        if (err) return next(err);
        res.json({ success: true, data: rows });
    });
});
router.post('/', (req, res, next) => {
    const { title, url } = req.body || {};
    if (!validText(title, 100) || !validUrl(url)) return res.status(400).json({ message: 'Título o URL HTTP(S) inválida' });
    db.run('INSERT INTO links (user_id, title, url) VALUES (?, ?, ?)', [req.user.id, title.trim(), url], function (err) {
        if (err) return next(err);
        res.status(201).json({ success: true, data: { id: this.lastID, user_id: req.user.id, title: title.trim(), url, clicks: 0 } });
    });
});
router.delete('/:id', (req, res, next) => {
    if (!/^[1-9]\d*$/.test(req.params.id) || !Number.isSafeInteger(Number(req.params.id))) return res.status(400).json({ message: 'ID inválido' });
    db.run('DELETE FROM links WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function (err) {
        if (err) return next(err);
        if (!this.changes) return res.status(404).json({ message: 'Link no encontrado' });
        res.json({ success: true, message: 'Link eliminado correctamente' });
    });
});
export default router;
