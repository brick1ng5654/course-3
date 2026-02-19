library verilog;
use verilog.vl_types.all;
entity lab02_vlg_sample_tst is
    port(
        X               : in     vl_logic_vector(3 downto 0);
        sampler_tx      : out    vl_logic
    );
end lab02_vlg_sample_tst;
