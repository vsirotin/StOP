# SFSM Modelling Log — Turnstile

## 2026-08-06 — Initialization
- Created initial `turnstile-structure.json` with component hierarchy derived from the user story Structure Overview.
- Created empty `turnstile-behavior.json`.
- Component hierarchy: Turnstile (root) → Service Component, Payment Component (Coin/Banknote/Change Dispenser/Tresor), Passage Component (Locking Mechanism/Push Sensor/Timer for Unlocked State), Artifact Box Component (Artifact Box/Timer for Artifact-Box), Indicator Component (Light Indicator/Sound Indicator).
- Initial type hypotheses assigned based on element roles (sender/receiver/transceiver).