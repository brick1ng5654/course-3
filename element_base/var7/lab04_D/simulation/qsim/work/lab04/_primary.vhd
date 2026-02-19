library verilog;
use verilog.vl_types.all;
entity lab04 is
    port(
        dinamic_D       : out    vl_logic;
        Clk             : in     vl_logic;
        PRN             : in     vl_logic;
        static_D        : out    vl_logic;
        C               : out    vl_logic;
        D               : out    vl_logic;
        X               : out    vl_logic_vector(3 downto 0)
    );
end lab04;
