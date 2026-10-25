package main
import rego.v1

deny contains "Todas las bases externas deben fijarse por digest sha256" if {
    some instruction in input
    lower(instruction.Cmd) == "from"
    not regex.match("@sha256:[a-f0-9]{64}$", instruction.Value[0])
}
users := [instruction.Value[0] | some instruction in input; lower(instruction.Cmd) == "user"]
deny contains "El usuario final debe ser UID 10001 sin privilegios" if {
    count(users) == 0
}
deny contains "El usuario final debe ser UID 10001 sin privilegios" if {
    count(users) > 0
    users[count(users) - 1] != "10001:10001"
}
deny contains "Regla propia: se exige HEALTHCHECK" if {
    not some_healthcheck
}
some_healthcheck if {
    some instruction in input
    lower(instruction.Cmd) == "healthcheck"
    lower(instruction.Value[0]) != "none"
}
deny contains "ADD con origen remoto está prohibido" if {
    some instruction in input
    lower(instruction.Cmd) == "add"
    some value in instruction.Value
    regex.match("^https?://", value)
}
