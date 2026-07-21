# StOP Tutorial

## 1. What is a Finite Automaton?

Mountains of scientific and educational books and articles have been written about finite automata, which manage in an amazing way to not only confuse the reader, but also to frighten practitioners away from using them.

However, the basic idea of a finite automaton is as simple as it is fundamental. Namely:

We have:
- **A finite set of states** in which some object can exist, one of which is the initial state
- **A finite number of signals** that can be sent to this object and possibly lead to a change in its state, i.e., a transition from the current state to another

All the magic of finite automata is based on this simple idea.

To define a specific finite automaton, you need to specify a list of its states (States S), signals (Signals G), and transitions (Transitions T) in the form of a list of triples:

`<s0, g, s1>`, where:
- `s0` - the state in which the automaton is currently located (initially - the starting state)
- `g` - the signal
- `s1` - the state to which our object will transition after receiving the signal

Of course, we don't need states in S and signals in G that are not represented in T in any way. For practical use, some other constraints are also important, but we won't delve into the depths of theory for now, and will move on to a concrete programming example.

Let's examine the use of a finite automaton (FA) using the example of a very simple automaton - a primitive turnstile that lets someone into the metro or a paid restroom after they drop a coin or special token into its slot.

Like this:

![Turnstile](../images/Turnstile-img.png)

This automaton has two states: **locked** and **unlocked**, and two signals: **coin received** (coin) and **person passed through** (push).

## 2. Defining the turnstile with the StOP library

The TypeScript StOP library (https://github.com/vsirotin/StOP) processes finite automata with the `Sfsm` engine (available from the `@vsirotin/ts-stop` package, sub-path `sfsm`). An FA is described as a plain list of transitions, each one a triple (or, when a command must be sent, a quadruple — covered in a later chapter):

```
[s0, g, s1]
```

which is a direct, literal translation of the `<s0, g, s1>` triples introduced above. This representation is convenient when a FA is small — for large, dense automata you may prefer other representations, but that is out of scope here.

One detail of the `Sfsm` engine is important to know from the very first example: every FA always starts in a reserved entry state named `"I"`. This is not part of the pure theory above — it is a small, deliberate engine convention that becomes very useful once FAs are combined into hierarchies (a topic of a later chapter). For now, it simply means our turnstile needs one extra transition out of `"I"` into its real initial state, triggered by an explicit "start" signal.

Here is the complete turnstile FA, written as compact JSON:

```json
{
  "Turnstile": [
    ["I",       "start", "locked"],
    ["locked",  "coin",  "unlocked"],
    ["unlocked","push",  "locked"]
  ]
}
```

And here is how it is loaded and driven with the `Sfsm` class:

```typescript
import { Sfsm, FaDefinition } from '@vsirotin/ts-stop/sfsm';
import turnstileFa from './turnstile-fa.json';

const sfsm = new Sfsm();
sfsm.loadFA(turnstileFa as FaDefinition);

sfsm.getHeadState();          // 'I'  — the reserved entry state

sfsm.receiveSignal('start');
sfsm.getHeadState();          // 'locked'

sfsm.receiveSignal('coin');
sfsm.getHeadState();          // 'unlocked'

sfsm.receiveSignal('push');
sfsm.getHeadState();          // 'locked'
```

A runnable version of this exact example is available as a unit test: [01-what-is-a-finite-automaton.test.ts](../../ts/ts-stop/test/sfsm/tutorial/01-what-is-a-finite-automaton.test.ts).

### 2.1 A type-safe alternative

The plain-string form above is convenient, but nothing stops a typo like `"lokced"` from silently compiling — the `Transition` type accepts any string in each slot. If you would rather have the TypeScript compiler catch such typos, declare your states and signals as string-literal union types first, and write the transition list against them with a small generic helper:

```typescript
import { Sfsm, FaDefinition, Transition } from '@vsirotin/ts-stop/sfsm';

type TurnstileState = 'I' | 'locked' | 'unlocked';
type TurnstileSignal = 'start' | 'coin' | 'push';

// A transition restricted to a specific pair of state/signal literal types.
type TypedTransition<S extends string, G extends string> = [S, G, S];

// Accepts only transitions built from S/G, returns the plain runtime Transition[]
// that Sfsm actually consumes — no change to the library's runtime format.
function typedTransitions<S extends string, G extends string>(
    transitions: Array<TypedTransition<S, G>>
): Transition[] {
    return transitions;
}

const turnstileTransitions = typedTransitions<TurnstileState, TurnstileSignal>([
    ['I',        'start', 'locked'],
    ['locked',   'coin',  'unlocked'],
    ['unlocked', 'push',  'locked'],
    // ['locked', 'coin', 'lokced'],   // ✗ compile error: 'lokced' is not TurnstileState
]);

const turnstileFa: FaDefinition = { Turnstile: turnstileTransitions };

const sfsm = new Sfsm();
sfsm.loadFA(turnstileFa);
```

This costs nothing at runtime — `typedTransitions()` just returns its argument — but any misspelled state or signal name is now a compile-time error instead of a silent bug. A runnable version of this example is available as a unit test: [02-type-safe-fa-definition.test.ts](../../ts/ts-stop/test/sfsm/tutorial/02-type-safe-fa-definition.test.ts).

"But wait," an experienced programmer will say, looking at this example, "these are just text strings, not objects. An object should be able to do something and have its own attributes!"

That is exactly right, and it is exactly what the SFSM engine is built for: a real turnstile does not just sit there with a state name, it sends commands to real devices (a lock, a coin checker, a change dispenser...) and reacts to signals coming from them. The next chapters build up to that full picture step by step.

## 3. Jokers: wildcard signals and states

Writing out every single `<s0, g, s1>` transition by hand works well for a tidy, well-behaved automaton like our turnstile. Real devices, however, are messier: they can receive signals nobody planned for, and they can be told to do the same thing no matter what they happen to be doing at the time. Enumerating every combination by hand would make the transition list explode and, worse, would be all too easy to forget a case.

For this, the `Sfsm` engine supports **jokers** — a reserved value (`"*"` by default) that can stand in for "any signal" or "any state" in a transition:

- A **joker-signal** transition `[s0, "*", s1]` matches *any* signal while the automaton is in state `s0` — but only as a fallback: if a transition for the exact, literal signal already exists for `s0`, that one wins.
- A **joker-state** transition `["*", g, s1]` matches signal `g` from *any* current state — again only as a fallback, behind any transition that names the exact, literal state.

Because jokers are only a fallback, you can freely mix them with ordinary transitions without worrying about ordering: an exact match always takes priority, so the recommendation is simply to place joker transitions last in the list, purely for readability.

Jokers are configured through `SfsmOptions` when constructing the engine:

```typescript
const sfsm = new Sfsm({
  jokerSignal: '*', // default — the value that means "any signal"
  jokerState:  '*'  // default — the value that means "any state"
});
```

You will rarely need to change these from the default `"*"`; the option exists mainly so you can pick a different symbol if `"*"` ever needs to be a real state or signal name in your own FA.

### 3.1 Joker signal: reacting to the unexpected (e.g. a power failure)

Imagine our turnstile's electronics can, at any moment, receive all sorts of diagnostic signals from its sensors — most of which are irrelevant, except that *any* signal that isn't part of its normal vocabulary (`coin`, `push`) should be treated as a sign that something is wrong (power dropping out, a sensor glitching, a cable disconnected...) and the safest reaction is to shut the turnstile down into a safe `off` state.

Instead of trying to list every possible malfunction signal, one joker-signal transition per operational state covers all of them at once:

```json
{
  "Turnstile": [
    ["I",        "start", "locked"],
    ["locked",   "coin",  "unlocked"],
    ["unlocked", "push",  "locked"],
    ["locked",   "*",     "off"],
    ["unlocked", "*",     "off"]
  ]
}
```

```typescript
import { Sfsm, FaDefinition } from '@vsirotin/ts-stop/sfsm';

const sfsm = new Sfsm();
sfsm.loadFA(turnstileWithJokerSignalFa as FaDefinition);

sfsm.receiveSignal('start');
sfsm.getHeadState();             // 'locked'

sfsm.receiveSignal('coin');
sfsm.getHeadState();             // 'unlocked'  (exact transition still wins)

sfsm.receiveSignal('powerFailure');
sfsm.getHeadState();             // 'off'       (joker-signal fallback)
```

The turnstile keeps behaving exactly as before for `coin` and `push`; only signals it has no explicit rule for fall through to `*` and trigger the safety shutdown.

A runnable version of this example is available as a unit test: [03-joker-signal.test.ts](../../ts/ts-stop/test/sfsm/tutorial/03-joker-signal.test.ts).

### 3.2 Joker state: a universal signal for technical personnel

Now imagine the opposite situation: a maintenance technician needs to send a `service` signal that must always work, no matter what the turnstile happens to be doing — locked, unlocked, mid-transaction, or even already `off`. The technician should not need to know (or care) about the turnstile's current state; they just need "put this thing into maintenance mode, now."

A single joker-state transition expresses exactly that, regardless of how many operational states the FA has:

```json
{
  "Turnstile": [
    ["I",        "start",   "locked"],
    ["locked",   "coin",    "unlocked"],
    ["unlocked", "push",    "locked"],
    ["*",        "service", "maintenance"]
  ]
}
```

```typescript
import { Sfsm, FaDefinition } from '@vsirotin/ts-stop/sfsm';

const sfsm = new Sfsm();
sfsm.loadFA(turnstileWithJokerStateFa as FaDefinition);

sfsm.receiveSignal('start');
sfsm.receiveSignal('service');
sfsm.getHeadState();             // 'maintenance' — reached straight from 'locked'

// ...and it works the same from any other state:
sfsm.loadFA(turnstileWithJokerStateFa as FaDefinition);
sfsm.receiveSignal('start');
sfsm.receiveSignal('coin');      // now 'unlocked'
sfsm.receiveSignal('service');
sfsm.getHeadState();             // 'maintenance' — reached just as easily from 'unlocked'
```

One transition now covers "enter maintenance mode" from every current and future state — including states added to the FA later, with no changes needed to the `service` rule itself.

A runnable version of this example is available as a unit test: [03-joker-state.test.ts](../../ts/ts-stop/test/sfsm/tutorial/03-joker-state.test.ts).

## 4. What is a Stacked Finite State Machine (SFSM)?

The turnstile so far is a single, flat automaton — a nice fit for the pure theory from chapter 1. Real systems, however, are rarely that simple: a "check the coin" step is itself a small process with its own states, and a "process a payment" step might contain both "check a coin" and "check a banknote" as alternatives inside it. Modelling all of that as one giant flat FA would quickly become unreadable.

The **Stacked Finite State Machine (SFSM)** solves this by allowing a state to be, itself, another whole FA. This turns the picture from a single flat automaton into a **tree of FAs**: a root FA at the top, and any number of nested child FAs underneath it (each of which can itself have children, and so on). The SFSM engine (the `Sfsm` class) keeps an internal **stack** of currently-active FAs to process this tree: the bottom of the stack is always the root FA, and the top (the "head") is whichever FA is currently handling incoming signals. The stack grows (push) when a state turns out to be a sub-FA, and shrinks (pop) when a sub-FA finishes and control returns to its parent.

Two small naming conventions make this hierarchy work uniformly for every FA, at any depth:
- every FA has exactly one **entry state**, always named `"I"` (as already seen in chapters 1–3);
- every FA has one or more **exit states**, each named starting with `"E_"` — reaching one means "this FA is done, hand control back to whoever activated it."

Here is a small, self-contained FA that only makes sense as a *child* of something bigger: it models checking a banknote offered as payment, without yet worrying about who offers it or what happens afterwards. It has one entry state, one "business" state per step, and three possible outcomes:

```json
{
  "BPP": [
    ["I",        "BR.bc",           "checking",  "BC.check"],
    ["checking", "BC.pass",         "accepting", "BA.accept"],
    ["checking", "BC.reject",       "E_rejected"],
    ["accepting","BA.changeNeeded", "E_changeNeeded"],
    ["accepting","BA.noChangeNeeded","E_noChangeNeeded"]
  ]
}
```

Read on its own (as the root FA of its own tiny `Sfsm` instance), reaching any of its three `E_...` states simply resets it back to `"I"`, ready for the next banknote — rule 4.1 in the next chapter explains exactly why. Its real purpose, though, is to later become a *state* inside a bigger turnstile FA, at which point reaching an exit state pops it and hands the triggering signal back to its parent instead of resetting. Chapter 7 revisits this exact FA and promotes an ordinary state into a sub-FA like this one, live, via an update.

A runnable version of this example is available as a unit test: [04-stacked-finite-state-machine.test.ts](../../ts/ts-stop/test/sfsm/tutorial/04-stacked-finite-state-machine.test.ts).

## 5. How stacked states are processed

Once an FA can contain other FAs, "processing a signal" needs a precise algorithm — not just "look up the transition," but also "where do I look, and what happens once I find (or fail to find) one." Here are the rules the `Sfsm` engine actually implements (verified directly against its source, `Sfsm.ts`):

1. After `loadFA()`, the root FA is the only element on the stack and its active state is `"I"`. The engine now waits for a signal.
2. When a signal `s` arrives, the engine searches for a matching transition, starting at the **head** of the stack (the innermost, currently active FA) and, if needed, continuing down through each ancestor FA towards the root:
   - **2.1** — If the head FA has a transition matching its own active state and `s` (including joker fallbacks, see chapter 3), that transition is applied directly: the head's active state becomes the transition's target. This step is logged with rule `"2.1"`.
   - **2.2** — If the head FA has *no* matching transition, the search continues in its parent FA, then that FA's parent, and so on down to the root.
     - **2.2.1** — If a matching transition is found in some ancestor FA, every FA above it on the stack is popped (they are abandoned mid-flight), that ancestor becomes the new head, and the transition is applied there. This step is logged with rule `"2.2.2.1"`.
     - **2.2.2** — If **no** FA anywhere in the stack — from the head all the way down to the root — has a matching transition, **no log entry is created**, and the engine instead applies the `byMissingTransition` policy (`'error'` throws, `'log_warning'` warns and does nothing, `'ignore'` silently does nothing).
3. If the transition found in step 2 carries a command (its 4th element), the command is sent to the registered command receiver. If the command name ends in `$`, the signal's data is copied onto the command; otherwise the command is sent without data, even if the signal carried some. If the command expects data (`$`-suffixed) but the signal carried none, the `byMissingData` policy applies.
4. If the transition's target state is itself the name of a sub-FA, that sub-FA is pushed onto the stack with active state `"I"`, and the very same signal `s` is immediately forwarded into it, restarting this whole process (step 2) one level deeper.
5. If the transition's target state is an exit state (starts with `"E_"`):
   - **5.1** — if the current FA is the only one left on the stack (the root), it simply resets its own active state back to `"I"`;
   - **5.2** — otherwise, the current FA is popped off the stack, and the very same signal `s` is forwarded to the FA that is now the head, restarting this whole process (step 2) one level up.

> The previous version of this document (`Z_06-StOP-SFSM-Definition.md`) described step 2.2.2 differently ("if the current FA is at the head of the stack..."), which does not match the engine: the missing-transition policy only ever triggers after the *entire* stack, from head to root, has been searched without success — not merely because the search started at the head.

These rules are already exercised in depth by the library's own test suite — no new tutorial-only test was needed:
- bubbling up to an ancestor FA (rule 2.2.1 / `"2.2.2.1"`) and staying in the head FA (rule 2.1 / `"2.1"`) are both verified in the *"SFSM – Stack inspection"* and *"SFSM – Log correctness"* suites of [Sfsm.test.ts](../../ts/ts-stop/test/sfsm/Sfsm.test.ts);
- the `byMissingTransition` policies (`'ignore'`, `'log_warning'`, `'error'`) are verified in the *"SFSM – Policy: byMissingTransition"* suite of the same file;
- the full step-by-step log shape (including the `rule` field) is verified in [Sfsm.log.test.ts](../../ts/ts-stop/test/sfsm/Sfsm.log.test.ts).

## 6. Signal Senders, Command Receivers, Controllers, and the Controller Hub

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

A runnable version of this example is available as a unit test: [06-controllers-and-controller-hub.test.ts](../../ts/ts-stop/test/sfsm/tutorial/06-controllers-and-controller-hub.test.ts).

## 7. Utilities

Beyond the core `Sfsm` engine, the library ships a handful of utilities for working with FA definitions themselves.

### 7.1 Extended vs. compact format, and `reduceFA`

Every example so far has used the **compact** (runtime) format: a plain list of `[from, signal, to]` / `[from, signal, to, command]` tuples. For larger FAs, an **extended** (declaration) format is available where every state, signal, and command can carry a human-readable `name`/`description`, and a `sender`/`receiver` — much more pleasant to read and maintain by hand, and to auto-generate documentation from.

The `reduceFA()` function converts an extended definition into the flat compact form that `Sfsm.loadFA()` actually consumes internally:

```typescript
import { reduceFA, FaDefinition } from '@vsirotin/ts-stop/sfsm';

const compact = reduceFA(extendedTurnstileFa as FaDefinition);
```

Passing an already-compact definition through `reduceFA()` returns it unchanged, so it is always safe to call.

### 7.2 The multi-FA compact format

Once an FA has children, the compact format lists **every** FA (root and all descendants) as separate top-level keys of the same object — the parent's `ts` list simply refers to a child by name as a transition target, exactly like `CoinCheck` in the example below. The root FA is auto-detected as whichever key is never referenced as a target (3rd element) in any FA's transitions. Both this format and a single flat FA are accepted by `loadFA()` without any change to the calling code.

### 7.3 `updateCompactFA` / `updateFullFA` — evolving an FA definition without rewriting it

`updateCompactFA()` (and its extended-format counterpart `updateFullFA()`) apply a small, structured `FaUpdate` descriptor — `{ remove?: string[], add?: Record<string, ...> }` — to an existing FA definition and return a new one, without mutating the source. This is the mechanism the CLI tools `update-compact-fa` / `update-full-fa` use under the hood.

A particularly useful pattern: **turning a plain leaf state into a sub-FA**, so a device's behaviour becomes more detailed over time without touching the rest of the definition. Suppose our turnstile starts out trusting any coin unconditionally:

```json
{
  "Turnstile": [
    ["I",        "start", "locked"],
    ["locked",   "coin",  "unlocked"],
    ["unlocked", "push",  "locked"]
  ]
}
```

Later, we decide coins should actually be validated before unlocking. Instead of hand-editing this list, we describe the change as an update that (a) adds a new `CoinCheck` sub-FA, and (b) replaces the root so that `"coin"` now leads into it instead of straight to `"unlocked"`:

```typescript
import { updateCompactFA, FaDefinition, FaUpdate } from '@vsirotin/ts-stop/sfsm';

const update: FaUpdate = {
  add: {
    Turnstile: [
      ["I",          "start",  "locked"],
      ["locked",     "coin",   "CoinCheck"],
      ["CoinCheck",  "CC.ok",  "unlocked"],
      ["CoinCheck",  "CC.bad", "locked"],
      ["unlocked",   "push",   "locked"]
    ],
    CoinCheck: [
      ["I",        "coin",   "checking"],
      ["checking", "CC.ok",  "E_ok"],
      ["checking", "CC.bad", "E_bad"]
    ]
  }
};

const detailedTurnstileFa = updateCompactFA(simpleTurnstileFa as FaDefinition, update);
```

`simpleTurnstileFa` is untouched; `detailedTurnstileFa` now behaves exactly like the original for `start`/`push`, but pushes `CoinCheck` onto the stack on `"coin"` (rule 4 from the previous chapter) and only reaches `"unlocked"` once a `CC.ok` signal arrives — otherwise it falls back to `"locked"` on `CC.bad`. No existing consumer of the FA (nor the SFSM engine itself) needs to change for this to work.

A runnable version of this example is available as a unit test: [07-update-fa-add-detail.test.ts](../../ts/ts-stop/test/sfsm/tutorial/07-update-fa-add-detail.test.ts). The full behaviour of `updateCompactFA` / `updateFullFA` (removing FAs, replacing existing ones, pruning dangling transitions, non-mutation of the source) is covered by [FaUpdater.test.ts](../../ts/ts-stop/test/sfsm/FaUpdater.test.ts).

### 7.4 Loading FA definitions from files and URLs

Two small helpers load a `FaDefinition` from outside the source code, so FA JSON files can live alongside the code that uses them (or be served remotely) instead of being inlined:

```typescript
import { Sfsm, loadFAFromFile, FaDefinition } from '@vsirotin/ts-stop/sfsm';

const sfsm = new Sfsm({ byMissingTransition: 'error' });
sfsm.loadFA(loadFAFromFile('./turnstile-fa.json'));   // Node.js only (uses fs)
```

```typescript
import { Sfsm, loadFAFromURL, FaDefinition } from '@vsirotin/ts-stop/sfsm';

const sfsm = new Sfsm({ byMissingTransition: 'error' });
sfsm.loadFA(await loadFAFromURL('https://example.com/turnstile-fa.json'));  // browser & Node.js ≥ 18
```

Both accept extended or compact JSON and throw on a failed read/fetch or invalid JSON. Their full behaviour is covered by [FaLoader.test.ts](../../ts/ts-stop/test/sfsm/FaLoader.test.ts).

### 7.5 CLI tools

For one-off conversions without writing any code, the package ships two npm scripts (run from `ts/ts-stop`, after `npm run build`):

```bash
# Extended → compact
npm run reduce-fa -- test/sfsm/test-data/turnstile-fa.json
# writes test/sfsm/test-data/turnstile-fa-compact.json

# Apply a FaUpdate file to a compact (or extended) FA file
npm run update-compact-fa -- --source=<path> --update=<path> [--result=<path>]
npm run update-full-fa    -- --source=<path> --update=<path> [--result=<path>]
```

`--result` defaults to `<source-basename>-updated.json` when omitted. Both CLI scripts are thin wrappers around `reduceFA()` and `updateCompactFA()` / `updateFullFA()`, whose behaviour is covered by [FaReducer.test.ts](../../ts/ts-stop/test/sfsm/FaReducer.test.ts) and [FaUpdater.test.ts](../../ts/ts-stop/test/sfsm/FaUpdater.test.ts).
