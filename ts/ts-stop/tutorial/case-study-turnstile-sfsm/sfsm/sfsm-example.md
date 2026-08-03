```json
{
    "Turnstile": [
    // 0.1 The service worker presses the service button.
    // 0.2 The turnstile receives the button press and transitions to the locked state.
        ["Turnstile:I", "Service>start", "Turnstile:locked"],
    //1.1 The user inserts a coin in the coin slot.
    //1.2 The coin-receiver receives the coin and sends it to the weight-checker.
        ["Turnstile:locked", "CoinReceiver>receiveCoin", "WeightChecker:validating", "validateWeight"],
        
    // 1.3 The weight-checker validates the weight of the coin and sends it to the form-checker.
        ["WeightChecker:validating", "WeightChecker>weightOK", "FormChecker:validating", "validateForm"],

    // 1.4 The form-checker validates the form of the coin and decides that it is valid and that change is needed.
        // 1.5 The form-checker sends a change-required signal (per the decision in step 1.4) to the change dispenser.
        ["FormChecker:validating", "FormChecker>formOK", "ChangeDispenser:changing", "changeRequired"],

    // 1.6 The change dispenser receives the change-required signal and decides that the available change is sufficient.
        ["ChangeDispenser:changing", "ChangeDispenser>changeOK", "ChangeDispenser:dispensing", "dispenseChange"],

    // 1.7 The change dispenser dispenses change to the artifact-box. (physical effect of "dispenseChange" — no SFSM signal)
    // 1.8 The change dispenser sends a confirmation signal (per the decision in step 1.6) to the form-checker.
        ["ChangeDispenser:dispensing", "ChangeDispenser>changeConfirmed", "FormChecker:finalizing", "finalizePayment"],

    // 1.9 The form-checker receives the confirmation signal and sends the coin to the tresor and a payment-finalized signal to the locking mechanism.
    //     (fan-out: two receivers, one chained transition each — coin hand-off first, then the named payment-finalized signal)
        ["FormChecker:finalizing", "FormChecker>coinReady", "Tresor:storing", "storeCoin"],
        ["Tresor:storing", "FormChecker>paymentFinalized", "LockingMechanism:unlocking", "unlock"],

    // 1.10 The locking mechanism receives the payment-finalized signal and unlocks the rotating arm. (physical effect of "unlock" — no SFSM signal)
    // 1.11 The locking mechanism sends an unlocked signal to the light indicator and to the timer for the unlocked state.
    //      (fan-out: one named "unlocked" signal reused for both chained transitions)
        ["LockingMechanism:unlocking", "LockingMechanism>unlocked", "LightIndicator:displaying", "displayGreen"],
        ["LightIndicator:displaying", "LockingMechanism>unlocked", "TimerForUnlockedState:running", "startTimer"],

    // 1.12 The light indicator receives the unlocked signal and displays green. (physical effect of "displayGreen" — no SFSM signal)
    // 1.13 The timer for the unlocked state receives the unlocked signal and starts. (physical effect of "startTimer" — no SFSM signal;
    //      this is the timer start referenced later by use case 10, step 1.13)
    // 1.14 The user pushes the rotating arm and walks through. (external-world trigger — no SFSM signal of its own)
    // 1.15 The push sensor detects the user and sends a passage signal to the locking mechanism and to the light indicator.
    //      (fan-out: one named "passage" signal reused for both chained transitions; light indicator is modeled first and locking
    //      mechanism last so the FA returns to the existing "Turnstile:locked" state at the end of the use case — loop-closing rule)
        ["TimerForUnlockedState:running", "PushSensor>passage", "LightIndicator:displaying", "displayRed"],
        ["LightIndicator:displaying", "PushSensor>passage", "Turnstile:locked", "lock"],

    // 1.16 The locking mechanism receives the passage signal and locks the rotating arm. (physical effect of "lock" — no SFSM signal)
    // 1.17 The light indicator receives the passage signal and displays red. (physical effect of "displayRed" — no SFSM signal; end of use case 1)
    ]
}
```