# StOP Tutorial. Chapter 3: Advanced Themes

## 3.1 How stacked states are processed

Once an FA can contain other FAs, "processing a signal" needs a precise algorithm — not just "look up the transition," but also "where do I look, and what happens once I find (or fail to find) one." Here are the rules the `Sfsm` engine actually implements (verified directly against its source, `Sfsm.ts`):

1. After `loadFA()`, the root FA is the only element on the stack and its active state is `"I"`. The engine now waits for a signal.
2. When a signal `s` arrives, the engine searches for a matching transition, starting at the **head** of the stack (the innermost, currently active FA) and, if needed, continuing down through each ancestor FA towards the root:
   - **2.1** — If the head FA has a transition matching its own active state and `s` (including joker fallbacks, see chapter 1 §1.3), that transition is applied directly: the head's active state becomes the transition's target. This step is logged with rule `"2.1"`.
   - **2.2** — If the head FA has *no* matching transition, the search continues in its parent FA, then that FA's parent, and so on down to the root.
     - **2.2.1** — If a matching transition is found in some ancestor FA, every FA above it on the stack is popped (they are abandoned mid-flight), that ancestor becomes the new head, and the transition is applied there. 
     - **2.2.2** — If **no** FA anywhere in the stack — from the head all the way down to the root — has a matching transition, **no log entry is created**, and the engine instead applies the `byMissingTransition` policy (`'error'` throws, `'log_warning'` warns and does nothing, `'ignore'` silently does nothing).
3. If the transition found in step 2 carries a command (its 4th element), the command is sent to the registered command receiver. 
4. If the transition's target state is itself the name of a sub-FA, that sub-FA is pushed onto the stack with active state `"I"`, and the very same signal `s` is immediately forwarded into it, restarting this whole process (step 2) one level deeper.
5. If the transition's target state is an exit state (starts with `"E_"`):
   - **5.1** — if the current FA is the only one left on the stack (the root), it simply resets its own active state back to `"I"`;
   - **5.2** — otherwise, the current FA is popped off the stack, and the very same signal `s` is forwarded to the FA that is now the head, restarting this whole process (step 2) one level up.


The example of using the SFSM engine can be found in [Sfsm.log.test.ts](../../ts-stop/test/sfsm/Sfsm.log.test.ts).

## 3.2 Signal Senders, Command Receivers, Controllers, and the Controller Hub

Everything so far has driven the `Sfsm` engine directly, by calling `receiveSignal()` from test code. In a real application, signals come from real devices — a coin slot, a push sensor, a button — and commands need to reach real devices too — a lock, a light, a dispenser. The library gives you three small building blocks to wire this up cleanly:

- **`SignalSender`** — an abstract base class you extend on any component that needs to emit signals into the SFSM. You implement `getSignalNames()` (the list of signal names it may ever send) and call the protected `sendSignal(name, data?)` method whenever something happens in the real world.
- **`CommandReceiver`** — an abstract base class (or, if a class already extends something else, the `ICommandReceiver` interface it mirrors) for any component that needs to react to commands coming *from* the SFSM. You implement `getCommandNames()` (the commands it can handle) and `receiveCommand(command, data?)`.
- **Controller** — not a class, but a *role*: any component that plays the `SignalSender` role, the `CommandReceiver` role, or (as most real devices do) both at once, is called a Controller.
- **`ControllerHub`** — the wiring hub that connects every Controller to one `Sfsm` instance. You register each Controller once with `registerSignalSender()` and/or `registerCommandReceiver()`, then call `connectTo(sfsm)`. From then on, the hub automatically routes every command the SFSM sends to the right Controller (by the exact command name), and forwards every signal a Controller sends into the SFSM.

Here is a minimal physical turnstile "gate" Controller — it plays both roles at once, exactly like the real simulators used elsewhere in this library's own test suite:

```typescript
import { Sfsm, FaDefinition, SignalSender, ICommandReceiver, ControllerHub } from '@vsirotin/ts-stop/sfsm';

class TurnstileGate extends SignalSender implements ICommandReceiver {
    private locked = true;

    getSignalNames(): readonly string[] { return ['start', 'coin', 'push']; }
    getCommandNames(): readonly string[] { return ['GATE.lock', 'GATE.unlock']; }

    receiveCommand(command: string): void {
        this.locked = command === 'GATE.lock';
    }

    isLocked(): boolean { return this.locked; }

    start(): void       { this.sendSignal('start'); }
    insertCoin(): void  { this.sendSignal('coin'); }
    walkThrough(): void { this.sendSignal('push'); }
}

const turnstileFa: FaDefinition = {
    Turnstile: [
        ['I',        'start', 'locked'],
        ['locked',   'coin',  'unlocked', 'GATE.unlock'],
        ['unlocked', 'push',  'locked',   'GATE.lock']
    ]
};

const sfsm = new Sfsm();
const gate = new TurnstileGate();

new ControllerHub()
    .registerSignalSender(gate)
    .registerCommandReceiver(gate)
    .connectTo(sfsm);

sfsm.loadFA(turnstileFa);

gate.start();
gate.insertCoin();
gate.isLocked();      // false — the SFSM sent 'GATE.unlock' in response to 'coin'

gate.walkThrough();
gate.isLocked();      // true  — the SFSM sent 'GATE.lock' in response to 'push'
```

Notice that `TurnstileGate` never touches the `Sfsm` instance directly: it only knows how to emit its own signals and react to its own commands. All the wiring — "which Controller sends which signal," "which Controller handles which command" — lives in one place, the `ControllerHub`, which also gives you `getRegisteredSignals()` / `getRegisteredCommands()` for diagnostics (e.g. to validate that every signal and command mentioned in an FA definition actually has a Controller behind it).

A runnable version of this example is available as a unit test: [3-2-controllers-and-controller-hub.test.ts](../../ts-stop/test/sfsm/tutorial/3-2-controllers-and-controller-hub.test.ts).

## 3.3 Name conventions

Every example so far has named the entry state simply `"I"` and exit states `"E_something"` — perfectly fine for a small, self-contained FA. Once a stacked SFSM grows to dozens of FAs, plain abbreviations like `"TS:Locked"`, `"TS:Unlocked"`, `"I"`, `"E_R"` start colliding in your head across FAs, and it becomes hard to tell, just by looking at a state name, *which* FA it belongs to.

For larger SFSMs, it is recommended to namespace state names with their own FA's name, using a dot: `<FaName>.I` for the entry state, and `<FaName>.<state>` for ordinary states — e.g. `TS.I`, `TS.L`, `TS.U` instead of bare `I`, `L`, `U`. Exit states keep their familiar `E_` marker but move it after the FA-name dot: `<FaName>.E_<name>` — e.g. `TS.E_ok` instead of bare `E_ok`.

```json
{
  "TS": [
    ["TS.I", "TS>start",   "TS.L"],
    ["TS.L", "TS.coin", "TS.U"],
    ["TS.U", "TS.push", "TS.L"]
  ]
}
```

The `Sfsm` engine recognises **both** forms everywhere, automatically:
- an entry state is whatever from-state a FA's own transitions use that is exactly `"I"` **or** ends with `".I"`;
- an exit state is any target state that starts with `"E_"` **or** contains `".E_"`.

This means:
- every FA fixture used earlier in this tutorial (bare `"I"` / `"E_..."`) keeps working exactly as written — no migration is required;
- you can freely mix both styles across FAs in the same SFSM (e.g. namespace only the FAs that are large enough to benefit from it);
- nothing else changes — this is purely a naming convention for readability, not a new engine feature: no new `SfsmOptions`, no change to how transitions, pushes, pops, or jokers are matched.

A runnable version of this example, built entirely with namespaced names, is available as a unit test: [3-3-namespaced-state-names.test.ts](../../ts-stop/test/sfsm/tutorial/3-3-namespaced-state-names.test.ts).

In future this chapter will be expanded with more advanced topics, including description of best practices for building large SFSMs, and a few more examples of real-world applications.