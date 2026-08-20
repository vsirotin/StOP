# Processing Log — Turnstile SFSM Model

## 2026-12-08T00:00:00 — Start of processing
- Use case: UC-01: Coin Payment, change dispensed
- Details: Started applying the stop-sfsm-modeller skill to transform the turnstile business model into an SFSM model.
- Result: in progress

## 2026-12-08T00:00:01 — Step 1: Initial structure created
- Details: Built the initial component hierarchy in sfsm.ext.json from user-instructions.md. Root component: Turnstile. Sub-components: Payment component (Coin processing component, Banknote processing component), Change-dispenser, Locking mechanism (Push sensor), Service component (Service button).
- Result: pass

## 2026-12-08T00:00:02 — Step 2.1: Transitions for UC-01 processed
- Details: Processed 6 transitions in the Turnstile FA, 3 in Weight-checker, 5 in Form-checker, 2 in Change-dispenser. Used sub-FA push/pop with commands for Weight-checker.weightCheck, Form-checker.checkForm, Change-dispenser.dispenseChange.
- Result: pass

## 2026-12-08T00:00:03 — Step 2.2: Validation
- Details: Ran validate-ext-sfsm.js. Result: 0 errors, 14 warnings (expected for partial model: duplicate signals across parent/child FAs, unhandled exit-state signals for non-UC-01 paths, command naming convention differences).
- Result: pass

## 2026-12-08T00:00:04 — Step 2.3: Test UC-01
- Details: Ran run-fa.js with signals.txt (3 external signals) and commands.json (3 command→signal mappings). Final state: Locked. Trace matches expected UC-01 flow: Locked → Weight Check → Form Check → Change Dispensing → Unlocked → Locked.
- Result: PASS
