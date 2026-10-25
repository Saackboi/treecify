import fs from 'node:fs';
const lines = fs.readFileSync(process.argv[2], 'utf8').trim().split(/\r?\n/).filter(Boolean);
const statuses = {};
for (const line of lines) {
    const status = line.split(' ').at(-1);
    statuses[status] = (statuses[status] || 0) + 1;
}
console.log(JSON.stringify({ requests: lines.length, failed: lines.filter(l => !l.endsWith(' 200')).length, statuses }, null, 2));
