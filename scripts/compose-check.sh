#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p evidencias/compose
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"
trap 'docker compose down >/dev/null 2>&1 || true; unset JWT_SECRET' EXIT
docker compose version | tee evidencias/compose/version.txt
docker compose up --no-build --wait --wait-timeout 60 2>&1 | tee evidencias/compose/up.txt
docker compose ps --format json > evidencias/compose/ps.json
npm run smoke | tee evidencias/compose/smoke.txt
docker compose logs --no-color api > evidencias/compose/logs.jsonl
docker volume inspect treecify-lab_lab-data > evidencias/compose/lab-volume.json
docker compose down 2>&1 | tee evidencias/compose/down.txt
