# Swimlanes — Turnstile

Base user story: [Turnstile: User Story](../sfsm/turnstile-user-story.md)

---

# Swimlane User Interaction

This swimlane contains the objects that a user or service worker directly touches or perceives.

- **Coin slot** — The slot where the user inserts coins to pay for access.
- **Banknote slot** — The slot where the user inserts banknotes to pay for access.
- **Artifact-box** — The tray with a glass window where the user retrieves dispensed change or returned invalid coins/banknotes.
- **Light indicator** — Visual indicator visible to the user: green when the turnstile is unlocked, red when locked or in service state.
- **Service button** — Button pressed by the service worker to restart the turnstile from the service state after maintenance.

---

# Swimlane Coin Processing

This swimlane contains the objects responsible for receiving and validating inserted coins.

- **Coin-receiver** — Receives coins from the coin slot and forwards them to the weight-checker.
- **Weight-checker** — Validates the physical weight of the coin and forwards it to the form-checker if acceptable; rejects it otherwise.
- **Form-checker** — Validates the form (shape/denomination) of the coin, determines whether it is valid and whether change is required, and routes the coin accordingly.

---

# Swimlane Banknote Processing

This swimlane contains the objects responsible for receiving and validating inserted banknotes.

- **Banknote-receiver** — Receives banknotes from the banknote slot and forwards them to the banknote-checker.
- **Banknote-checker** — Validates the banknote, determines whether it is valid and whether change is required, and routes the banknote accordingly.

---

# Swimlane Payment and Storage

This swimlane contains the objects responsible for dispensing change and safely storing accepted payments.

- **Change dispenser** — Checks change availability, dispenses change into the artifact-box when needed, and signals the outcome to the payment validators.
- **Tresor** — Securely stores validated coins and banknotes.

---

# Swimlane Access Control

This swimlane contains the objects that physically control and detect user passage through the turnstile.

- **Locking mechanism** — Locks and unlocks the rotating arm in response to payment and passage events.
- **Push sensor** — Detects when a user pushes through the rotating arm and signals the locking mechanism and light indicator.

---

# Swimlane Timing and Notifications

This swimlane contains the objects responsible for enforcing time limits and notifying users and workers of exceptional conditions.

- **Timer for artifact-box** — Starts when an artifact is placed in the artifact-box; expires if the user does not retrieve the artifact within the allotted time, triggering a service-state transition.
- **Timer for unlocked state** — Starts when the turnstile unlocks; expires if the user does not pass through within the allotted time, causing the arm to re-lock.
- **Sound indicator** — Emits an audible warning signal when the turnstile enters the service state.
