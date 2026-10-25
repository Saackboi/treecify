#!/usr/bin/env bash
# Only the named local kind cluster; fictitious read queries, no production targets.
set -euo pipefail
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1
k() { kubectl --context kind-treecify-lab -n treecify-lab "$@"; }
OUT="evidencias/k8s/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$OUT"
k rollout status deployment/treecify --timeout=120s
INITIAL_REPLICAS="$(k get deployment treecify -o jsonpath='{.spec.replicas}')"
INITIAL_IMAGE="$(k get deployment treecify -o jsonpath='{.spec.template.spec.containers[0].image}')"
# This token is synthetic id=1, not a real account or proof of shared state.
export JWT_SECRET="$(k get secret treecify-secret -o jsonpath='{.data.JWT_SECRET}' | base64 -d)"
TOKEN="$(node --input-type=module -e "const {signToken}=await import('./server/security.js');process.stdout.write(signToken({id:1,email:'demo@example.invalid'}))")"
unset JWT_SECRET
TRAFFIC_PID=""
cleanup() {
  if [[ -n "$TRAFFIC_PID" ]]; then kill "$TRAFFIC_PID" 2>/dev/null || true; wait "$TRAFFIC_PID" 2>/dev/null || true; fi
  k set image deployment/treecify "api=$INITIAL_IMAGE" >/dev/null || true
  k scale deployment/treecify "--replicas=$INITIAL_REPLICAS" >/dev/null || true
  unset TOKEN
}
trap cleanup EXIT
k get pods -o wide > "$OUT/initial-pods.txt"
(
  while true; do
    status="$(curl --max-time 2 -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/resumen)" || status=000
    printf '%s %s\n' "$(date -u +%FT%TZ)" "$status"
    sleep 0.3
  done
) > "$OUT/traffic.txt" &
TRAFFIC_PID=$!
printf '%s pod-delete\n' "$(date -u +%FT%TZ)" >> "$OUT/timeline.txt"
POD="$(k get pods -l app=treecify -o jsonpath='{.items[0].metadata.name}')"
k delete pod "$POD" --wait=true > "$OUT/deleted-pod.txt"
k rollout status deployment/treecify --timeout=120s > "$OUT/recovered-rollout.txt"
k wait --for=condition=Ready pod -l app=treecify --timeout=120s
k get pods -o wide > "$OUT/recovered-pods.txt"
printf '%s pod-recovered\n' "$(date -u +%FT%TZ)" >> "$OUT/timeline.txt"
k set image deployment/treecify api=treecify-lab:no-existe > "$OUT/bad-update.txt"
if k rollout status deployment/treecify --timeout=30s > "$OUT/bad-rollout.txt" 2>&1; then
  echo "La actualización inexistente no falló como se esperaba"; exit 1
fi
k get pods -o wide > "$OUT/bad-pods.txt"
k get events --sort-by=.metadata.creationTimestamp > "$OUT/bad-events.txt"
k rollout undo deployment/treecify > "$OUT/rollback.txt"
k rollout status deployment/treecify --timeout=120s >> "$OUT/rollback.txt"
printf '%s rollback-ready\n' "$(date -u +%FT%TZ)" >> "$OUT/timeline.txt"
k scale deployment/treecify --replicas=5
k rollout status deployment/treecify --timeout=120s
k get pods -o wide > "$OUT/scale-five.txt"
for i in $(seq 1 30); do
  curl --max-time 5 -fsS -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/resumen
  printf '\n'
done > "$OUT/distribution.jsonl"
# Trigger and collect events + metrics separately on every replica.
for pod in $(k get pods -l app=treecify -o jsonpath='{.items[*].metadata.name}'); do
  k exec "$pod" -- node -e "fetch('http://127.0.0.1:3001/api/resumen').then(r=>{if(r.status!==401)process.exit(1)})"
  k exec "$pod" -- node -e "fetch('http://127.0.0.1:3001/metrics').then(r=>r.text()).then(t=>process.stdout.write(t))" > "$OUT/$pod-metrics.txt"
  k logs "$pod" --tail=100 > "$OUT/$pod-logs.jsonl"
done
k scale deployment/treecify "--replicas=$INITIAL_REPLICAS"
k rollout status deployment/treecify --timeout=120s
# Wait for scaled-down pods to be removed, not only for desired replicas to be ready.
for i in $(seq 1 30); do
  COUNT="$(k get pods -l app=treecify --no-headers | wc -l | tr -d ' ')"
  [[ "$COUNT" == "$INITIAL_REPLICAS" ]] && break
  sleep 1
done
[[ "$COUNT" == "$INITIAL_REPLICAS" ]]
k get pods -o wide > "$OUT/restored-pods.txt"
kill "$TRAFFIC_PID" 2>/dev/null || true
wait "$TRAFFIC_PID" 2>/dev/null || true
TRAFFIC_PID=""
node scripts/traffic-summary.mjs "$OUT/traffic.txt" > "$OUT/traffic-summary.json"
echo "Pruebas y evidencias reales en $OUT. No demuestran persistencia compartida."
