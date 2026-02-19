library verilog;
use verilog.vl_types.all;
entity lab04_JK_vlg_check_tst is
    port(
        C               : in     vl_logic;
        J               : in     vl_logic;
        JK_res          : in     vl_logic;
        K               : in     vl_logic;
        X               : in     vl_logic_vector(3 downto 0);
        sampler_rx      : in     vl_logic
    );
end lab04_JK_vlg_check_tst;
