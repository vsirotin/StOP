// Use case 1: Happy path with coin and change
// Source: turnstile-use-cases.md

//1. Happy path with coin and change:
//    1.1 The user inserts a coin in the coin slot.
//-- Rule 1: External events are not converted into transitions
//-- New event discovered: Coin Slot > coin_inserted > signal "Coin Slot>Coin Inserted"

//    1.2 The coin-receiver receives the coin and sends it to the weight-checker.
["Turnstile:Locked", "Coin Slot>Coin Inserted", "Turnstile:Payment Component"]
//-- Rule 2: Turnstile delegates to Payment Component sub-FA (signal forwarded)

["Payment Component:I", "Coin Slot>Coin Inserted", "Payment Component:Coin Component"]
//-- Rule 2: Payment Component delegates to Coin Component sub-FA (signal forwarded)

["Coin Component:I", "Coin Slot>Coin Inserted", "Coin Component:Weight Checking", "Weight Checker.checkWeight"]
//-- Rule 7: Coin Component moves to Weight Checking state, calls Weight Checker command

//    1.3 The weight-checker validates the weight of the coin and sends it to the form-checker.
["Coin Component:Weight Checking", "Weight Checker>WeightOK", "Coin Component:Form Checking", "Form Checker.checkForm"]
//-- Rule 7: Weight valid, move to Form Checking, call Form Checker command

//    1.4 The form-checker validates the form of the coin and decides that it is valid and that change is needed.
//    1.5 The form-checker sends a change-required signal (per the decision in step 1.4) to the change dispenser.
["Coin Component:Form Checking", "Form Checker>FormValidChangeNeeded", "Coin Component:Change Processing", "Change Dispenser.dispenseChange"]
//-- Rule 7: Form valid, change needed, move to Change Processing, call Change Dispenser command
//-- Rule 5: Cross-branch routing — Change Dispenser is under Payment Component, called directly by Coin Component

//    1.6 The change dispenser receives the change-required signal and decides that the available change is sufficient.
//    1.7 The change dispenser dispenses change to the artifact-box.
//    1.8 The change dispenser sends a confirmation signal (per the decision in step 1.6) to the form-checker.
["Coin Component:Change Processing", "Change Dispenser>ChangeDone", "Coin Component:Finalizing", "Form Checker.finalizePayment"]
//-- Rule 7: Change done, move to Finalizing, call Form Checker to finalize payment

//    1.9 The form-checker receives the confirmation signal and sends the coin to the tresor and a payment-finalized signal to the locking mechanism.
["Coin Component:Finalizing", "Form Checker>PaymentFinalized", "Coin Component:E_PaymentFinalized"]
//-- Rule 4: Coin Component exits with E_PaymentFinalized, signal forwarded to parent (Payment Component)

["Payment Component:Coin Component", "Form Checker>PaymentFinalized", "Payment Component:Finalizing", "Payment Component.paymentFinalized"]
//-- Rule 8: Payment Component receives child's completion signal, moves to Finalizing, calls command to rename signal

["Payment Component:Finalizing", "Payment Component>PaymentFinalized", "Payment Component:E_PaymentFinalized"]
//-- Rule 4: Payment Component exits with E_PaymentFinalized, renamed signal forwarded to parent (Turnstile)

//    1.10 The locking mechanism receives the payment-finalized signal and unlocks the rotating arm.
//    1.11 The locking mechanism sends an unlocked signal to the light indicator and to the timer for the unlocked state.
//    1.12 The light indicator receives the unlocked signal and displays green.
//    1.13 The timer for the unlocked state receives the unlocked signal and starts.
["Turnstile:Payment Component", "Payment Component>PaymentFinalized", "Turnstile:Unlocked"]
//-- Rule 2: Turnstile receives payment finalized, transitions to Unlocked (locking is implicit in state change)

//    1.14 The user pushes the rotating arm and walks through.
//-- Rule 1: External events are not converted into transitions
//-- New event discovered: Push Sensor > user_pushed > signal "Push Sensor>Passage"

//    1.15 The push sensor detects the user and sends a passage signal to the locking mechanism and to the light indicator.
//    1.16 The locking mechanism receives the passage signal and locks the rotating arm.
//    1.17 The light indicator receives the passage signal and displays red.
["Turnstile:Unlocked", "Push Sensor>Passage", "Turnstile:Locked"]
//-- Rule 2: Turnstile receives passage signal, transitions back to Locked