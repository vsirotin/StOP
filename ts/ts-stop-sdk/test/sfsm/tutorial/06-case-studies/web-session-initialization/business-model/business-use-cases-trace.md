# Business Use Cases — Traceability

This file traces each use case from [business-use-cases.md](business-use-cases.md) as a path through the state machine defined in [state-machine.md](state-machine.md).

Each path is written as a sequence of alternating **States** and **[signals]**.  
Every state and signal used here exists in `state-machine.md`. Every `--[Signal]-->` is a defined `ON` transition from the preceding state.  
A path that ends at `Session Established` confirms a complete, successfully initialized session.

---

## UC-01: Complete session initialization

Via a language preference retrieved from local memory:

```
Session Start
  --[Page loaded]-->
Reading User Preferences
  --[Language preference retrieved]-->
Consent Request
  --[Consent given]-->
App-server Check
  --[App-server available]-->
Promo code Check
  --[Promo code valid]-->
Application Data Check
  --[Application data available]-->
AI-provider Check
  --[AI-provider available]-->
Session Established
```

Via a language preference entered by the user:

```
Session Start
  --[Page loaded]-->
Reading User Preferences
  --[Language preference entered]-->
Consent Request
  --[Consent given]-->
App-server Check
  --[App-server available]-->
Promo code Check
  --[Promo code valid]-->
Application Data Check
  --[Application data available]-->
AI-provider Check
  --[AI-provider available]-->
Session Established
```

Via previously saved consent and no promo code used:

```
Session Start
  --[Page loaded]-->
Reading User Preferences
  --[Language preference retrieved]-->
Consent Request
  --[Consent already saved]-->
App-server Check
  --[App-server available]-->
Promo code Check
  --[Promo code not used]-->
Application Data Check
  --[Application data available]-->
AI-provider Check
  --[AI-provider available]-->
Session Established
```

---

## UC-02: Decline privacy consent

```
Session Start
  --[Page loaded]-->
Reading User Preferences
  --[Language preference retrieved]-->
Consent Request
  --[Consent declined]-->
Session Terminated
```

---

## UC-03: App-server unavailable

```
Session Start
  --[Page loaded]-->
Reading User Preferences
  --[Language preference retrieved]-->
Consent Request
  --[Consent given]-->
App-server Check
  --[App-server unavailable]-->
Session Terminated
```

---

## UC-04: Invalid promo code

```
Session Start
  --[Page loaded]-->
Reading User Preferences
  --[Language preference retrieved]-->
Consent Request
  --[Consent given]-->
App-server Check
  --[App-server available]-->
Promo code Check
  --[Promo code invalid]-->
Purchase Proposal
```

---

## UC-05: Purchase new promo code

```
Session Start
  --[Page loaded]-->
Reading User Preferences
  --[Language preference retrieved]-->
Consent Request
  --[Consent given]-->
App-server Check
  --[App-server available]-->
Promo code Check
  --[Promo code invalid]-->
Purchase Proposal
  --[New promo code purchased]-->
Application Data Check
  --[Application data available]-->
AI-provider Check
  --[AI-provider available]-->
Session Established
```

---

## UC-06: Decline to purchase new promo code

```
Session Start
  --[Page loaded]-->
Reading User Preferences
  --[Language preference retrieved]-->
Consent Request
  --[Consent given]-->
App-server Check
  --[App-server available]-->
Promo code Check
  --[Promo code invalid]-->
Purchase Proposal
  --[New promo code not purchased]-->
Session Terminated
```

---

## UC-07: Application data unavailable

```
Session Start
  --[Page loaded]-->
Reading User Preferences
  --[Language preference retrieved]-->
Consent Request
  --[Consent given]-->
App-server Check
  --[App-server available]-->
Promo code Check
  --[Promo code valid]-->
Application Data Check
  --[Application data unavailable]-->
Session Terminated
```

---

## UC-08: AI-provider unavailable

```
Session Start
  --[Page loaded]-->
Reading User Preferences
  --[Language preference retrieved]-->
Consent Request
  --[Consent given]-->
App-server Check
  --[App-server available]-->
Promo code Check
  --[Promo code valid]-->
Application Data Check
  --[Application data available]-->
AI-provider Check
  --[AI-provider unavailable]-->
Session Terminated
```

---

## UC-09: Session re-initialization on page reload

```
Session Established
  --[Page reload]-->
Reading User Preferences
  --[Language preference retrieved]-->
Consent Request
  --[Consent already saved]-->
App-server Check
  --[App-server available]-->
Promo code Check
  --[Promo code valid]-->
Application Data Check
  --[Application data available]-->
AI-provider Check
  --[AI-provider available]-->
Session Established
```
