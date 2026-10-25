package main
import rego.v1

good := [
    {"Cmd":"from","Value":["node:24@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","AS","runtime"]},
    {"Cmd":"user","Value":["10001:10001"]},
    {"Cmd":"healthcheck","Value":["CMD","node","health.js"]}
]
test_good if { count(deny) == 0 with input as good }
test_mutable_base if {
    bad := array.concat([{"Cmd":"from","Value":["node:latest"]}], array.slice(good, 1, 3))
    count(deny) > 0 with input as bad
}
test_missing_user if { count(deny) > 0 with input as [good[0], good[2]] }
test_root_final_user if { count(deny) > 0 with input as array.concat(good, [{"Cmd":"user","Value":["root"]}]) }
test_custom_rule_missing_healthcheck if { count(deny) > 0 with input as [good[0], good[1]] }
test_disabled_healthcheck if { count(deny) > 0 with input as [good[0], good[1], {"Cmd":"healthcheck","Value":["NONE"]}] }
