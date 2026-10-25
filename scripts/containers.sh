#!/usr/bin/env bash
# Git Bash / WSL / Linux. One isolated container and fresh tmpfs data per run.
set -euo pipefail
cd "$(dirname "$0")/.."
ENGINE="${1:-docker}"
case "$ENGINE" in docker|podman) ;; *) echo "Use docker o podman"; exit 2;; esac
# Avoid Git Bash path mangling for container paths.
export MSYS_NO_PATHCONV=1
DEST="evidencias/$ENGINE"
mkdir -p "$DEST"
"$ENGINE" --version | tee "$DEST/version.txt"
"$ENGINE" info --format json > "$DEST/info.json"
BUILD_OPTIONS=()
if [[ "$ENGINE" == podman ]]; then BUILD_OPTIONS+=(--format docker); fi
"$ENGINE" build "${BUILD_OPTIONS[@]}" -t treecify-lab:1.0 . 2>&1 | tee "$DEST/build.txt"
NAME="treecify-lab-$ENGINE"
PORT="${LAB_PORT:-3001}"
RESOURCE_OPTIONS=(--pids-limit 100 --memory 512m --cpus 1)
if [[ "$ENGINE" == podman && "${PODMAN_ROOTLESS_CGROUPS:-}" == unavailable ]]; then
  RESOURCE_OPTIONS=(--cgroups=disabled --ulimit nofile=1024:1024 --ulimit nproc=100:100)
  printf "WSL rootless: cgroups no delegados; sin límite CPU/memoria. Se conservan UID, readonly, capacidades y no-new-privileges.\n" > "$DEST/runtime-limitations.txt"
fi
if "$ENGINE" container exists "$NAME" 2>/dev/null || "$ENGINE" inspect "$NAME" >/dev/null 2>&1; then
  echo "Ya existe $NAME. Revise y retire únicamente el contenedor de laboratorio antes de repetir."; exit 1
fi
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"
trap '"$ENGINE" rm -f "$NAME" >/dev/null 2>&1 || true; unset JWT_SECRET' EXIT
"$ENGINE" run -d --name "$NAME" --read-only --user 10001:10001 --cap-drop ALL --security-opt no-new-privileges "${RESOURCE_OPTIONS[@]}" \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m --tmpfs /data:rw,noexec,nosuid,mode=1777,size=64m \
  -p "127.0.0.1:$PORT:3001" -e JWT_SECRET -e "PUBLIC_URL=http://localhost:$PORT" treecify-lab:1.0
BASE_URL="http://127.0.0.1:$PORT" npm run smoke | tee "$DEST/smoke.txt"
"$ENGINE" logs "$NAME" > "$DEST/logs.jsonl" 2>&1
# Whitelist inspection fields: never save Config.Env (contains the secret).
"$ENGINE" inspect "$NAME" | node scripts/inspect-summary.mjs > "$DEST/inspect.json"
"$ENGINE" exec "$NAME" id > "$DEST/identity.txt"
"$ENGINE" image inspect treecify-lab:1.0 --format '{{.Id}}' > "$DEST/image-id.txt"
echo "Evidencia real guardada en $DEST. Revise info.json antes de compartir metadatos de su equipo."
