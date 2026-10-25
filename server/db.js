import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config/env.js';

let connection;
export const ready = new Promise((resolve, reject) => {
    try {
        fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });
        connection = new DatabaseSync(config.dbPath);
        connection.exec(`PRAGMA journal_mode=WAL;
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
          );`);
        const columns = connection.prepare('PRAGMA table_info(users)').all();
        const required = { bio: "TEXT DEFAULT ''", bg_color: "TEXT DEFAULT '#f3f4f6'", btn_color: "TEXT DEFAULT '#4f46e5'", text_color: "TEXT DEFAULT '#ffffff'", profile_img: "TEXT DEFAULT ''" };
        for (const [name, type] of Object.entries(required)) {
            // Identifiers and types are from the fixed allowlist above, never request input.
            if (!columns.some(c => c.name === name)) connection.exec('ALTER TABLE users ADD COLUMN ' + name + ' ' + type);
        }
        resolve();
    } catch (error) { reject(error); }
});
// Small callback adapter keeps route contracts while using SQLite included in Node 24.
function query(method, sql, params, callback) {
    queueMicrotask(() => {
        let result;
        try { result = connection.prepare(sql)[method](...params); }
        catch (error) {
            if ([1555, 2067].includes(error.errcode)) error.code = 'SQLITE_CONSTRAINT';
            callback(error); return;
        }
        if (method === 'run') callback.call({ lastID: Number(result.lastInsertRowid), changes: Number(result.changes) }, null);
        else callback(null, result);
    });
}
const db = {
    get: (sql, params, cb) => query('get', sql, params, cb),
    all: (sql, params, cb) => query('all', sql, params, cb),
    run: (sql, params, cb) => query('run', sql, params, cb),
    close(callback) { connection?.close(); if (callback) queueMicrotask(callback); },
};
export default db;
