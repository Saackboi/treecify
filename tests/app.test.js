import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import jwt from 'jsonwebtoken';
import sharp from 'sharp';

const temp = await mkdtemp(path.join(os.tmpdir(), 'treecify-test-'));
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.DB_PATH = path.join(temp, 'test.db');
process.env.UPLOAD_DIR = path.join(temp, 'uploads');
process.env.PUBLIC_URL = 'http://localhost:3001';
process.env.CORS_ORIGINS = 'http://localhost:5173';
const { app } = await import('../server/app.js');
const { default: db, ready } = await import('../server/db.js');
const { signToken, validateToken } = await import('../server/security.js');
let server, base, token, userId;
const password = randomBytes(18).toString('hex');
async function request(route, options = {}) {
    const response = await fetch(base + route, options);
    const type = response.headers.get('content-type') || '';
    const body = type.includes('json') ? await response.json() : await response.text();
    return { status: response.status, body, headers: response.headers };
}
const json = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
before(async () => {
    await ready;
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
    await new Promise(resolve => server.close(resolve));
    await new Promise(resolve => db.close(resolve));
    await rm(temp, { recursive: true, force: true });
});

test('startup fails without or with weak JWT_SECRET', () => {
    for (const secret of ['', 'short']) {
        const result = spawnSync(process.execPath, ['server/index.js'], { env: { ...process.env, JWT_SECRET: secret }, encoding: 'utf8' });
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /JWT_SECRET/);
        assert.ok(!result.stdout.includes('server_started'));
    }
});
test('JWT valid signature and rejected modifications, lengths, expiry, algorithm and claims', () => {
    const signed = signToken({ id: 1, email: 'demo@example.invalid' });
    assert.equal(validateToken(signed).id, 1);
    const [header, payload, signature] = signed.split('.');
    const changed = (signature[0] === 'a' ? 'b' : 'a') + signature.slice(1);
    for (const bad of ['', 'a.b', header + '.' + payload + '.AA', header + '.' + payload + '.' + changed, 'x'.repeat(5000)]) {
        assert.throws(() => validateToken(bad));
    }
    for (const options of [
        { algorithm: 'HS256', expiresIn: -1, issuer: 'treecify', audience: 'treecify-api' },
        { algorithm: 'HS384', issuer: 'treecify', audience: 'treecify-api' },
        { algorithm: 'HS256', issuer: 'other', audience: 'treecify-api' },
        { algorithm: 'HS256', issuer: 'treecify', audience: 'other' },
    ]) assert.throws(() => validateToken(jwt.sign({ id: 1 }, process.env.JWT_SECRET, options)));
    assert.throws(() => validateToken(signToken({ id: '1' })));
});
test('health, readiness, CSP and CORS', async () => {
    const health = await request('/health');
    assert.equal(health.status, 200);
    assert.ok(health.body.instancia);
    assert.equal(health.headers.get('x-powered-by'), null);
    assert.match(health.headers.get('content-security-policy'), /script-src 'self'/);
    assert.equal((await request('/ready')).status, 200);
    assert.equal((await request('/health', { headers: { Origin: 'https://evil.invalid' } })).status, 403);
    assert.equal((await request('/health', { headers: { Origin: 'http://localhost:5173' } })).headers.get('access-control-allow-origin'), 'http://localhost:5173');
});
test('protected endpoints reject missing and invalid credentials', async () => {
    for (const route of ['/api/resumen', '/api/links', '/api/user/me']) {
        assert.equal((await request(route)).status, 401);
        assert.equal((await request(route, { headers: { Authorization: 'Bearer invalid' } })).status, 401);
    }
});
test('registration validates types, creates fictitious user and authenticates', async () => {
    assert.equal((await request('/api/auth/register', json({ username: {}, email: [], password: 123 }))).status, 400);
    assert.equal((await request('/api/auth/register', json({ username: 'demo', email: 'demo@example.invalid', password: 'x'.repeat(73) }))).status, 400);
    const registered = await request('/api/auth/register', json({ username: 'demo', email: 'demo@example.invalid', password }));
    assert.equal(registered.status, 201);
    token = registered.body.token; userId = registered.body.user.id;
    assert.equal(validateToken(token).id, userId);
    assert.equal((await request('/api/auth/register', json({ username: 'demo', email: 'demo@example.invalid', password }))).status, 409);
    assert.equal((await request('/api/auth/login', json({ email: 'demo@example.invalid', password }))).status, 200);
    assert.equal((await request('/api/auth/login', json({ email: 'demo@example.invalid', password: randomBytes(18).toString('hex') }))).status, 401);
});
test('links enforce HTTP(S) and ownership; profile validates colors and length', async () => {
    const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
    assert.equal((await request('/api/resumen', { headers })).body.total_registros, 0);
    for (const url of ['javascript:alert(1)', 'data:text/html,test', 'https://user:pass@example.invalid', {}]) {
        assert.equal((await request('/api/links', { ...json({ title: 'Demo', url }), headers })).status, 400);
    }
    const created = await request('/api/links', { ...json({ title: 'Demo', url: 'https://example.invalid/' }), headers });
    assert.equal(created.status, 201);
    const outsider = signToken({ id: userId + 100 });
    assert.equal((await request('/api/links/' + created.body.data.id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + outsider } })).status, 404);
    assert.equal((await request('/api/resumen', { headers })).body.total_registros, 1);
    assert.equal((await request('/api/links/public/demo')).body.links.length, 1);
    assert.equal((await request('/api/user/me', { method: 'PUT', headers, body: JSON.stringify({ bio: 'Demo', bg_color: 'red', btn_color: '#ffffff', text_color: '#000000' }) })).status, 400);
    assert.equal((await request('/api/user/me', { method: 'PUT', headers, body: JSON.stringify({ bio: 'Demo', bg_color: '#ffffff', btn_color: '#ffffff', text_color: '#000000' }) })).status, 200);
    assert.equal((await request('/api/links/' + created.body.data.id, { method: 'DELETE', headers })).status, 200);
});
test('avatar rejects MIME spoofing, SVG and oversized files; re-encodes valid PNG', async () => {
    async function upload(bytes, type, filename = 'avatar.png') {
        const form = new FormData();
        form.append('avatar', new Blob([bytes], { type }), filename);
        return request('/api/user/upload-avatar', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: form });
    }
    assert.equal((await upload('<svg></svg>', 'image/svg+xml')).status, 400);
    assert.equal((await upload('<script>alert(1)</script>', 'image/png')).status, 400);
    assert.equal((await upload(Buffer.alloc(2 * 1024 * 1024 + 1), 'image/png')).status, 413);
    const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: 'white' } }).png().toBuffer();
    const uploaded = await upload(png, 'image/png', '../../test.html');
    assert.equal(uploaded.status, 200);
    assert.match(uploaded.body.url, /\/uploads\/[a-f0-9-]{36}\.webp$/);
    const image = await fetch(base + new URL(uploaded.body.url).pathname);
    assert.equal(image.status, 200);
    assert.match(image.headers.get('content-type'), /image\/webp/);
    assert.equal(image.headers.get('x-content-type-options'), 'nosniff');
    assert.equal((await readdir(process.env.UPLOAD_DIR)).length, 1);
});
test('unknown API paths, JSON size limits, metrics and rate limit', async () => {
    assert.equal((await request('/api/not-real')).status, 404);
    assert.equal((await request('/api/auth/register', json({ bio: 'x'.repeat(17000) }))).status, 413);
    const result = await request('/metrics');
    assert.equal(result.status, 200);
    assert.match(result.body, /peticiones_total\{.*codigo="401".*instancia=/);
    assert.ok(!result.body.includes(token));
    let limited = false;
    for (let i = 0; i < 32; i++) {
        if ((await request('/api/auth/login', json({}))).status === 429) { limited = true; break; }
    }
    assert.equal(limited, true);
});
