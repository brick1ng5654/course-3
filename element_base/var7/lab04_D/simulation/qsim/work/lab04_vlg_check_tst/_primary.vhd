library verilog;
use verilog.vl_types.all;
entity lab04_vlg_check_tst is
    port(
        C               : in     vl_logic;
        D               : in     vl_logic;
        dinamic_D       : in     vl_logic;
        static_D        : in     vl_logic;
        X               : in     vl_logic_vector(3 downto 0);
        sampler_rx      : in     vl_logic
    );
end lab04_vlg_check_tst;
