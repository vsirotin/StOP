# Transformation Trace — Turnstile

Source: `business-model/state-machine.md`
Output: `sfsm-model/turnstile-behavior.json`, `sfsm-model/turnstile-structure.json`

---

## Initialization (user-instructions.md)

Source: `user-instructions.md` #1 — *"Turnstile will always start with service worker by push on button 'Start'."*

**B-Rule-01 (Initialization):** Startup sequence not described in state-machine.md → derive from user-instructions.md.

- Sender: **Service Button** (swimlane User Interaction, type: sender)
- Signal: `Service Button>Service button pressed`
- Target state: `Locked` (the initial operational state)

| Transition added to behavior.json | Structure addition |
|---|---|
| `["I", "Service Button>Service button pressed", "Locked"]` | Service Button: event `service_button_pressed`, signal `Service Button>Service button pressed` |

---

## STATE Locked (state-machine.md line 49)

**B-Rule-03 (State mapping):** `STATE Locked` → state `Locked` in FA `Turnstile`.

---

### Transition 1 — Locked → Weight Check (line 50)

Source line:
```
ON Coin inserted   ->   Weight Check
```

**B-Rule-02 (Signal sender from swimlanes):**
- Signal name in business model: `Coin inserted`
- Swimlane User Interaction contains **Coin Slot** (physical slot, type: sender)
- Coin slot is the physical event source; coin-receiver is the internal processor → sender is Coin Slot
- Derived signal: `Coin Slot>Coin inserted`

**B-Rule-04 (Transition mapping):** Create transition.

| Transition added to behavior.json | Structure addition |
|---|---|
| `["Locked", "Coin Slot>Coin inserted", "Weight Check"]` | Coin Slot: event `coin_inserted`, signal `Coin Slot>Coin inserted` |

---

### Transition 2 — Locked → Banknote Check (line 51)

Source line:
```
ON Banknote inserted   ->   Banknote Check
```

**B-Rule-02 (Signal sender from swimlanes):**
- Signal name in business model: `Banknote inserted`
- Swimlane User Interaction contains **Banknote Slot** (type: sender)
- Derived signal: `Banknote Slot>Banknote inserted`

**B-Rule-04 (Transition mapping):** Create transition.

| Transition added to behavior.json | Structure addition |
|---|---|
| `["Locked", "Banknote Slot>Banknote inserted", "Banknote Check"]` | Banknote Slot: event `banknote_inserted`, signal `Banknote Slot>Banknote inserted` |

---

### Transition 3 — Locked → Service State (line 52)

Source line:
```
ON Hardware fault detected   ->   Service State
```

**B-Rule-02 (Signal sender from swimlanes):** Signal `Hardware fault detected` does not appear in any swimlane.

**B-Rule-05 (Sender from user-instructions):**
- `user-instructions.md` #2: *"In turnstile exists a technical sensor that sends the signal 'Hardware fault detected'."*
- Sender: **Technical Sensor** (not in swimlanes; added to structure as direct child of Turnstile, type: sender)
- Derived signal: `Technical Sensor>Hardware fault detected`

**B-Rule-04 (Transition mapping):** Create transition.

| Transition added to behavior.json | Structure addition |
|---|---|
| `["Locked", "Technical Sensor>Hardware fault detected", "Service State"]` | Technical Sensor: event `hardware_fault_detected`, signal `Technical Sensor>Hardware fault detected` |
