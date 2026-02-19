library verilog;
use verilog.vl_types.all;
entity lab02 is
    port(
        out_D           : out    vl_logic;
        X               : in     vl_logic_vector(3 downto 0);
        out_1           : out    vl_logic;
        out_2           : out    vl_logic;
        out_M           : out    vl_logic
    );
end lab02;
