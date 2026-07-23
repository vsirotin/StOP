# StOP Tutorial. Part 2: Stacked Finite State Machines

## 4. What is a Stacked Finite State Machine (SFSM)?

The turnstile so far is a single, flat automaton — a nice fit for the pure theory from chapter 1. Real systems, however, are rarely that simple: a "check the coin" step is itself a small process with its own states, and a "process a payment" step might contain both "check a coin" and "check a banknote" as alternatives inside it. Modelling all of that as one giant flat FA would quickly become unreadable.

The **Stacked Finite State Machine (SFSM)** solves this by allowing a state to be, itself, another whole FA. This turns the picture from a single flat automaton into a **tree of FAs**: a root FA at the top, and any number of nested child FAs underneath it (each of which can itself have children, and so on). The SFSM engine (the `Sfsm` class) keeps an internal **stack** of currently-active FAs to process this tree: the bottom of the stack is always the root FA, and the top (the "head") is whichever FA is currently handling incoming signals. The stack grows (push) when a state turns out to be a sub-FA, and shrinks (pop) when a sub-FA finishes and control returns to its parent.

Two small naming conventions make this hierarchy work uniformly for every FA, at any depth:
- every FA has exactly one **entry state**, always named `"I"` or `"*.I"` (as already seen in chapters 1–3);
- every FA has one or more **exit states**, each named starting with `"E_"` or `"*-E_"` — reaching one means "this FA is done, hand control back to whoever activated it."

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

 Its real purpose, though, is to later become a *state* inside a bigger turnstile finite state machine (FSM), at which point reaching an exit state pops it and hands the triggering signal back to its parent instead of resetting. 

A runnable version of this example is available as a unit test: [04-stacked-finite-state-machine.test.ts](../../ts-stop/test/sfsm/tutorial/04-stacked-finite-state-machine.test.ts).



