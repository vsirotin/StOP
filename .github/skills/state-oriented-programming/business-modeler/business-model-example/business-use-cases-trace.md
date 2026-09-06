# Business Use Cases — Traceability

This file traces each use case from [business-use-cases.md](business-use-cases.md) as a path through the state machine defined in [state-machine.md](state-machine.md).

Each path is written as a sequence of alternating **States** and **[signals]**.  
Every state and signal used here exists in `state-machine.md`. Every `--[Signal]-->` is a defined `ON` transition from the preceding state.  
A path that ends at `Locked` confirms a complete, closed flow.

---

## UC-01: Coin Payment, change dispensed

```
Locked
  --[Coin inserted]-->
Weight Check
  --[Weight valid]-->
Form Check
  --[Form valid, change needed, change available]-->
Change Dispensing
  --[Change dispensed]-->
Unlocked
  --[User passed through]-->
Locked
```

---

## UC-02: Coin Payment, no change needed

```
Locked
  --[Coin inserted]-->
Weight Check
  --[Weight valid]-->
Form Check
  --[Form valid, no change needed]-->
Unlocked
  --[User passed through]-->
Locked
```

---

## UC-03: Coin Payment, coin has bad weight

```
Locked
  --[Coin inserted]-->
Weight Check
  --[Weight invalid]-->
Artifact Return
  --[Artifact placed in artifact-box]-->
Artifact Retrieval Wait
  --[Artifact retrieved]-->
Locked
```

---

## UC-04: Coin Payment, coin has bad form

```
Locked
  --[Coin inserted]-->
Weight Check
  --[Weight valid]-->
Form Check
  --[Form invalid]-->
Artifact Return
  --[Artifact placed in artifact-box]-->
Artifact Retrieval Wait
  --[Artifact retrieved]-->
Locked
```

---

## UC-05: Banknote Payment, change dispensed

```
Locked
  --[Banknote inserted]-->
Banknote Check
  --[Banknote valid, change needed, change available]-->
Change Dispensing
  --[Change dispensed]-->
Unlocked
  --[User passed through]-->
Locked
```

---

## UC-06: Banknote Payment, no change needed

```
Locked
  --[Banknote inserted]-->
Banknote Check
  --[Banknote valid, no change needed]-->
Unlocked
  --[User passed through]-->
Locked
```

---

## UC-07: Banknote Payment, invalid banknote

```
Locked
  --[Banknote inserted]-->
Banknote Check
  --[Banknote invalid]-->
Artifact Return
  --[Artifact placed in artifact-box]-->
Artifact Retrieval Wait
  --[Artifact retrieved]-->
Locked
```

---

## UC-08: Insufficient change available

Via coin payment:

```
Locked
  --[Coin inserted]-->
Weight Check
  --[Weight valid]-->
Form Check
  --[Form valid, change not available]-->
Service State
  --[Service button pressed]-->
Locked
```

Via banknote payment:

```
Locked
  --[Banknote inserted]-->
Banknote Check
  --[Banknote valid, change not available]-->
Service State
  --[Service button pressed]-->
Locked
```

---

## UC-09: Artifact not retrieved, timeout

Via bad coin weight:

```
Locked
  --[Coin inserted]-->
Weight Check
  --[Weight invalid]-->
Artifact Return
  --[Artifact placed in artifact-box]-->
Artifact Retrieval Wait
  --[Artifact retrieval timeout]-->
Service State
  --[Service button pressed]-->
Locked
```

Via bad coin form:

```
Locked
  --[Coin inserted]-->
Weight Check
  --[Weight valid]-->
Form Check
  --[Form invalid]-->
Artifact Return
  --[Artifact placed in artifact-box]-->
Artifact Retrieval Wait
  --[Artifact retrieval timeout]-->
Service State
  --[Service button pressed]-->
Locked
```

Via invalid banknote:

```
Locked
  --[Banknote inserted]-->
Banknote Check
  --[Banknote invalid]-->
Artifact Return
  --[Artifact placed in artifact-box]-->
Artifact Retrieval Wait
  --[Artifact retrieval timeout]-->
Service State
  --[Service button pressed]-->
Locked
```

---

## UC-10: Hardware fault

From Locked:

```
Locked
  --[Hardware fault detected]-->
Service State
  --[Service button pressed]-->
Locked
```

From Unlocked:

```
Locked
  --[Coin inserted]-->
Weight Check
  --[Weight valid]-->
Form Check
  --[Form valid, no change needed]-->
Unlocked
  --[Hardware fault detected]-->
Service State
  --[Service button pressed]-->
Locked
```

---

## UC-11: Unlocked state timeout

Via coin payment:

```
Locked
  --[Coin inserted]-->
Weight Check
  --[Weight valid]-->
Form Check
  --[Form valid, no change needed]-->
Unlocked
  --[Unlocked state timeout]-->
Locked
```

Via banknote payment:

```
Locked
  --[Banknote inserted]-->
Banknote Check
  --[Banknote valid, no change needed]-->
Unlocked
  --[Unlocked state timeout]-->
Locked
```
