// CHANGE IT !!!
const FILENAME = "E:/temp/acquisition.csv";
const SCAN_LINES = 100;

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
    wavegen_dc(2,0);
    supply_positive(5);
    supply_negative(0.5);
    Wavegen.run();
    Supplies.run();
    Scope.run();
}

function get_scope_avg() {
    return Scope.Channel1.measure("Average");
}

function scan() {
    const x_max = -0.2;
    const x_min = 0.2;
    const x_step = (x_max - x_min) / 20;
    const y_min = 0.5;
    const y_max = 5.0;
    const y_step = (y_max - y_min) / SCAN_LINES;

    Scope.Time.Position.value = 110E-3;
    Scope.Time.Base.value = 200E-3;

    Wavegen.Channel2.Mode.text = "Simple";
    Wavegen.Channel2.Simple.Type.text = "Triangle";
    Wavegen.Channel2.Simple.Offset.value = x_min;
    Wavegen.Channel2.Simple.Amplitude.value = (x_max - x_min);
    Wavegen.Channel2.Simple.Period.value = 800E-3;

    const arr = [];
    var count = 0;

    for(var y = y_min; y <= y_max; y += y_step) {
        supply_negative(-y);
        wait(0.1);
        Scope.single();
        if(!Scope.wait()) throw "Stopped";
        arr.push(Scope.channel[0].data);
        FileAppendLine(FILENAME, Scope.channel[0].data);
        count++;
        if( count % 10 == 0) {print(count);}
    }
    
}

init();
scan();

print("END");