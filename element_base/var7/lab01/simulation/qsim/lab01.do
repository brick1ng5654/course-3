onerror {quit -f}
vlib work
vlog -work work lab01.vo
vlog -work work lab01.vt
vsim -novopt -c -t 1ps -L cycloneii_ver -L altera_ver -L altera_mf_ver -L 220model_ver -L sgate work.lab01_vlg_vec_tst
vcd file -direction lab01.msim.vcd
vcd add -internal lab01_vlg_vec_tst/*
vcd add -internal lab01_vlg_vec_tst/i1/*
add wave /*
run -all
