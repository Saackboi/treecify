import express from 'express';
import db from '../db.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { validText } from '../security.js';
import { config } from '../config/env.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import upload from '../config/multer.js';

const router = express.Router();
router.use(verifyToken);
router.get('/me', (req, res, next) => {
    db.get('SELECT username, email, bio, bg_color, btn_color, text_color, profile_img FROM users WHERE id = ?', [req.user.id], (err, row) => {
        if (err) return next(err);
        if (!row) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ success: true, data: row });
    });
});
router.put('/me', (req, res, next) => {
    const { bio, bg_color, btn_color, text_color } = req.body || {};
    if (!validText(bio, 500, 0) || ![bg_color, btn_color, text_color].every(c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c))) {
        return res.status(400).json({ message: 'Biografía o colores inválidos' });
    }
    db.run('UPDATE users SET bio = ?, bg_color = ?, btn_color = ?, text_color = ? WHERE id = ?', [bio, bg_color, btn_color, text_color, req.user.id], function (err) {
        if (err) return next(err);
        if (!this.changes) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ success: true, message: 'Perfil actualizado correctamente' });
    });
});
router.post('/upload-avatar', upload.single('avatar'), async (req, res, next) => {
    if (!req.file) return res.status(400).json({ message: 'Falta imagen' });
    let image;
    try {
        // Decode bounded raster input, discard metadata and re-encode: reject spoofed MIME and SVG.
        const decoder = sharp(req.file.buffer, { limitInputPixels: 16000000, animated: false });
        const metadata = await decoder.metadata();
        if (!['png', 'jpeg', 'webp'].includes(metadata.format)) throw new Error('Formato inválido');
        image = await decoder.resize(512, 512, { fit: 'inside', withoutEnlargement: true }).webp().toBuffer();
    } catch { return res.status(400).json({ message: 'Imagen inválida' }); }
    try {
        await fs.mkdir(config.uploadDir, { recursive: true });
        const filename = randomUUID() + '.webp';
        const destination = path.join(config.uploadDir, filename);
        await fs.writeFile(destination, image, { flag: 'wx', mode: 0o600 });
        const newUrl = config.publicUrl + '/uploads/' + filename;
        db.get('SELECT profile_img FROM users WHERE id = ?', [req.user.id], (err, row) => {
            if (err || !row) {
                fs.unlink(destination).catch(() => {});
                return err ? next(err) : res.status(404).json({ message: 'Usuario no encontrado' });
            }
            db.run('UPDATE users SET profile_img = ? WHERE id = ?', [newUrl, req.user.id], error => {
                if (error) { fs.unlink(destination).catch(() => {}); return next(error); }
                const oldName = (row.profile_img || '').split('/').pop();
                if (/^[0-9a-f-]{36}\.webp$/.test(oldName)) fs.unlink(path.join(config.uploadDir, oldName)).catch(() => {});
                res.json({ success: true, url: newUrl });
            });
        });
    } catch (error) { next(error); }
});
export default router;
