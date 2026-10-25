package main
import rego.v1

good_container := {
    "name":"api","image":"treecify-lab:1.0","imagePullPolicy":"Never",
    "readinessProbe":{"httpGet":{"path":"/ready","port":3001}},
    "livenessProbe":{"httpGet":{"path":"/health","port":3001}},
    "resources":{"requests":{"cpu":"50m","memory":"128Mi"},"limits":{"cpu":"500m","memory":"512Mi"}},
    "securityContext":{"runAsNonRoot":true,"allowPrivilegeEscalation":false,"readOnlyRootFilesystem":true,"capabilities":{"drop":["ALL"]}}
}
good := {"kind":"Deployment","spec":{"replicas":2,"template":{"spec":{
    "automountServiceAccountToken":false,
    "securityContext":{"seccompProfile":{"type":"RuntimeDefault"}},
    "containers":[good_container]
}}}}
test_good if { count(deny) == 0 with input as good }
test_custom_rule_token if {
    bad := json.patch(good, [{"op":"remove","path":"/spec/template/spec/automountServiceAccountToken"}])
    count(deny) > 0 with input as bad
}
test_readonly if {
    bad := json.patch(good, [{"op":"replace","path":"/spec/template/spec/containers/0/securityContext/readOnlyRootFilesystem","value":false}])
    count(deny) > 0 with input as bad
}
test_replica if {
    bad := json.patch(good, [{"op":"replace","path":"/spec/replicas","value":1}])
    count(deny) > 0 with input as bad
}
test_missing_limits if {
    bad := json.patch(good, [{"op":"remove","path":"/spec/template/spec/containers/0/resources/limits"}])
    count(deny) > 0 with input as bad
}
test_mutable_image if {
    bad := json.patch(good, [{"op":"replace","path":"/spec/template/spec/containers/0/image","value":"attacker:latest"}])
    count(deny) > 0 with input as bad
}
test_non_deployment if { count(deny) == 0 with input as {"kind":"Service"} }
