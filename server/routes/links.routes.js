//LÓGICA DE LOS LINKS (GET POST DELETE)

import express from 'express'
import db from '../db.js'
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router()

//RUTAS RELATIVAS A "/api/links"

// GET PÚBLICO: Obtener links por nombre de usuario
// Ruta: /api/links/public/:username
router.get('/public/:username', (req, res) => {
    const { username } = req.params;

    // 1. Primero buscamos el ID del usuario basado en su nombre
    db.get("SELECT id FROM users WHERE username = ?", [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // 2. Si existe, buscamos sus links
        db.all("SELECT * FROM links WHERE user_id = ? ORDER BY id DESC", [user.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, data: rows, username: username });
        });
    });
});

// 1. Obtener links (GET)
router.get('/', verifyToken, (req, res) => {
    const userId = req.user.id;
    const sql = "SELECT * FROM links WHERE user_id = ? ORDER BY id DESC"

    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message })
        }
        res.json({ success: true, data: rows })
    })
});

// 2. Crear nuevo link (POST)
router.post('/', verifyToken, (req, res) => {
    const { title, url } = req.body;
    const userId = req.user.id;

    // Validación básica
    if (!title || !url) {
        return res.status(400).json({ success: false, message: "Faltan datos" });
    }

    const sql = "INSERT INTO links (user_id, title, url) VALUES (?, ?, ?)"
    const params = [userId, title, url]

    //USAMOS FUNCTION() CLÁSICA PARA TENER ACCESO A 'this.lastID'
    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message })
        }

        //Devolvemos el objeto creado para que React lo pinte
        res.status(201).json({
            success: true,
            data: {
                id: this.lastID,
                user_id: userId,
                title,
                url,
                clicks: 0
            }
        })
    })
});

// 3. DELETE: Eliminar un link por su ID
router.delete('/:id', verifyToken, (req, res) => {
    const { id } = req.params; // Capturamos el ID de la URL

    const userId = req.user.id;

    const sql = "DELETE FROM links WHERE id = ? AND user_id = ?";

    db.run(sql, [id, userId], function (err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        // this.changes nos dice cuántas filas se borraron
        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: "Link no encontrado" });
        }

        res.json({ success: true, message: "Link eliminado correctamente" });
    });
});

export default router