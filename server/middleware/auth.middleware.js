import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
    // 1. Buscamos el token en la cabecera "Authorization"
    // El formato suele ser: "Bearer eyJhbGci..."
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Tomamos solo la parte del código

    if (!token) {
        return res.status(401).json({ success: false, message: "Acceso denegado. No hay token." });
    }

    try {
        // 2. Verificamos si es real y no ha expirado
        const decoded = jwt.verify(token, SECRET_KEY);

        // 3. Guardamos los datos del usuario dentro de la petición para usarlo luego
        req.user = decoded;

        next(); // Dejamos pasar a la siguiente función
    } catch (err) {
        return res.status(403).json({ success: false, message: "Token inválido o expirado." });
    }
};