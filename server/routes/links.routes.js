//LÓGICA DE LOS LINKS (GET POST DELETE)

import express from 'express'
import db from '../db.js'

const router = express.Router()

//RUTAS RELATIVAS A "/api/links"

// 1. Obtener links (GET)
router.get('/', (req, res) => {
    const sql = "SELECT * FROM links ORDER BY id DESC"

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({success: false, error: err.message})
        }
        res.json({success: true, data: rows})
    })
});

// 2. Crear nuevo link (POST)
router.post('/', (req, res) => {
    const { title, url } = req.body;

    // Validación básica
    if (!title || !url) {
        return res.status(400).json({ success: false, message: "Faltan datos" });
    }

    const sql = "INSERT INTO links (title, url) VALUES (?, ?)"
    const params = [title, url]

    //USAMOS FUNCTION() CLÁSICA PARA TENER ACCESO A 'this.lastID'
    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({success: false, error: err.message})
        }

        //Devolvemos el objeto creado para que React lo pinte
        res.status(201).json ({
            success: true,
            data: {
                id: this.lastID,
                title,
                url,
                clicks: 0
            }
        })
    })
});

// 3. DELETE: Eliminar un link por su ID
router.delete('/:id', (req, res) => {
    const { id } = req.params; // Capturamos el ID de la URL

    const sql = "DELETE FROM links WHERE id = ?";
    
    db.run(sql, id, function(err) {
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