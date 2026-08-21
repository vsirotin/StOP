# StOP Tutorial. Part 2: Stacked Finite State Machines

## 4. What is a Stacked Finite State Machine (SFSM)?

The turnstile from chapter 1 is a single, flat automaton — it accepts a coin and
unlocks immediately. Real turnstiles, however, don't trust coins blindly: they
*check* the coin first — its weight, its form — and only then unlock. That
checking process is itself a small state machine with its own states and
signals. Modelling it all as one giant flat FA would quickly become unreadable.

The **Stacked Finite State Machine (SFSM)** solves this by allowing a state to
be, itself, another whole FA. This turns the picture from a single flat
automaton into a **tree of FAs**: a root FA at the top, and any number of
nested child FAs underneath it (each of which can itself have children, and so
on). The SFSM engine (the `Sfsm` class) keeps an internal **stack** of
currently-active FAs to process this tree: the bottom of the stack is always
the root FA, and the top (the "head") is whichever FA is currently handling
incoming signals. The stack grows (push) when a state turns out to be a sub-FA,
and shrinks (pop) when a sub-FA finishes and control returns to its parent.

Two naming conventions make this hierarchy work uniformly for every FA, at any
depth:
- every FA has exactly one **entry state**, always named `"*.I"` (as already seen
  in chapter 1);
- every FA has one or more **exit states**, each named starting with `"E_"` —
  reaching one means "this FA is done, hand control back to whoever activated
  it."

## 4.1 Extending the turnstile with a CheckCoin sub-FA

Let's take the basic turnstile from chapter 1 and replace the direct
`locked → coin → unlocked` transition with a coin-checking step. Instead of
unlocking immediately, the turnstile now enters a `CheckCoin` sub-FA that
verifies the coin's **weight** and **form** in two separate steps. Only when
both checks pass does the child FA exit with `E_OK`, forwarding the `coin-ok`
signal back to the parent, which then unlocks.

Here is the complete stacked FA in compact JSON:

```json
{
  "Turnstile": [
    ["I",              "start",      "locked"],
    ["locked",         "coin",       "CheckCoin"],
    ["CheckCoin",      "coin-ok",    "unlocked", "unlock"],
    ["CheckCoin",      "weight-bad", "locked"],
    ["CheckCoin",      "form-bad",   "locked"],
    ["unlocked",       "push",       "locked"]
  ],
  "CheckCoin": [
    ["I",              "coin",       "checking-weight", "check-weight"],
    ["checking-weight","weight-ok",  "checking-form",   "check-form"],
    ["checking-form",  "coin-ok",    "E_OK"],
    ["checking-weight","weight-bad", "E_Rejected"],
    ["checking-form",  "form-bad",   "E_Rejected"]
  ]
}
```

Two things to notice:

1. **`CheckCoin` is both a state name and a top-level key.** The SFSM engine
   detects that `CheckCoin` is a sub-FA because it appears as a target state in
   `Turnstile`'s transitions *and* is itself a key in the definition. When the
   `locked → coin → CheckCoin` transition fires, the engine **pushes**
   `CheckCoin` onto the stack and **forwards** the `coin` signal into it.

2. **Exit states pop the stack and forward the triggering signal.** When
   `CheckCoin` reaches `E_OK` (triggered by `coin-ok`), the engine **pops**
   `CheckCoin` and **forwards** `coin-ok` to the parent `Turnstile`. The parent
   has a transition `["CheckCoin", "coin-ok", "unlocked", "unlock"]` that
   matches, so it unlocks. The same mechanism handles rejections: `E_Rejected`
   (triggered by `weight-bad` or `form-bad`) pops and forwards the signal to
   the parent, which returns to `locked`.

Here is how the stacked FA is loaded and driven:

```typescript
import { Sfsm, FaDefinition } from '@vsirotin/ts-stop/sfsm';

const sfsm = new Sfsm(turnstileWithCheckCoinFa);

sfsm.getHeadState();          // 'I'           (root entry state)
sfsm.getCurrentStack();       // ['Turnstile']

sfsm.receiveSignal('start');
sfsm.getHeadState();          // 'locked'
sfsm.getCurrentStack();       // ['Turnstile']

sfsm.receiveSignal('coin');   // pushes CheckCoin, forwards 'coin' into it
sfsm.getHeadState();          // 'checking-weight'
sfsm.getCurrentStack();       // ['Turnstile', 'CheckCoin']

sfsm.receiveSignal('weight-ok');
sfsm.getHeadState();          // 'checking-form'

sfsm.receiveSignal('coin-ok'); // CheckCoin reaches E_OK → pop, forward to parent
sfsm.getHeadState();          // 'unlocked'
sfsm.getCurrentStack();       // ['Turnstile']

sfsm.receiveSignal('push');
sfsm.getHeadState();          // 'locked'
```

A runnable version of this example is available as a unit test:
`2-1-1-stacked-finite-state-machine.test.ts`.