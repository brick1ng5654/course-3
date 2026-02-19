onerror {quit -f}
vlib work
vlog -work work lab03.vo
vlog -work work lab03.vt
vsim -novopt -c -t 1ps -L cycloneii_ver -L altera_ver -L altera_mf_ver -L 220model_ver -L sgate work.lab03_vlg_vec_tst
vcd file -direction lab03.msim.vcd
vcd add -internal lab03_vlg_vec_tst/*
vcd add -internal lab03_vlg_vec_tst/i1/*
add wave /*
run -all
