import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Definimos la carpeta en la raíz del proyecto
const uploadDir = path.join(process.cwd(), 'uploads');

// Si no existe, la creamos
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // user-ID-TIMESTAMP.ext
        const ext = path.extname(file.originalname);
        cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
    }
});

const upload = multer({ storage });

export default upload;