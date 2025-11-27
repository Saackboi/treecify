
import sqlite3 from 'sqlite3';
import path from 'path';

// 1. Definimos la ruta ABSOLUTA del archivo. 
// process.cwd() obtiene la carpeta raíz donde ejecutas el comando "node"
const dbPath = path.resolve(process.cwd(), 'links.db');

console.log(`🗄️ Intentando crear base de datos en: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ ERROR FATAL: No se pudo abrir la base de datos.");
        console.error("Causa:", err.message);
    } else {
        console.log("✅ Conexión exitosa a SQLite.");
    }
});

// 2. Crear la tabla si no existe (Inicialización)
// Usamos SERIALIZADO para asegurar que esto pase antes de cualquier consulta
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            clicks INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error("Error creando tabla:", err);
        } else {
            console.log(" Tabla 'links' lista.");
        }
    });
});

export default db;