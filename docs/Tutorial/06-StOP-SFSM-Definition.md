# Stacked Finite State Machine. Definition

Stacked Finite State Machine (SFSM) is the control engine for management of complex systems with many components and their own behavior.

## Mental model of SFSM

The SFSM interacts with an "external world" that contains senders (generators) of signals and receivers of commands.
The SFSM receives signals from the external world, changes its internal state, and sends commands to the external world.
The SFSM processes (interprets) a Stacked Finite Automaton (referred to as FA throughout this document).
Each FA will be described with:
- set of states
- set of signals
- ordered list of transactions.

To make descriptions of concrete FAs more understandable for humans and AI agents, we will use abbreviations with the following conventions:
- to identify states, use one or two uppercased letter(s)
- to identify a signal, use one or two lowercased letter(s)
- to define a transition, use tuples <So, s, Sn> or <So, s, Sn, c>, where
- - So - old active state
- - s - signal
- - Sn - new active state
- - c - a command, that will be send by activation of new state.

Signals can be:
- simple (contains the name of the sender and the name of the signal)
- parameterized (contains the name of the sender, the name of the signal, and a data object).

Some states can send commands, if the corresponding transition has a 4th element.
There are two types of command:
- simple (contains the name of the receiver and the name of the command)
- parameterized (contains the name of the receiver, the name of the command, and data extracted from the signal by applying the transition).

Each FA have one and only one input (or entry) state, defined with letter I and one and only one end (or exit) state, started with "E_". 

FAs will be set as JSON-structures

## Simple example FA definition with JSON
Let us consider a simple FA that checks whether a banknote is acceptable for payment in a turnstile, and if so, whether change is needed.

Assume, that in "external world" works following devices:

- *Banknote Receiver* (BR), that can send the signal "BR.bc$" meaning "banknote candidate" (bc) with the artifact as data (suffix $).
- *Banknote Checker* (BC), that can receive the command "BC.c$" meaning "check" (c) with the artifact as data (suffix $), and send two signals to the FA:
  - "BC.p$" meaning "pass" (p) with the banknote as data
  - "BC.r$" meaning "reject" (r) with the banknote as data
- *Banknote Acceptor* (BA), that accepts a valid banknote via the command "BA.a$" meaning "accept" (a), and can send two signals:
  - "BA.c$" meaning change is needed (with the change value as data)
  - "BA.n" meaning change is not needed.

```json
{
    "BPP": [
        ["I", "BR.bc$", "C", "BC.c$"],
        ["C", "BC.p$", "A", "BA.a$"],
        ["C", "BC.r$", "E_R"],
        ["A", "BA.c$", "E_C"],
        ["A", "BA.n", "E_N"]
    ]
}

```

The FA definition contains its name (in the example above "BPP" - Banknote Payment Provider) and a list of transitions (JSON array in the body of the object). Some transitions are extended with an additional element — the command to be sent.

This definition says that FA BPP has internal states:
- I - Init
- C - Check
- A - Acceptance,
and exit states:
- E_R (banknote rejected)
- E_C (banknote accepted, change is needed)
- E_N (banknote accepted, change is not needed)

A state in an FA can itself be another FA.
This means that FAs can be imagined as a directed graph with one root. Relationships between FAs can be described as "parent-child" and "sibling".
There is a constraint: the Root FA and all its children (grandchildren, and so on, recursively) must form a hierarchy (tree).
To process this FA graph, the SFSM uses an internal *stack* of FAs. At startup, this stack contains one element — the Root FA as the head. The stack supports push(FA) and pop() operations following the FILO rule.

## Processing rules

SFSM process FA according following rules:

1. After start, the FA has active state I and waits for a signal.
2. When the FA has active state X and receives a signal s, it sequentially searches for the first transition in the list whose first two elements are X and s.
- 2.1 If a transition for the pair (X, s) is found, the new active state of the FA becomes the 3rd element of the transition. For example, if the current state is "I" and the signal is "BR.bc$", the new state will be "C".
- 2.1.1 If the found transition contains a command, the command is sent.
- 2.1.1.1 If the command expects data, the data is copied from the signal into the command.
- 2.1.1.1.1 If in this situation the signal carries no data, the behaviour of the SFSM depends on the configuration parameter `by_missing_data`.
- 2.2 If no transition for the pair (X, s) is found:
- 2.2.1 If the current FA is at the head of the SFSM stack, the behaviour of the SFSM depends on the configuration parameter `by_missing_transition`.
- 2.2.2 Otherwise, the search continues in the next FA in the stack, starting from the parent FA and going deeper up to the last (deepest) element in the stack.
- 2.2.2.1 If a matching transition is found in some FA, all FAs in the stack above that FA are popped, the found FA becomes the head, and rule 2.1 is applied.
3. When the new active state resulting from rule 2 is itself an FA (called the target FA), the target FA is pushed onto the stack. The previous FA moves to position 2 and the target FA becomes the head. The triggering signal is forwarded to the initial state of the target FA, and rule 2 is applied recursively.
4. When the new active state resulting from rule 2 is an exit state:
- 4.1. If the current FA is the only element on the stack (i.e., the Root FA), its initial state is reactivated and the FA waits for a new signal.
- 4.2. Otherwise, the current FA is popped from the stack, and the triggering signal is forwarded to the active state of the new head FA.


## FA definition format

The example above defines a FA in the compact or *runtime* format.
For better understanding by humans and AI agents, an extended or *declaration* format can be used, as shown in the example below.


## Complex example

### Realistic environment (the so-called "external world")

Let us extend the example above to a FA for a realistic turnstile.
Our "external world" is extended with the following devices:

- *Coin Receiver* (CR), that can send the signal "CR.cc$" meaning "coin candidate" (cc) with the artifact as data (suffix $).
- *Coin Checker* (CC), that can receive the command "CC.c$" meaning "check" (c) with the artifact as data (suffix $), and send two signals to the FA:
  - "CC.p$" meaning "pass" (p) with the coin as data
  - "CC.r$" meaning "reject" (r) with the coin as data
- *Coin Acceptor* (CA), that accepts a valid coin via the command "CA.a$" meaning "accept" (a), and can send two signals:
  - "CA.c$" meaning change is needed (with the change value as data)
  - "CA.n" meaning change is not needed.
- *Rejector*, that rejects invalid artifacts (coins or banknotes)
- *Changer*, that dispenses change
- *Turnstile*, that contains all previous devices and lets someone through after a valid coin or banknote is inserted.

### FA in extended format

```json
{
    "TS": {
        "states":{
            "PP": {
                "states":{
                    "BPP": {
                        "states":{
                            "C": {
                                "name": "Check of banknote",
                                "description": "Checks if a banknote is an official and can be used as payment element",
                            },
                            "A": {
                                "name": "Acceptance of banknote",
                                "description": "Accept a real banknote and save it in internal tresor",
                            },
                        },
                        "signals": {
                            "BR.bc$": {
                                "name": "Banknote candidate",
                                "description": "Some artifact is putted in banknote slot. This signal contains data with this artifact",
                                "sender": "Banknote Receiver",
                            },
                            "BC.p$": {
                                "name": "Banknote is ok",
                                "description": "Banknote checker send this signal, when banknote is checked and can be used as payment element. This signal contains data with this banknote",
                                "sender": "Banknote Checker",
                            },
                            "BC.r$": {
                                "name": "Banknote is not ok (rejected)",
                                "description": "Banknote checker send this signal, when banknote is checked and can't be used as payment element. This signal contains data with this banknote",
                                "sender": "Banknote Checker",
                            },
                            "BA.c$": {
                                "name": "Change is needed",
                                "description": "Banknote Acceptor sends this signal when the accepted banknote requires change. Data contains the change value.",
                                "sender": "Banknote Acceptor",
                            },
                            "BA.n": {
                                "name": "Change is not needed",
                                "description": "Banknote Acceptor sends this signal when the accepted banknote requires no change.",
                                "sender": "Banknote Acceptor",
                            },
                        },
                        "commands": {
                            "BC.c$": {
                                "name": "Check banknote",
                                "description": "Command to banknote checker with data with banknote for checking",
                                "receiver": "Banknote Checker",
                            },
                            "BA.a$": {
                                "name": "Accept banknote",
                                "description": "Command to banknote acceptor with data with banknote for acceptance",
                                "receiver": "Banknote Acceptor",
                            },
                        },
                        "ts": [
                            ["I", "BR.bc$", "C", "BC.c$"],
                            ["C", "BC.p$", "A", "BA.a$"],
                            ["C", "BC.r$", "E_R"],
                            ["A", "BA.c$", "E_C"],
                            ["A", "BA.n", "E_N"]
                        ]
                    },
                    "CPP": {
                        "states":{
                            "CW": {
                                "name": "Check of weight of coin",
                                "description": "Checks if a weight of a coin is in accepted interval",
                            },
                            "CF": {
                                "name": "Check of form of coin",
                                "description": "Checks if a form of coin is accepted",
                            },
                            "A": {
                                "name": "Aceceptance of coin",
                                "description": "Accept a real coin and save it in internal tresor",
                            },
                        },
                        "signals": {
                            "CR.cc$": {
                                "name": "Coin candidate",
                                "description": "Some artifact is putted in coin slot. This signal contains data with this artifact",
                                "sender": "Coin Receiver",
                            },
                            "CC.p$": {
                                "name": "Coin is ok",
                                "description": "Coin checker send this signal, when coin is checked and can be used as payment element. This signal contains data with this coin",
                                "sender": "Coin Checker",
                            },
                            "CC.r$": {
                                "name": "Coin is not ok (rejected)",
                                "description": "Coin checker send this signal, when coin is checked and can't be used as payment element. This signal contains data with this coin",
                                "sender": "Coin Checker",
                            },
                            "CA.c$": {
                                "name": "Change is needed",
                                "description": "Coin Acceptor sends this signal when the accepted coin requires change. Data contains the change value.",
                                "sender": "Coin Acceptor",
                            },
                            "CA.n": {
                                "name": "Change is not needed",
                                "description": "Coin Acceptor sends this signal when the accepted coin requires no change.",
                                "sender": "Coin Acceptor",
                            },
                        },
                        "commands": {
                            "CC.cw$": {
                                "name": "Check coin weight",
                                "description": "Command to Coin Checker to validate the weight of the coin candidate. Data contains the coin artifact.",
                                "receiver": "Coin Checker",
                            },
                            "CC.cf$": {
                                "name": "Check coin form",
                                "description": "Command to Coin Checker to validate the form/shape of the coin candidate. Data contains the coin artifact.",
                                "receiver": "Coin Checker",
                            },
                            "CA.a$": {
                                "name": "Accept coin",
                                "description": "Command to Coin Acceptor to accept the validated coin. Data contains the coin artifact.",
                                "receiver": "Coin Acceptor",
                            },
                        },
                        "ts": [
                            ["I", "CR.cc$", "CW", "CC.cw$"],
                            ["CW", "CC.p$", "CF", "CC.cf$"],
                            ["CF", "CC.p$", "A", "CA.a$"],
                            ["CW", "CC.r$", "E_R"],
                            ["CF", "CC.r$", "E_R"],
                            ["A", "CA.c$", "E_C"],
                            ["A", "CA.n", "E_N"]
                        ]
                    }
                },
                "RE": {
                    "name": "Rejection of artifact",
                    "description": "Rejection of false artifacts (coin or banknote) and send them to reject box"
                },
                "CH": {
                    "name": "Making change",
                    "description": "Making change by changer and send it to change box",
                },
                "commands": {
                    "CH.c$": {
                        "name": "Make change",
                        "description": "Command to the Changer to dispense change. Data contains the change amount copied from the triggering signal.",
                        "receiver": "Changer",
                    },
                },
                "signals":{
                    "RE.d": {
                        "name": "Rejection done",
                        "description": "Rejection of artifact is done. ",
                        "sender": "Rejector",
                    },
                    "CH.d": {
                        "name": "Change is done",
                        "description": "Making change is done. ",
                        "sender": "Changer",
                    },
                },
                "ts": [
                    ["I", "BR.bc$", "BPP"],
                    ["I", "CR.cc$", "CPP"],
                    ["BPP", "BC.r$", "RE"],
                    ["BPP", "BA.c$", "CH", "CH.c$"],
                    ["BPP", "BA.n", "E_N"],
                    ["CPP", "CC.r$", "RE"],
                    ["CPP", "CA.c$", "CH", "CH.c$"],
                    ["CPP", "CA.n", "E_P"],
                    ["RE", "RE.d", "E_R"],
                    ["CH", "CH.d", "E_P"]
                ],
            },
            "L": {
                "name": "Locked",
                "description": "Turnstile is locked and doesn't let someone into the metro or a paid restroom",
            },
            "U": {
                "name": "Unlocked",
                "description": "Turnstile is unlocked and let someone into the metro or a paid restroom",
            },
        },

        "signals": {
            "TS.s": {
                "name": "System start",
                "description": "SFSM initialization signal that transitions the turnstile into its initial Locked state.",
                "sender": "SFSM",
            },
            "TS.to": {
                "name": "Turnstile timeout",
                "description": "Turnstile is in unlocked state too long and should be locked",
                "sender": "Turnstile",
            },
            "TS.ps": {
                "name": "Passage",
                "description": "Someone pass through turnstile and it should be locked",
                "sender": "Turnstile",
            },
        }, 

        "commands": {
            "TS.l": {
                "name": "Lock turnstile",
                "description": "Command to turnstile to lock itself",
                "receiver": "Turnstile",
            },
            "TS.ut": {
                "name": "Unlock turnstile",
                "description": "Command to turnstile to unlock itself ans start a timeout for waiting of passage",
                "receiver": "Turnstile",
            },
        },

        "ts": [
            ["I", "TS.s", "L"],
            ["L", "BR.bc$", "PP"],
            ["L", "CR.cc$", "PP"],
            ["PP", "BA.n", "U", "TS.ut"],
            ["PP", "CA.n", "U", "TS.ut"],
            ["PP", "CH.d", "U", "TS.ut"],
            ["PP", "RE.d", "L", "TS.l"],
            ["U", "TS.to", "L", "TS.l"],
            ["U", "TS.ps", "L", "TS.l"]
        ]
    }
}
```

## TypeScript API

The SFSM engine is available as the `Sfsm` class in the `@vsirotin/ts-stop` package (sub-path `sfsm`).

### Interfaces

```typescript
/** Implement this on any external device that receives commands from the SFSM. */
interface ICommandReceiver {
    receiveCommand(command: string, data?: unknown): void;
}

/** Implement this on any object that accepts signals (the Sfsm class itself implements it). */
interface ISignalReceiver {
    receiveSignal(signal: string, data?: unknown): void;
}
```

### Configuration

```typescript
type MissingDataPolicy       = 'ignore' | 'log_warning' | 'error';
type MissingTransitionPolicy = 'ignore' | 'log_warning' | 'error';

interface SfsmOptions {
    /** Behaviour when a parameterised command is fired but the signal carries no data.
     *  Default: 'error'. */
    byMissingData?: MissingDataPolicy;

    /** Behaviour when no transition matches the (state, signal) pair at any stack level.
     *  Default: 'error'. */
    byMissingTransition?: MissingTransitionPolicy;
}
```

Policy values:

| Value | Behaviour |
|-------|-----------|
| `'ignore'` | The SFSM stays in its current state; processing continues silently. |
| `'log_warning'` | A `console.warn` message is emitted; the SFSM stays in its current state. |
| `'error'` | An `Error` is thrown and processing stops. |

### Sfsm class

```typescript
class Sfsm implements ISignalReceiver {

    constructor(options?: SfsmOptions)

    /** Register the single command receiver for this instance.
     *  All commands are dispatched to this object regardless of which FA fires them.
     *  Call before loadFA(). */
    setCommandReceiver(receiver: ICommandReceiver): void

    /** Parse the FA definition and initialise the engine.
     *  The root FA is pushed onto the stack with active state "I".
     *  Resets the log and clears any queued signals.
     *  No signal is sent automatically — the caller must send the first signal
     *  (e.g. "TS.s") to drive the machine out of state I. */
    loadFA(definition: FaDefinition): void

    /** Send a signal to the SFSM.
     *  Re-entrant: if called from within a command receiver callback the signal
     *  is queued and processed after the current step finishes (FIFO order).
     *  This preserves deterministic signal ordering without stack corruption. */
    receiveSignal(signal: string, data?: unknown): void

    /** Return a copy of the accumulated log entries (one per processed signal step). */
    getLog(): LogEntry[]

    /** Return the FA name stack, index 0 = bottom (root), last index = head. */
    getCurrentStack(): string[]

    /** Return the active state abbreviation of the head FA. */
    getHeadState(): string
}
```

### Typical usage

```typescript
import { Sfsm, FaDefinition } from '@vsirotin/ts-stop/sfsm';
import turnstileFa from './turnstile-fa.json';

const sfsm = new Sfsm({ byMissingTransition: 'error' });

// Wire the external world
sfsm.setCommandReceiver(myCommandRouter);

// Load the FA — engine is now at state I of the root FA
sfsm.loadFA(turnstileFa as FaDefinition);

// Drive the machine
sfsm.receiveSignal('TS.s');          // I → L
sfsm.receiveSignal('CR.cc$', { value: 2 });  // cascade through sub-FAs

console.log(sfsm.getHeadState());    // 'U'
console.log(sfsm.getLog());          // array of LogEntry
```


## Log format
Log format can be compact or extended depending on the format of the processed FA JSON (compact or extended).
Below is the list of log fields. Entries marked (e) are only present when the extended FA format is used.

| Field | Type | Description |
|-------|------|-------------|
| `step` | number | Step number, starts at 1. |
| `stack` | string[] | Ordered list of FA abbreviations in the stack at the moment the signal arrived (before any structural change). Index 0 = bottom (root), last = head. |
| `state` | string | Abbreviation of the active state of the head FA before the transition. |
| `stateName` | string (e) | Human-readable name of the active state before the transition. |
| `signal` | string | Abbreviation of the signal that triggered this step. |
| `signalName` | string (e) | Human-readable name of the signal. |
| `rule` | string | Number of the applied processing rule, e.g. `"2.1"` or `"2.2.2.1"`. See §Processing rules. |
| `newStack` | string[] | Stack after applying the rule. |
| `newState` | string | Abbreviation of the new active state of the head FA after the transition. |
| `newStateName` | string (e) | Human-readable name of the new active state. |
| `command` | string | Abbreviation of the command sent when entering the new state (if any). |
| `commandName` | string (e) | Human-readable name of the command. |
| `receiver` | string (e) | Name of the command receiver. |


## Utilities


