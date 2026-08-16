import { Sfsm, FaDefinition, TransceiverHub, wireSfsm } from "../../../src/sfsm";
import { TransceiverBase } from "../../../src/sfsm/TransceiverBase";

describe("Tutorial – 3.2 Signal Senders, Command Receivers, Controllers, and the Transceiver Hub)", () => {

    const turnstileFa: FaDefinition = {
        Turnstile: [
            ['I',        'start', 'locked'],
            ['locked',   'coin',  'unlocked', 'GATE.unlock'],
            ['unlocked', 'push',  'locked',   'GATE.lock']
        ]
    };
    
class TurnstileGate extends TransceiverBase {

//--- External interface for the TurnstileGate controller     
    start(): void       { this.sendSignal('start'); }
    insertCoin(): void  { this.sendSignal('coin'); }
    walkThrough(): void { this.sendSignal('push'); }
    isLocked(): boolean { return this.locked; }

    private locked = true;

    constructor() {
        super(['start', 'coin', 'push'], ['GATE.lock', 'GATE.unlock']);
    }

    //--- Implementation of abstract methods from TransceiverBase
        protected handleCommand(command: string): void {
            this.locked = command === 'GATE.lock';
        }

        protected handleSignal(signal: string): void {
            // Not used in this test
        }
    }

    const sfsm = new Sfsm(turnstileFa);

    const gate = new TurnstileGate();

    wireSfsm(sfsm, [gate]);

    it("should return an object for the extended FA file", () => {
        gate.start();
        gate.insertCoin();
        gate.isLocked();      // false — the SFSM sent 'GATE.unlock' in response to 'coin'
        expect(gate.isLocked()).toBe(false);

        gate.walkThrough();
        gate.isLocked();      // true  — the SFSM sent 'GATE.lock' in response to 'push'
        expect(gate.isLocked()).toBe(true);
    });
});
