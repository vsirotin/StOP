# Business Use Cases — Turnstile

Base user story: [Turnstile: User Story](../sfsm/turnstile-user-story.md)

---

# UC-01: Coin Payment, change dispensed
## Description
The user inserts a valid coin into the coin slot. The turnstile receives the coin, validates its weight and form, determines that change is needed, and verifies that sufficient change is available. The change dispenser places the change into the artifact-box and the coin is stored in the tresor. The locking mechanism unlocks the rotating arm and the light indicator switches to green. The user retrieves the change from the artifact-box and pushes through the rotating arm. The push sensor signals passage; the locking mechanism locks the arm and the light indicator returns to red.
## Actors
- User
## Internal objects
- Coin-receiver
- Weight-checker
- Form-checker
- Change dispenser
- Tresor
- Artifact-box
- Locking mechanism
- Light indicator
- Push sensor

---

# UC-02: Coin Payment, no change needed
## Description
The user inserts a valid coin into the coin slot. The turnstile receives the coin, validates its weight and form, and determines that no change is needed. The coin is stored in the tresor. The locking mechanism unlocks the rotating arm and the light indicator switches to green. The user pushes through; the push sensor signals passage, the locking mechanism locks the arm, and the light indicator returns to red.
## Actors
- User
## Internal objects
- Coin-receiver
- Weight-checker
- Form-checker
- Tresor
- Locking mechanism
- Light indicator
- Push sensor

---

# UC-03: Coin Payment, coin has bad weight
## Description
The user inserts an invalid coin into the coin slot. The weight-checker rejects the coin and it is returned to the user via the artifact-box. The turnstile remains locked; the light indicator stays red and the sound indicator emits a warning signal.
## Actors
- User
## Internal objects
- Coin-receiver
- Weight-checker
- Artifact-box
- Light indicator
- Sound indicator
- Timer for artifact-box

---

# UC-04: Coin Payment, coin has bad form
## Description
The user inserts a coin that passes weight validation but fails form validation. The form-checker rejects the coin and it is returned to the user via the artifact-box. The turnstile remains locked; the light indicator stays red and the sound indicator emits a warning signal.
## Actors
- User
## Internal objects
- Coin-receiver
- Weight-checker
- Form-checker
- Artifact-box
- Light indicator
- Sound indicator
- Timer for artifact-box

---

# UC-05: Banknote Payment, change dispensed
## Description
The user inserts a valid banknote into the banknote slot. The turnstile receives and validates the banknote, determines that change is needed, and verifies that sufficient change is available. The change dispenser places the change into the artifact-box and the banknote is stored in the tresor. The locking mechanism unlocks the rotating arm and the light indicator switches to green. The user retrieves the change and passes through; the push sensor signals passage, the arm locks, and the light indicator returns to red.
## Actors
- User
## Internal objects
- Banknote-receiver
- Banknote-checker
- Change dispenser
- Tresor
- Artifact-box
- Locking mechanism
- Light indicator
- Push sensor

---

# UC-06: Banknote Payment, no change needed
## Description
The user inserts a valid banknote into the banknote slot. The turnstile validates the banknote and determines no change is needed. The banknote is stored in the tresor. The locking mechanism unlocks the rotating arm and the light indicator switches to green. The user passes through; the push sensor signals passage, the arm locks, and the light indicator returns to red.
## Actors
- User
## Internal objects
- Banknote-receiver
- Banknote-checker
- Tresor
- Locking mechanism
- Light indicator
- Push sensor

---

# UC-07: Banknote Payment, invalid banknote
## Description
The user inserts an invalid banknote into the banknote slot. The banknote-checker rejects it and the banknote is returned to the user via the artifact-box. The turnstile remains locked; the light indicator stays red and the sound indicator emits a warning signal.
## Actors
- User
## Internal objects
- Banknote-receiver
- Banknote-checker
- Artifact-box
- Light indicator
- Sound indicator
- Timer for artifact-box

---

# UC-08: Insufficient change available
## Description
The user inserts a valid coin or banknote. During payment processing, the change dispenser determines that insufficient change is available to complete the transaction. The payment artifact (coin or banknote) is returned to the user via the artifact-box. The turnstile transitions to the service state: the light indicator shows red and the sound indicator emits a warning signal. A service worker restocks the change dispenser and presses the service button to restart the turnstile, returning it to the locked state with the light indicator showing red.
## Actors
- User
- Service worker
## Internal objects
- Coin-receiver
- Weight-checker
- Form-checker
- Banknote-receiver
- Banknote-checker
- Change dispenser
- Artifact-box
- Light indicator
- Sound indicator
- Timer for artifact-box
- Service button

---

# UC-09: Artifact not retrieved, timeout
## Description
A returned artifact (invalid coin, invalid banknote, or dispensed change) is placed in the artifact-box but the user does not retrieve it within the allotted time. The timer for the artifact-box expires and the turnstile transitions to the service state: the light indicator shows red and the sound indicator emits a warning signal. A service worker retrieves the artifact and presses the service button to restart the turnstile, returning it to the locked state.
## Actors
- User
- Service worker
## Internal objects
- Artifact-box
- Timer for artifact-box
- Light indicator
- Sound indicator
- Service button

---

# UC-10: Hardware fault
## Description
The turnstile detects an internal hardware fault. It transitions immediately to the service state: the light indicator shows red and the sound indicator emits a warning signal. A service worker diagnoses and repairs the fault, then presses the service button to restart the turnstile, returning it to the locked state.
## Actors
- Service worker
## Internal objects
- Locking mechanism
- Light indicator
- Sound indicator
- Service button

---

# UC-11: Unlocked state timeout
## Description
After successful payment the turnstile unlocks the rotating arm. If the user does not push through within the allotted time, the timer for the unlocked state expires. The locking mechanism re-locks the rotating arm and the light indicator returns to red. The paid amount is not refunded.
## Actors
- User
## Internal objects
- Locking mechanism
- Light indicator
- Timer for unlocked state
