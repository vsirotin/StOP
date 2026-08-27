import { Sfsm, FaDefinition, TransceiverHub, wireSfsm, SignalSenderBase} from "../../../src/sfsm";
import { TransceiverBase } from "../../../src/sfsm/TransceiverBase";

const turnstileFa: FaDefinition = {
    Turnstile: [
        ['I',        'coin',  'unlocked', 'GATE.unlock'],
        ['locked',   'coin',  'unlocked', 'GATE.unlock'],
        ['unlocked', 'push',  'locked',   'GATE.lock'],
        [`*`, `service`, 'locked', 'GATE.service']
    ]
};
    
class TurnstileGate extends TransceiverBase {

    //--- External interface for the TurnstileGate controller     
    insertCoin(): void  { this.sendSignal('coin'); }
    walkThrough(): void { this.sendSignal('push'); }

    // Simulated light signal on the gate: green means "go", red means "stop"
    lightSignal: 'green' | 'yellow' | 'red' = 'red';

    constructor() {
        super(
            ['coin', 'push', 'service'], // Signals, that gate can send to the SFSM
            ['GATE.lock', 'GATE.unlock', 'GATE.service'] // Commands, that gate can receive from the SFSM
        );
    }

    //--- Implementation of abstract method from TransceiverBase
    protected handleCommand(command: string): void {
        if (command === 'GATE.unlock') {
            this.lightSignal = 'green';
            return;
        } 
        if (command === 'GATE.service') {
            this.lightSignal = 'yellow';
            return;
        }       
        this.lightSignal = 'red';    
    }
}

class ServiceButton extends SignalSenderBase {

    constructor() {
        super(['service']); // Signals, that button can send to the SFSM
    }

    pushButton(): void { 
        this.sendSignal('service'); 
    }
    
}


const sfsm = new Sfsm(turnstileFa);

const gate = new TurnstileGate();

const serviceButton = new ServiceButton();

const hub = wireSfsm(sfsm, [gate]);
hub.registerSignalSender(serviceButton);

describe("Tutorial – 3.2 Signal Senders, Command Receivers, Controllers, and the Transceiver Hub)", () => {


    it("Processing of simple use case by turnstile", () => {
        gate.insertCoin();
        let state = sfsm.getHeadState();  // "unlocked" — the SFSM processed the 'coin' signal and 
        expect(state).toBe('unlocked');  
        expect(gate.lightSignal).toBe('green');  // the SFSM sent 'GATE.unlock' to the gate, which turned its light green

        gate.walkThrough();
        state = sfsm.getHeadState();  // "locked" — the SFSM processed the 'push' signal and
        expect(state).toBe('locked');  
        expect(gate.lightSignal).toBe('red');  // the SFSM sent 'GATE.lock' to the gate, which turned its light red

        serviceButton.pushButton();
        state = sfsm.getHeadState();  // "locked" — the SFSM processed the 'service' signal and
        expect(state).toBe('locked');  
        expect(gate.lightSignal).toBe('yellow');  // the SFSM sent 'GATE.service' to the gate, which turned its light yellow
        
    });
});
