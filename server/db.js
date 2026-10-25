import sqlite3 from 'sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config/env.js';

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
const db = new sqlite3.Database(config.dbPath);
export const ready = new Promise((resolve, reject) => {
    db.serialize(() => {
        db.exec(`PRAGMA journal_mode=WAL;
          PRAGMA busy_timeout=5000;
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL, password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
          CREATE TABLE IF NOT EXISTS links (
            id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
            title TEXT NOT NULL, url TEXT NOT NULL, clicks INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );`, err => {
            if (err) return reject(err);
            db.all('PRAGMA table_info(users)', [], (error, columns) => {
                if (error) return reject(error);
                const required = { bio: "TEXT DEFAULT ''", bg_color: "TEXT DEFAULT '#f3f4f6'", btn_color: "TEXT DEFAULT '#4f46e5'", text_color: "TEXT DEFAULT '#ffffff'", profile_img: "TEXT DEFAULT ''" };
                const migrations = Object.entries(required).filter(([name]) => !columns.some(c => c.name === name));
                const run = i => {
                    if (i === migrations.length) return resolve();
                    const [name, type] = migrations[i];
                    db.run('ALTER TABLE users ADD COLUMN ' + name + ' ' + type, e => e ? reject(e) : run(i + 1));
                };
                run(0);
            });
        });
    });
});
export default db;
