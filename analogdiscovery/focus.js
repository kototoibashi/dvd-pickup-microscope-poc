// This script adjusts the Wavegen offset based on Scope measurement.
clear()
if(!('Wavegen' in this) || !('Scope' in this) || !('Supplies' in this)) throw "Please open a Scope and a Wavegen instrument";

function wavegen_dc(channel,value) {
    const channel = channel == 2 ? Wavegen.Channel2 : Wavegen.Channel1;
    channel.Mode.text = "Simple";
    channel.Simple.Type.text = "DC";
    channel.Simple.Offset.value = value;
}

function supply_positive(value) {
    Supplies.Output.PositiveSupply.Voltage.value = value;
    Supplies.Output.PositiveSupply.Enable.value = 1;
}

function supply_negative(value) {
    Supplies.Output.NegativeSupply.Voltage.value = value;
    Supplies.Output.NegativeSupply.Enable.value = 1;
}

function init() {
    wavegen_dc(1,0);
    wavegen_dc(2,0);
    supply_positive(5);
    supply_negative(2.75);
    Wavegen.run();
    Supplies.run();
    Scope.single();
    Scope.Time.Position.value = 5E-3;
    Scope.Time.Base.value = 10E-3;
}

function get_scope_avg() {
    return Scope.Channel1.measure("Average");
}

function search_focus() {
    function func(min,max,div,epsilon) {
        const step = (max - min) / div;
        var peak_value = -99999;
        var peak_voltage = 0;
        for(var voltage = min; voltage <= max; voltage += step) {
            wavegen_dc(1,voltage);
            Scope.single();
            if(!Scope.wait()) throw "Stopped";
            wait(1)
            Scope.single();
            if(!Scope.wait()) throw "Stopped";
            Scope.single();
            if(!Scope.wait()) throw "Stopped";
            const value = get_scope_avg();
            if(peak_value <= value) {
                peak_value = value;
                peak_voltage = voltage;
            }
        }
        print(peak_voltage*1000 + " - " + peak_value)
        if( step < epsilon ) {
            wavegen_dc(1,peak_voltage);
            return peak_voltage;
        } else {
            return func(peak_voltage - step * 1.5,peak_voltage + step * 1.5, div, epsilon);
        }
    }
    return func(-0.22,0.22,10,5E-4);
}

init();
search_focus();