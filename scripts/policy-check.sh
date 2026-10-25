#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
ENGINE="${ENGINE:-docker}"
export MSYS_NO_PATHCONV=1
POLICY_IMAGE='openpolicyagent/conftest:v0.71.1@sha256:0e77cdf7c1fcde035f3c579e4aaa6664ee2a8be5777eaa9af9f520cdd02280c0'
"$ENGINE" run --rm -v "$PWD:/project:ro" "$POLICY_IMAGE" verify --policy policy/docker
"$ENGINE" run --rm -v "$PWD:/project:ro" "$POLICY_IMAGE" verify --policy policy/k8s
"$ENGINE" run --rm -v "$PWD:/project:ro" "$POLICY_IMAGE" test Dockerfile --policy policy/docker
"$ENGINE" run --rm -v "$PWD:/project:ro" "$POLICY_IMAGE" test k8s/ --policy policy/k8s
