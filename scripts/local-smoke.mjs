import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const temp = await mkdtemp(path.join(os.tmpdir(), 'treecify-smoke-'));
const secret = randomBytes(48).toString('hex');
const child = spawn(process.execPath, ['server/index.js'], { env: {
    ...process.env, JWT_SECRET: secret, PORT: '0', PUBLIC_URL: 'http://localhost:3001',
    DB_PATH: path.join(temp, 'links.db'), UPLOAD_DIR: path.join(temp, 'uploads'),
}, stdio: ['ignore', 'pipe', 'pipe'] });
const closed = new Promise(resolve => child.once('close', resolve));
let output = '', errors = '';
child.stdout.on('data', chunk => { output += chunk; });
child.stderr.on('data', chunk => { errors += chunk; });
try {
    let port;
    for (let i = 0; i < 100; i++) {
        const record = output.split('\n').filter(Boolean).map(line => JSON.parse(line)).find(line => line.event === 'server_started');
        if (record) { port = record.port; break; }
        if (child.exitCode !== null) throw new Error('Servidor no pudo arrancar: ' + errors);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(port, 'El servidor no anunció su puerto');
    const smoke = spawn(process.execPath, ['scripts/smoke.mjs'], { env: { ...process.env, BASE_URL: 'http://127.0.0.1:' + port }, stdio: 'inherit' });
    assert.equal(await new Promise(resolve => smoke.once('close', resolve)), 0);
    assert.ok(!output.includes(secret));
    const records = output.trim().split('\n').map(line => JSON.parse(line));
    assert.ok(records.some(record => record.status === 401));
    assert.ok(records.some(record => record.status === 200));
    if (process.argv[2]) await writeFile(process.argv[2], output);
    console.log('Servidor real: arranque, HTTP y logs JSON comprobados sin guardar credenciales.');
} finally {
    child.kill();
    await closed;
    await rm(temp, { recursive: true, force: true });
}
