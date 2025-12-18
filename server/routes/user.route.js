// ENCARGADO DE GESTIONAR CONFIGURACIONES DEL USER
import express from 'express'
import db from '../db.js'
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router()

// GET para llenar inputs del dashboard con los colores del usuario
router.get('/me', verifyToken, (req, res) => {
    const sql = "SELECT username, email, bio, bg_color, btn_color, text_color FROM users WHERE id = ?";

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

export default router;