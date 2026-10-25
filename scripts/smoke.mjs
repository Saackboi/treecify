import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:3001');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) throw new Error('Prueba solo contra loopback de laboratorio');
const get = async (route, init) => fetch(new URL(route, base), { ...init, signal: AbortSignal.timeout(5000) });
let healthy = false;
for (let i = 0; i < 30; i++) {
    try { const response = await get('/health'); if (response.ok) { healthy = true; break; } } catch { /* Retry while the local service starts. */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
}
assert.ok(healthy, 'Servicio no disponible después de 30 intentos');
assert.equal((await get('/ready')).status, 200);
assert.equal((await get('/api/resumen')).status, 401);
assert.equal((await get('/api/resumen', { headers: { Authorization: 'Bearer invalid' } })).status, 401);
const id = randomBytes(6).toString('hex');
const response = await get('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'smoke_' + id, email: id + '@example.invalid', password: randomBytes(24).toString('hex') }) });
assert.equal(response.status, 201);
const { token } = await response.json();
const authorized = await get('/api/resumen', { headers: { Authorization: 'Bearer ' + token } });
assert.equal(authorized.status, 200);
assert.ok((await authorized.json()).instancia);
assert.match(await (await get('/metrics')).text(), /peticiones_total/);
console.log('Smoke OK: health, readiness, 401, JWT válido, instancia y métricas (datos ficticios).');
