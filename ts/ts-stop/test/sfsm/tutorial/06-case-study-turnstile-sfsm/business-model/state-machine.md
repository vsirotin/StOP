# State Machine Turnstile

Base user story: [Turnstile: User Story](../sfsm/turnstile-user-story.md)

---

## 1. States

- **Locked** — The turnstile is locked; the rotating arm cannot be pushed. Light indicator shows red. Awaiting a coin or banknote.
- **Weight Check** — The weight-checker is validating the weight of the inserted coin.
- **Form Check** — The form-checker is validating the form of the coin and deciding whether change is needed.
- **Banknote Check** — The banknote-checker is validating the inserted banknote and deciding whether change is needed.
- **Change Dispensing** — The change dispenser is dispensing the required change into the artifact-box.
- **Artifact Return** — An invalid or unprocessable artifact has been placed in the artifact-box; the artifact-box timer is running.
- **Artifact Retrieval Wait** — The system is waiting for the user to retrieve the artifact from the artifact-box.
- **Unlocked** — Payment accepted; the rotating arm is unlocked, light indicator shows green. Awaiting passage or timeout.
- **Service State** — The turnstile is out of service. Light indicator shows red; sound indicator emits a warning. Only a service worker can restart the system.

---

## 2. Events

- **Coin inserted** — The user inserts a coin; the coin-receiver receives it.
- **Banknote inserted** — The user inserts a banknote; the banknote-receiver receives it.
- **Weight valid** — The weight-checker confirms the coin weight is acceptable.
- **Weight invalid** — The weight-checker rejects the coin due to incorrect weight.
- **Form valid, change needed, change available** — The form-checker confirms the coin; the change dispenser has sufficient funds.
- **Form valid, no change needed** — The form-checker confirms the coin; no change is required.
- **Form valid, change not available** — The form-checker confirms the coin; the change dispenser cannot provide the required change.
- **Form invalid** — The form-checker rejects the coin.
- **Banknote valid, change needed, change available** — The banknote-checker confirms the banknote; sufficient change is available.
- **Banknote valid, no change needed** — The banknote-checker confirms the banknote; no change is required.
- **Banknote valid, change not available** — The banknote-checker confirms the banknote; change is unavailable.
- **Banknote invalid** — The banknote-checker rejects the banknote.
- **Change dispensed** — The change dispenser has placed change in the artifact-box; payment is complete.
- **Artifact placed in artifact-box** — The rejected artifact has been placed in the artifact-box and the timer has started.
- **Artifact retrieved** — The user has taken the artifact from the artifact-box.
- **Artifact retrieval timeout** — The artifact-box timer expired; the artifact was not retrieved in time.
- **User passed through** — The push sensor detected that the user pushed through the rotating arm.
- **Unlocked state timeout** — The unlocked-state timer expired before the user passed through.
- **Hardware fault detected** — The turnstile detected an internal hardware fault.
- **Service button pressed** — The service worker pressed the service button after completing maintenance.

---

## 3. State machine (textual representation)

```
STATE Locked
    ON Coin inserted                                          -> Weight Check
    ON Banknote inserted                                      -> Banknote Check
    ON Hardware fault detected                                -> Service State

STATE Weight Check
    ON Weight valid                                           -> Form Check
    ON Weight invalid                                         -> Artifact Return

STATE Form Check
    ON Form valid AND change needed AND change available      -> Change Dispensing
    ON Form valid AND no change needed                        -> Unlocked
    ON Form valid AND change not available                    -> Service State
    ON Form invalid                                           -> Artifact Return

STATE Banknote Check
    ON Banknote valid AND change needed AND change available  -> Change Dispensing
    ON Banknote valid AND no change needed                    -> Unlocked
    ON Banknote valid AND change not available                -> Service State
    ON Banknote invalid                                       -> Artifact Return

STATE Change Dispensing
    ON Change dispensed                                       -> Unlocked

STATE Artifact Return
    ON Artifact placed in artifact-box                        -> Artifact Retrieval Wait

STATE Artifact Retrieval Wait
    ON Artifact retrieved                                     -> Locked
    ON Artifact retrieval timeout                             -> Service State

STATE Unlocked
    ON User passed through                                    -> Locked
    ON Unlocked state timeout                                 -> Locked
    ON Hardware fault detected                                -> Service State

STATE Service State
    ON Service button pressed                                 -> Locked
```
