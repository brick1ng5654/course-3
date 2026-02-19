library verilog;
use verilog.vl_types.all;
entity lab04_JK is
    port(
        C               : out    vl_logic;
        Clk             : in     vl_logic;
        J               : out    vl_logic;
        K               : out    vl_logic;
        JK_res          : out    vl_logic;
        PRN             : in     vl_logic;
        X               : out    vl_logic_vector(3 downto 0)
    );
end lab04_JK;
