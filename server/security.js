import { createHmac, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { config } from './config/env.js';

export function signToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, config.secret, {
        algorithm: 'HS256', expiresIn: '1h', issuer: 'treecify', audience: 'treecify-api',
    });
}
export function validateToken(token) {
    if (typeof token !== 'string' || token.length > 4096) throw new Error('Token inválido');
    const parts = token.split('.');
    if (parts.length !== 3 || !parts.every(p => /^[A-Za-z0-9_-]+$/.test(p))) throw new Error('Formato JWT inválido');
    const expected = createHmac('sha256', config.secret).update(parts[0] + '.' + parts[1]).digest();
    const actual = Buffer.from(parts[2], 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Firma inválida');
    const claims = jwt.verify(token, config.secret, { algorithms: ['HS256'], issuer: 'treecify', audience: 'treecify-api' });
    if (!Number.isSafeInteger(claims.id) || claims.id < 1) throw new Error('Sujeto inválido');
    return claims;
}
export const validText = (v, max, min = 1) => typeof v === 'string' && v.trim().length >= min && v.length <= max;
export const validUsername = v => typeof v === 'string' && /^[a-zA-Z0-9_-]{3,32}$/.test(v);
export const validEmail = v => validText(v, 254) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const validPassword = v => typeof v === 'string' && v.length >= 12 && Buffer.byteLength(v) <= 72;
export function validUrl(v) {
    if (!validText(v, 2048)) return false;
    try { const u = new URL(v); return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password; }
    catch { return false; }
}
