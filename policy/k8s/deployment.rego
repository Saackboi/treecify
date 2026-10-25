package main
import rego.v1

is_deployment if { input.kind == "Deployment" }
containers := object.get(object.get(object.get(object.get(input, "spec", {}), "template", {}), "spec", {}), "containers", [])
pod := object.get(object.get(object.get(input, "spec", {}), "template", {}), "spec", {})
deny contains "Mínimo dos réplicas para demostración" if {
    is_deployment
    object.get(input.spec, "replicas", 0) < 2
}
deny contains "Regla propia: desactivar token de ServiceAccount" if {
    is_deployment
    object.get(pod, "automountServiceAccountToken", true) != false
}
deny contains "Se exige seccomp RuntimeDefault" if {
    is_deployment
    object.get(object.get(object.get(pod, "securityContext", {}), "seccompProfile", {}), "type", "") != "RuntimeDefault"
}
deny contains sprintf("%s: requiere readiness y liveness", [c.name]) if {
    is_deployment
    some c in containers
    not object.get(c, "readinessProbe", false)
}
deny contains sprintf("%s: requiere readiness y liveness", [c.name]) if {
    is_deployment
    some c in containers
    not object.get(c, "livenessProbe", false)
}
deny contains sprintf("%s: requiere requests y limits de CPU/memoria", [c.name]) if {
    is_deployment
    some c in containers
    some section in ["requests", "limits"]
    some resource in ["cpu", "memory"]
    not object.get(object.get(object.get(c, "resources", {}), section, {}), resource, false)
}
deny contains sprintf("%s: debe ejecutarse sin root", [c.name]) if {
    is_deployment
    some c in containers
    object.get(object.get(c, "securityContext", {}), "runAsNonRoot", false) != true
}
deny contains sprintf("%s: prohibir escalamiento de privilegios", [c.name]) if {
    is_deployment
    some c in containers
    object.get(object.get(c, "securityContext", {}), "allowPrivilegeEscalation", true) != false
}
deny contains sprintf("%s: raíz debe ser de solo lectura", [c.name]) if {
    is_deployment
    some c in containers
    object.get(object.get(c, "securityContext", {}), "readOnlyRootFilesystem", false) != true
}
deny contains sprintf("%s: descartar todas las capacidades", [c.name]) if {
    is_deployment
    some c in containers
    not "ALL" in object.get(object.get(object.get(c, "securityContext", {}), "capabilities", {}), "drop", [])
}
valid_image(c) if { regex.match("@sha256:[a-f0-9]{64}$", c.image) }
# One narrow exception for the local kind exercise, never a remotely pulled mutable tag.
valid_image(c) if { c.image == "treecify-lab:1.0"; c.imagePullPolicy == "Never" }
deny contains sprintf("%s: digest obligatorio salvo imagen local precargada", [c.name]) if {
    is_deployment
    some c in containers
    not valid_image(c)
}
