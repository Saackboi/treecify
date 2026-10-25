import { config } from './config/env.js';

export const log = (level, event, fields = {}) => {
    process.stdout.write(JSON.stringify({ ts: new Date().toISOString(), level, event, instancia: config.instance, ...fields }) + '\n');
};
const counts = new Map();
export function observe(req, res, next) {
    const started = performance.now();
    res.setHeader('X-Instance-Name', config.instance);
    res.on('finish', () => {
        // Avoid query strings, headers, bodies and unbounded metric labels.
        const route = req.baseUrl + (req.route?.path instanceof RegExp ? '/frontend' : req.route?.path || '/unmatched');
        const labels = JSON.stringify({ ruta: route, codigo: String(res.statusCode), instancia: config.instance });
        counts.set(labels, (counts.get(labels) || 0) + 1);
        log(res.statusCode >= 400 ? 'warn' : 'info', res.statusCode === 401 ? 'acceso no autorizado' : 'http_request', {
            method: req.method, route, status: res.statusCode, duration_ms: Math.round(performance.now() - started),
        });
    });
    next();
}
export function metrics() {
    const lines = ['# HELP peticiones_total Peticiones por ruta, codigo e instancia.', '# TYPE peticiones_total counter'];
    for (const [labels, count] of counts) {
        const values = Object.entries(JSON.parse(labels)).map(([key, value]) => key + '=' + JSON.stringify(value)).join(',');
        lines.push('peticiones_total{' + values + '} ' + count);
    }
    return lines.join('\n') + '\n';
}
