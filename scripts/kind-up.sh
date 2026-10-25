#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1
ENGINE="${1:-docker}"
case "$ENGINE" in docker|podman) ;; *) exit 2;; esac
for command in "$ENGINE" kind kubectl node; do command -v "$command" >/dev/null || { echo "Falta $command"; exit 1; }; done
if kind get clusters | grep -qx treecify-lab; then
  echo "Ya existe treecify-lab. Este script solo crea un clúster de laboratorio nuevo."; exit 1
fi
BUILD_OPTIONS=()
if [[ "$ENGINE" == podman ]]; then BUILD_OPTIONS+=(--format docker); fi
"$ENGINE" build "${BUILD_OPTIONS[@]}" -t treecify-lab:1.0 .
if [[ "$ENGINE" == podman ]]; then export KIND_EXPERIMENTAL_PROVIDER=podman; fi
kind create cluster --name treecify-lab --config kind-config.yaml
if [[ "$ENGINE" == docker ]]; then
  kind load docker-image treecify-lab:1.0 --name treecify-lab
else
  mkdir -p tmp
  podman save --format docker-archive -o tmp/treecify-lab.tar treecify-lab:1.0
  kind load image-archive tmp/treecify-lab.tar --name treecify-lab
fi
k() { kubectl --context kind-treecify-lab -n treecify-lab "$@"; }
kubectl --context kind-treecify-lab apply -f k8s/namespace.yaml
# Generate secret in a private temporary file, not in Git or a command-line literal.
SECRET_FILE="$(mktemp)"
chmod 600 "$SECRET_FILE"
trap 'rm -f "$SECRET_FILE"' EXIT
node -e "process.stdout.write('JWT_SECRET='+require('crypto').randomBytes(48).toString('hex')+'\n')" > "$SECRET_FILE"
k create secret generic treecify-secret --from-env-file="$SECRET_FILE"
k apply -f k8s/
k rollout status deployment/treecify --timeout=180s
k get pods -o wide
echo "Clúster listo: http://localhost:8080. Ejecute bash scripts/k8s-experiments.sh."
