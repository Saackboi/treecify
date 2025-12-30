
import sqlite3 from 'sqlite3';
import path from 'path';

// 1. Definimos la ruta ABSOLUTA del archivo. 
// process.cwd() obtiene la carpeta raíz donde ejecutas el comando "node"
const dbPath = path.resolve(process.cwd(), 'links.db');

console.log(` Intentando crear base de datos en: ${dbPath}`);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(" ERROR FATAL: No se pudo abrir la base de datos.");
        console.error("Causa:", err.message);
    } else {
        console.log(" Conexión exitosa a SQLite.");
    }
});

// 2. Crear la tabla si no existe (Inicialización)
// Usamos SERIALIZADO para asegurar que esto pase antes de cualquier consulta
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
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

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        `, (err) => {
        if (err) {
            console.error("Error creando tabla:", err);
        } else {
            console.log(" Tabla 'users' lista.");
        }
    })

});

const migrationColumns = [
    "ALTER TABLE users ADD COLUMN bio TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN bg_color TEXT DEFAULT '#f3f4f6'",
    "ALTER TABLE users ADD COLUMN btn_color TEXT DEFAULT '#4f46e5'",
    "ALTER TABLE users ADD COLUMN text_color TEXT DEFAULT '#ffffff'",
    "ALTER TABLE users ADD COLUMN profile_img TEXT DEFAULT ''",
]

migrationColumns.forEach(query => {
    db.run(query, (err) => {
        // Ignoramos error si la columna ya existe
        if (err && !err.message.includes("duplicate column")) {
            console.error("Error en migración:", err.message);
        }
    });
});

export default db;