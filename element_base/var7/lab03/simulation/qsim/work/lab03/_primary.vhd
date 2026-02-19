library verilog;
use verilog.vl_types.all;
entity lab03 is
    port(
        Y               : out    vl_logic_vector(3 downto 0);
        X               : in     vl_logic_vector(3 downto 0)
    );
end lab03;
