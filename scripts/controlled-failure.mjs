import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const [mode, scenario] = process.argv.slice(2);
const choices = ['secret', 'policy', 'sast'];
if (!['inject', 'restore'].includes(mode) || !choices.includes(scenario)) throw new Error('Use: node scripts/controlled-failure.mjs inject|restore secret|policy|sast');
const branch = execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
if (!branch.startsWith('lab/failure-')) throw new Error('Primero cree una rama lab/failure-<caso>; nunca main');
const target = {
    secret: 'lab-false-credential.txt',
    policy: 'k8s/deployment.yaml',
    sast: 'server/lab-insecure.js',
}[scenario];
const backup = path.join('tmp', 'controlled-failure-' + scenario + '.json');
if (mode === 'inject') {
    if (fs.existsSync(backup)) throw new Error('Ya existe respaldo; restaure primero');
    const previous = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null;
    if (scenario !== 'policy' && previous !== null) throw new Error('El archivo de demostración ya existe');
    fs.mkdirSync('tmp', { recursive: true });
    fs.writeFileSync(backup, JSON.stringify({ target, previous }));
    if (scenario === 'secret') fs.writeFileSync(target, 'LAB_' + 'FAKE_CREDENTIAL_' + '0'.repeat(32) + '\n');
    if (scenario === 'policy') fs.writeFileSync(target, previous.replace('automountServiceAccountToken: false', 'automountServiceAccountToken: true'));
    if (scenario === 'sast') fs.writeFileSync(target, "import cors from 'cors';\nexport const insecureLabMiddleware = cors();\n");
} else {
    const data = JSON.parse(fs.readFileSync(backup, 'utf8'));
    if (data.target !== target) throw new Error('Respaldo inválido');
    if (data.previous === null) fs.unlinkSync(target); else fs.writeFileSync(target, data.previous);
    fs.unlinkSync(backup);
}
console.log(mode + ' ' + scenario + ': ' + target);
