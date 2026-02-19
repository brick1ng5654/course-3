library verilog;
use verilog.vl_types.all;
entity lab04_JK_vlg_sample_tst is
    port(
        Clk             : in     vl_logic;
        PRN             : in     vl_logic;
        sampler_tx      : out    vl_logic
    );
end lab04_JK_vlg_sample_tst;
