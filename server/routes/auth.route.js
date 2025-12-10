
import express from 'express'
import db from '../db.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router()

const SECRET_KEY = process.env.JWT_SECRET

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Faltan datos." });
    }

    //Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.run(sql, [username, email, hashedPassword], function (err) {
        if (err) {
            // El error 19 se da por dato duplicado
            if (err.errno === 19) {
                return res.status(400).json({ success: false, message: "Este email ya está registrado" });
            }
            return res.status(500).json({ success: false, error: err.message });
        }

        //Generamos token automáticamente para que entre directo
        const token = jwt.sign({ id: this.lastID, email }, SECRET_KEY, { expiresIn: '24h' })

        res.status(201).json({ success: true, token, user: { id: this.lastID, username: username, email } });
    })

})

// 2. LOGIN (Sign In)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Buscamos al usuario por email
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        // Si no existe el usuario
        if (!user) {
            return res.status(401).json({ success: false, message: "Credenciales inválidas" });
        }

        // Comparamos la contraseña que escribió con la encriptada
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Credenciales inválidas" });
        }

        // Si todo ok, damos el Token
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });

        res.json({ success: true, token, user: { id: user.id, username: user.username, email: user.email } });
    });
});

export default router