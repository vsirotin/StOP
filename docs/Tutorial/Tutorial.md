# StOP Tutorial

## What is a Finite Automaton?

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

## Defining the turnstile with the StOP library

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

"But wait," an experienced programmer will say, looking at this example, "these are just text strings, not objects. An object should be able to do something and have its own attributes!"

That is exactly right, and it is exactly what the SFSM engine is built for: a real turnstile does not just sit there with a state name, it sends commands to real devices (a lock, a coin checker, a change dispenser...) and reacts to signals coming from them. The next chapters build up to that full picture step by step.
