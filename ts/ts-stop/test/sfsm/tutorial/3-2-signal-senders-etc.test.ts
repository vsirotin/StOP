import { Sfsm, FaDefinition, TransceiverHub, ISignalSender, ISignalReceiver, ITransceiver } from "../../../src/sfsm";

describe("Tutorial – 3.2 Signal Senders, Command Receivers, Controllers, and the Transceiver Hub)", () => {

    const turnstileFa: FaDefinition = {
        Turnstile: [
            ['I',        'start', 'locked'],
            ['locked',   'coin',  'unlocked', 'GATE.unlock'],
            ['unlocked', 'push',  'locked',   'GATE.lock']
        ]
    };
    
    class TurnstileGate implements ITransceiver {

    //--- External interface for the TurnstileGate controller     
        private locked = true;

        start(): void       { this.sendSignal('start'); }
        insertCoin(): void  { this.sendSignal('coin'); }
        walkThrough(): void { this.sendSignal('push'); }
        isLocked(): boolean { return this.locked; }

    //--- Implementation of the ITransceiver interface
        private signalTarget?: ISignalReceiver;

        getSignalNames(): readonly string[] { return ['start', 'coin', 'push']; }
        getCommandNames(): readonly string[] { return ['GATE.lock', 'GATE.unlock']; }

        receiveCommand(command: string): void {
            this.locked = command === 'GATE.lock';
        }

        connectSignalTarget(target: ISignalReceiver): void {
            this.signalTarget = target;
        }

        sendSignal(name: string): void {
            this.signalTarget?.receiveSignal(name);
        }
    }

    const sfsm = new Sfsm();
    sfsm.loadFA(turnstileFa);

    const gate = new TurnstileGate();

    const transcivers: ITransceiver[] = [gate];

    new TransceiverHub(sfsm, transcivers);

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
