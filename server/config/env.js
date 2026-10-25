import 'dotenv/config';
import path from 'node:path';
import os from 'node:os';

const secret = process.env.JWT_SECRET;
if (!secret || Buffer.byteLength(secret) < 32 || /^(cambia|change|example)/i.test(secret)) {
    throw new Error('JWT_SECRET debe existir en el entorno y tener al menos 32 bytes aleatorios.');
}
const port = Number(process.env.PORT || 3001);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('PORT inválido');
const publicUrl = new URL(process.env.PUBLIC_URL || 'http://localhost:3001');
if (!['http:', 'https:'].includes(publicUrl.protocol) || publicUrl.username || publicUrl.password) throw new Error('PUBLIC_URL inválida');
export const config = Object.freeze({
    secret, port, instance: process.env.INSTANCE_NAME || os.hostname(),
    publicUrl: publicUrl.origin,
    corsOrigins: (process.env.CORS_ORIGINS || publicUrl.origin).split(',').map(s => s.trim()),
    dbPath: path.resolve(process.env.DB_PATH || 'data/links.db'),
    uploadDir: path.resolve(process.env.UPLOAD_DIR || 'data/uploads'),
    distPath: path.resolve('dist'),
});
