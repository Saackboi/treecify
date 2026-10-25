import fs from 'node:fs';
const item = JSON.parse(fs.readFileSync(0, 'utf8'))[0];
const host = item.HostConfig || {};
console.log(JSON.stringify({
    user: item.Config.User,
    readonly: host.ReadonlyRootfs,
    cap_drop: host.CapDrop,
    security_opt: host.SecurityOpt,
    resources: { memory_bytes: host.Memory, nano_cpus: host.NanoCpus, pids_limit: host.PidsLimit },
    healthcheck: item.Config.Healthcheck?.Test,
    health_status: (item.State.Health || item.State.Healthcheck)?.Status,
}, null, 2));
