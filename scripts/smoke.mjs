import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
const base = new URL(process.env.BASE_URL || 'http://127.0.0.1:3001');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname)) throw new Error('Prueba solo contra loopback de laboratorio');
const get = async (route, init) => fetch(new URL(route, base), { ...init, signal: AbortSignal.timeout(5000) });
let healthy = false;
for (let i = 0; i < 30; i++) {
    try { const response = await get('/health'); if (response.ok) { healthy = true; console.log("GET /health", response.status, JSON.stringify(await response.json())); break; } } catch { /* Retry while the local service starts. */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
}
assert.ok(healthy, 'Servicio no disponible después de 30 intentos');
const ready = await get('/ready'); assert.equal(ready.status, 200); console.log('GET /ready', ready.status);
const missing = await get('/api/resumen'); assert.equal(missing.status, 401); console.log('GET /api/resumen sin credencial', missing.status);
const invalid = await get('/api/resumen', { headers: { Authorization: 'Bearer invalid' } }); assert.equal(invalid.status, 401); console.log('GET /api/resumen JWT inválido', invalid.status);
const id = randomBytes(6).toString('hex');
const response = await get('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'smoke_' + id, email: id + '@example.invalid', password: randomBytes(24).toString('hex') }) });
assert.equal(response.status, 201); console.log('POST /api/auth/register con datos ficticios', response.status);
const { token } = await response.json();
const authorized = await get('/api/resumen', { headers: { Authorization: 'Bearer ' + token } });
assert.equal(authorized.status, 200);
const summary = await authorized.json(); assert.ok(summary.instancia); console.log('GET /api/resumen JWT válido', authorized.status, JSON.stringify(summary));
const metrics = await (await get('/metrics')).text(); assert.match(metrics, /peticiones_total/); console.log('GET /metrics\n' + metrics);
console.log('Smoke OK: health, readiness, 401, JWT válido, instancia y métricas (datos ficticios).');
