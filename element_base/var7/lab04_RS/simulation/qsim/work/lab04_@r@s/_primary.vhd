library verilog;
use verilog.vl_types.all;
entity lab04_RS is
    port(
        RS_res          : out    vl_logic;
        PRN             : in     vl_logic;
        CLRN            : in     vl_logic;
        Clk             : in     vl_logic;
        C               : out    vl_logic;
        S               : out    vl_logic;
        R               : out    vl_logic;
        X               : out    vl_logic_vector(3 downto 0)
    );
end lab04_RS;
