// ENCARGADO DE GESTIONAR CONFIGURACIONES DEL USER
import express from 'express'
import db from '../db.js'
import { verifyToken } from '../middleware/auth.middleware.js';

//IMPORTS UTILIZADOS POR MULTER PARA MANEJAR GUARDADO DE IMAGENES DE PERFIL
import fs from 'fs';
import path from 'path';
import upload from '../config/multer.js';


const router = express.Router()

// GET para llenar inputs del dashboard con los colores del usuario
router.get('/me', verifyToken, (req, res) => {
    const sql = "SELECT username, email, bio, bg_color, btn_color, text_color, profile_img FROM users WHERE id = ?";

    db.get(sql, [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ success: true, data: row });
    })
})

// PUT Para guardar los cambios
router.put('/me', verifyToken, (req, res) => {
    const { bio, bg_color, btn_color, text_color } = req.body;

    const sql = `
        UPDATE users 
        SET bio = ?, bg_color = ?, btn_color = ?, text_color = ?
        WHERE id = ?
    `;

    db.run(sql, [bio, bg_color, btn_color, text_color, req.user.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Perfil actualizado correctamente" });
    });
});

//------------ PARA SUBIR IMAGEN DE PERFIL ----------------

// POST Para subir imagen de perfil
router.post('/upload-avatar', verifyToken, upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No se subió ningún archivo" });

    const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    // 2. Construimos la URL final
    const newUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const userId = req.user.id;

    // 2. Buscar imagen vieja para borrarla
    db.get("SELECT profile_img FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
            console.error("Error DB:", err);
        }

        // Si existe imagen vieja y es local (está en uploads), la borramos
        if (row && row.profile_img && row.profile_img.includes('/uploads/')) {
            const oldFileName = row.profile_img.split('/').pop();
            const oldPath = path.join(process.cwd(), 'uploads', oldFileName);

            if (fs.existsSync(oldPath)) {
                fs.unlink(oldPath, (err) => {
                    if (err) console.error("Error borrando archivo viejo:", err);
                });
            }
        }

        // 3. Guardar nueva URL en la DB
        const sqlUpdate = "UPDATE users SET profile_img = ? WHERE id = ?";
        db.run(sqlUpdate, [newUrl, userId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, url: newUrl });
        });
    });
});

export default router;