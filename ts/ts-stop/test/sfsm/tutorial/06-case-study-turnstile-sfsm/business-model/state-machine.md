# State Machine Turnstile

Base user story: [Turnstile: User Story](../sfsm/turnstile-user-story.md)

---

## 1. Top-level States

- **Locked** — The turnstile is locked; the rotating arm cannot be pushed. The light indicator shows red. The system is ready to accept a coin or banknote.
- **Payment Processing** — A coin or banknote has been inserted and is being validated. The outcome determines whether the turnstile unlocks or remains locked (returning the artifact).
- **Unlocked** — Payment was accepted; the rotating arm is unlocked and the light indicator shows green. The system waits for the user to pass through or for the unlocked-state timer to expire.
- **Service State** — The turnstile is out of service due to insufficient change, an un-retrieved artifact, or a hardware fault. The light indicator shows red and the sound indicator emits a warning. Only a service worker can restart the system.

---

## 2. Events that trigger transitions between top-level states

- **Coin inserted** — The user inserts a coin into the coin slot.
- **Banknote inserted** — The user inserts a banknote into the banknote slot.
- **Payment accepted** — The inserted artifact is valid; change has been dispensed (if needed) or no change was required.
- **Payment rejected** — The inserted artifact is invalid (bad weight, bad form, or invalid banknote) and has been returned to the artifact-box.
- **Insufficient change** — A valid payment was received but the change dispenser cannot provide the required change.
- **User passed through** — The push sensor detected that the user pushed through the rotating arm.
- **Unlocked state timeout** — The timer for the unlocked state expired before the user passed through.
- **Artifact retrieval timeout** — The timer for the artifact-box expired; the returned artifact was not retrieved by the user.
- **Hardware fault detected** — The turnstile detected an internal hardware fault.
- **Service button pressed** — The service worker pressed the service button after completing maintenance.

---

## 3. State machine (textual representation)

### Top-level transitions

```
STATE Locked
    ON Coin inserted       -> Payment Processing
    ON Banknote inserted   -> Payment Processing
    ON Hardware fault detected -> Service State

STATE Payment Processing
    ON Payment accepted    -> Unlocked
    ON Payment rejected    -> Locked
    ON Insufficient change -> Service State
    ON Hardware fault detected -> Service State

STATE Unlocked
    ON User passed through  -> Locked
    ON Unlocked state timeout -> Locked
    ON Hardware fault detected -> Service State

STATE Service State
    ON Service button pressed -> Locked
```

---

### Sub-states of Payment Processing

The **Payment Processing** state is a composite state. Its internal behaviour depends on whether a coin or a banknote was inserted.

#### Payment Processing → Coin Validation

Coin validation involves two sequential checks (weight, then form), each performed by a separate object, making it a composite sub-state.

```
STATE Coin Validation
    ON Coin inserted        -> Weight Check

STATE Weight Check
    ON Weight valid         -> Form Check
    ON Weight invalid       -> Coin Return

STATE Form Check
    ON Form valid AND change needed AND change available  -> Change Dispensing (coin)
    ON Form valid AND change not needed                  -> Payment Accepted (coin)
    ON Form valid AND change needed AND change not available -> Insufficient Change
    ON Form invalid         -> Coin Return

STATE Change Dispensing (coin)
    ON Change dispensed     -> Payment Accepted (coin)

STATE Coin Return
    ON Coin placed in artifact-box -> Artifact Retrieval Wait (coin)

STATE Artifact Retrieval Wait (coin)
    ON Artifact retrieved   -> [back to Locked]
    ON Artifact retrieval timeout -> Service State

STATE Payment Accepted (coin)
    ON Coin stored in tresor -> [signal to Unlocked]
```

#### Payment Processing → Banknote Validation

Banknote validation is performed by a single object (banknote-checker) but produces multiple outcomes, so it is modelled as a simple sub-state with branching.

```
STATE Banknote Validation
    ON Banknote inserted    -> Banknote Check

STATE Banknote Check
    ON Banknote valid AND change needed AND change available  -> Change Dispensing (banknote)
    ON Banknote valid AND change not needed                  -> Payment Accepted (banknote)
    ON Banknote valid AND change needed AND change not available -> Insufficient Change
    ON Banknote invalid     -> Banknote Return

STATE Change Dispensing (banknote)
    ON Change dispensed     -> Payment Accepted (banknote)

STATE Banknote Return
    ON Banknote placed in artifact-box -> Artifact Retrieval Wait (banknote)

STATE Artifact Retrieval Wait (banknote)
    ON Artifact retrieved   -> [back to Locked]
    ON Artifact retrieval timeout -> Service State

STATE Payment Accepted (banknote)
    ON Banknote stored in tresor -> [signal to Unlocked]
```

---

### Sub-states of Unlocked

The **Unlocked** state has two exit conditions that are supervised concurrently: user passage (push sensor) and the unlocked-state timer.

```
STATE Unlocked
    ENTER -> start Timer for unlocked state
             set Light indicator to green
    ON User passed through          -> lock arm, set Light indicator to red -> Locked
    ON Unlocked state timeout       -> lock arm, set Light indicator to red -> Locked
    ON Hardware fault detected      -> Service State
```

---

### Sub-states of Service State

The **Service State** is a simple waiting state. Entry always activates the sound indicator and ensures the light indicator is red.

```
STATE Service State
    ENTER -> set Light indicator to red
             activate Sound indicator (warning)
    ON Service button pressed -> set Light indicator to red -> Locked
```
