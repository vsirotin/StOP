# User instructions for the Turnstile SFSM model

1. Structure of object in system is:

Turnstile
- Payment component
-- Coin processing component
--- Coin slot
--- Coin Receiver
--- Weight checker
--- Form checker
-- Banknote processing component
--- Banknote slot
--- Banknote Receiver
--- Banknote checker
--- Change dispenser
--- Tresor for storing valid coins and banknotes
- Artifact-box with a glass window for retrieving 
-- Timer for the artifact-box
change and returned items
- Service component
-- Light indicator
-- Sound indicator
-- Service button
-- Hardware fault sensor
- Locking mechanism
-- Push sensor
-- Timer for the unlocked state



1. Turnstile will be always starts with service worker by push on button "Start". Initial transition is
```json
Turnstile": {
      "ts": [
        ["I", "Service Button>Service button pressed", "Locked"],
```

2. In turnstile exists a technical sensor that sends the signal "Hardware fault detected". In this case, the turnstile will be in service state and the user cannot use it.