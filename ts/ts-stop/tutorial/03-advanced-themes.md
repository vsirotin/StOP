# StOP Tutorial. Chapter 3: Advanced Themes

## 3.1 How stacked states are processed

Here are the rules the `Sfsm` engine actually implements, inclusive of the logging rules that are described in chapter below:

1. After loading, the root FA is the only element on the stack and its active state is `"I"`. The engine now waits for a signal.
2. When a signal `s` arrives, the engine searches for a matching transition, starting at the **head** of the stack (the innermost, currently active FA) and, if needed, continuing down through each ancestor FA towards the root:
   - **2.1** — If the head FA has a transition matching its own active state and `s` (including joker fallbacks, see chapter 1), that transition is applied directly: the head's active state becomes the transition's target. This step is logged with rule `"2.1"`.
   - **2.2** — If the head FA has *no* matching transition, the search continues in its parent FA, then that FA's parent, and so on down to the root.
     - **2.2.1** — If a matching transition is found in some ancestor FA, every FA above it on the stack is popped (they are abandoned mid-flight), that ancestor becomes the new head, and the transition is applied there. 
     - **2.2.2** — If **no** FA anywhere in the stack — from the head all the way down to the root — has a matching transition, **no log entry is created**, and the engine instead applies the `byMissingTransition` policy (`'error'` throws, `'log_warning'` warns and does nothing, `'ignore'` silently does nothing).
3. If the transition found in step 2 carries a command (its 4th element), the command is sent to the registered command receiver. 
4. If the transition's target state is itself the name of a sub-FA, that sub-FA is pushed onto the stack with active state `"*.I"`, and the very same signal `s` is immediately forwarded into it, restarting this whole process (step 2) one level deeper.
5. If the transition's target state is an exit state (starts with `"E_"`):
   - **5.1** — if the current FA is the only one left on the stack (the root), it simply resets its own active state back to `"I"`;
   - **5.2** — otherwise, the current FA is popped off the stack, and the very same signal `s` is forwarded to the FA that is now the head, restarting this whole process (step 2) one level up.

The engine logs every step of this process.

The example of using the SFSM engine can be found in [Sfsm.log.test.ts](../../ts-stop/test/sfsm/Sfsm.log.test.ts).

## 3.2 Signal Senders, Command Receivers, Controllers, and the Transceiver Hub

Everything so far has driven the `Sfsm` engine directly, by calling `receiveSignal()` from test code. In a real application, signals come from real devices — a coin slot, a push sensor, a button — and commands need to reach real devices too — a lock, a light, a dispenser. The library gives you three small building blocks to wire this up cleanly:

- **`ISignalSender`** — an interface, that needs to emit signals from some object into the SFSM.
- **`ICommandReceiver`** — an interface that needs to react to commands coming *from* the SFSM.
- **`ITransceiver`** — (also often named as the **Bidirectional Protocol Transceiver**  is the class that can wire many signal senders and/or command receivers together in one unit. It is useful in special cases, when some object should play the role of both an `ISignalSender` and an `ICommandReceiver` for the SFSM.
- **`TransceiverHub`** — the wiring hub that connects every signal sender and command receiver  to one `Sfsm` instance.

In most cases it is still "invisible" for the user, because it is created and called inside the function `wireSfsm`.

Here is a minimal physical turnstile "gate" Transceiver — it plays both roles at once, exactly like the real simulators used elsewhere in this library's own test suite:

```typescript

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
```

It can be tested like this:

```typescript
...
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
```        

Notice that `TurnstileGate` never touches the `Sfsm` instance directly: it only knows how to emit its own signals and react to its own commands. All the wiring — "which signal sender sends which signal," "which command receiver handles which command" — lives in one place, the `TransceiverHub`, which also gives you `getRegisteredSignals()` / `getRegisteredCommands()` for diagnostics (e.g. to validate that every signal and command mentioned in an FA definition actually has a Transceiver behind it).

A runnable version of this example is available as a unit test: [3-2-signal-senders-etc.test.tss](../../ts-stop/test/sfsm/tutorial/3-2-signal-senders-etc.test.ts).

## 3.3 Name conventions

Every example so far has named the entry state simply `"I"` and exit states `"E_something"` — perfectly fine for a small, self-contained FA.

For larger SFSMs, it is recommended to namespace state names with their own FA's name, using a dot: `<FaName>:I` for the entry state, and `<FaName>:<state>` for ordinary states — e.g. `TS:I`, `TS:L`, `TS:U` instead of bare `I`, `L`, `U`. Exit states keep their familiar `E_` marker but move it after the FA-name dot: `<FaName>:E_<name>` — e.g. `TS:E_ok` instead of bare `E_ok`.

By signals it is recommended to use the same convention: `<FaName>><signal>` — e.g. `TS>coin`, `TS>push` instead of bare `coin`, `push`.

By commands it is recommended to use the same convention: `<FaName>.<command>` — e.g. `TS.lock`, `TS.unlock` instead of bare `lock`, `unlock`.

```json
{
  "TS": [
    ["TS:I", "TS>start",   "TS:L", "TS.lock"],
    ["TS:L", "TS>coin", "TS:U"],
    ["TS:U", "TS>push", "TS:L"]
  ]
}
```

A runnable version of this example, built entirely with namespaced names, is available as a unit test: [3-3-namespaced-state-names.test.ts](../../ts-stop/test/sfsm/tutorial/3-3-namespaced-state-names.test.ts).

In future chapters will be expanded with more advanced topics, including description of tools and best practices for building large SFSMs. 