import { pathToFileURL } from 'node:url';
import { config } from './config/env.js';
import { app } from './app.js';
import db, { ready } from './db.js';
import { log } from './observability.js';

export async function start() {
    await ready;
    const server = app.listen(config.port, '0.0.0.0', () => log('info', 'server_started', { port: server.address().port }));
    server.on('error', () => { log('error', 'server_failed'); process.exitCode = 1; db.close(); });
    const stop = () => {
        log('info', 'server_stopping');
        server.close(() => db.close());
        setTimeout(() => process.exit(1), 10000).unref();
    };
    process.once('SIGTERM', stop);
    process.once('SIGINT', stop);
    return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    start().catch(() => { log('error', 'database_initialization_failed'); process.exit(1); });
}
