# Turnstile Extended Transitions

Base user story: [Turnstile: User Story](turnstile-user-story.md)
Base use cases: [Turnstile: Use Cases](turnstile-use-cases.md)

## FA-structure

```code
Turnstile
- Payment Component
- - Coin Component
- - - Coin Slot
- - - Coin Receiver
- - - Weight Checker
- - - Form Checker
- - Banknote Component
- - - Banknote Slot
- - - Banknote Receiver
- - - Banknote Checker
- - Change Component
- - - Change Dispenser
- - Tresor Component
- - - Tresor
- Access Component
- - Lock Component
- - - Locking Mechanism
- - - Push Sensor
- - - Timer for Unlocked State
- - Rotating Arm
- User Interface Component
- - Indicator Component
- - - Light Indicator
- - - Sound Indicator
- - Artifact Box
- - - Timer for Artifact Box
- Service Component
- - Service Button
```

## Event and Command Descriptions

### Service Component
Event: onServiceButtonPressed() -> send "Service Component>Service Button pressed"

### Coin Slot
Event: onCoinInsert(coinCandidate) -> send "Coin Slot>Coin Inserted"

### Weight Checker
Command: checkWeight can send:
- "Weight Checker>WeightOK" if weight is valid
- "Weight Checker>WeightNotOK" if weight is not valid
- "Weight Checker>WeightCanNeedChange {N}" if weight match to validate coin and change is needed, where N is the amount of change needed

### Form Checker
Command: checkForm can send:
- "Form Checker>FormValidChangeNeeded" if form is valid and change is needed
- "Form Checker>FormValidNoChange" if form is valid and no change is needed
- "Form Checker>FormInvalid" if form is not valid

Command: finalizePayment can send:
- "Form Checker>PaymentFinalized" when coin is sent to tresor and payment is finalized

### Change Dispenser
Command: dispenseChange can send:
- "Change Dispenser>ChangeSufficient" if change is available and dispensed to artifact-box
- "Change Dispenser>ChangeInsufficient" if change is not available

### Locking Mechanism
Command: unlock can send:
- "Locking Mechanism>Unlocked" when the rotating arm is unlocked

Command: lock can send:
- "Locking Mechanism>Locked" when the rotating arm is locked

### Light Indicator
Command: displayGreen can send:
- "Light Indicator>Green" when green is displayed

Command: displayRed can send:
- "Light Indicator>Red" when red is displayed

### Timer for Unlocked State
Event: onTimeout() -> send "Timer for Unlocked State>Timeout"
Command: start can send:
- "Timer for Unlocked State>Started" when the timer is started

### Push Sensor
Event: onPassage() -> send "Push Sensor>Passage"

## Extended Transitions

```code
//0. System initialization:
//    0.1 The service worker presses the service button.
//-- Rule 1: An event out of system should be not convert in transition

//    0.2 The turnstile receives the button press and transitions to the locked state.
["Turnstile:I", "Service Component>Service Button pressed", "Turnstile:Locked"]
//-- Rule 2: Transition of the same object in new state without additional actions (commands).


//1. Happy path with coin and change:
//    1.1 The user inserts a coin in the coin slot.
//-- Rule 1.

//    1.2 The coin-receiver receives the coin and sends it to the weight-checker.
["Turnstile:Locked", "Coin Slot>Coin Inserted", "Payment Component"]
//-- Rule 2: Component (in this situation - Turnstile) itself is not able to process this signal in business sence, therefore it sends it on corresponded child. Parent component know only names and capabilities of child components , not their structure in details.

["Payment Component:I", "Coin Slot>Coin Inserted", "Coin Component"]
//-- Rule 3: Component by default is in initial state.
//-- Rule 2

["Coin Component:I", "Coin Slot>Coin Inserted", "Weight Checker"]
//-- Rule 3
//-- Rule 2



//    1.3 The weight-checker validates the weight of the coin and sends it to the form-checker.
["Weight Checker:I", "Coin Slot>Coin Inserted", "Weight Checker:E_Weight_Checked", "Weight Checker.checkWeight"]
//-- Rule 4: After completing its task the components to report result to parent use state with name >Component name>:E_*

["Coin Component:I", "Weight Checker>WeightCanNeedChange", "Form Checker"]
//-- Rule 2

//    1.4 The form-checker validates the form of the coin and decides that it is valid and that change is needed.
["Form Checker:I", "Weight Checker>WeightCanNeedChange", "Form Checker:E_Form_Checked", "Form Checker.checkForm"]
//-- Rule 4

//    1.5 The form-checker sends a change-required signal (per the decision in step 1.4) to the change dispenser.
["Coin Component:I", "Form Checker>FormValidChangeNeeded", "Coin Component:E_Change_Required"]
//-- Rule 4

["Payment Component:I", "Coin Component>ChangeRequired", "Change Component"]
//-- Rule 2

//    1.6 The change dispenser receives the change-required signal and decides that the available change is sufficient.
//    1.7 The change dispenser dispenses change to the artifact-box.
["Change Component:I", "Coin Component>ChangeRequired", "Change Dispenser"]
//-- Rule 3
//-- Rule 2

["Change Dispenser:I", "Coin Component>ChangeRequired", "Change Dispenser:E_Change_Dispensed", "Change Dispenser.dispenseChange"]
//-- Rule 4

//    1.8 The change dispenser sends a confirmation signal (per the decision in step 1.6) to the form-checker.
["Change Component:I", "Change Dispenser>ChangeSufficient", "Change Component:E_Change_Done"]
//-- Rule 4

["Payment Component:I", "Change Component>ChangeDone", "Coin Component"]
//-- Rule 2

//    1.9 The form-checker receives the confirmation signal and sends the coin to the tresor and a payment-finalized signal to the locking mechanism.
["Coin Component:I", "Change Component>ChangeDone", "Form Checker"]
//-- Rule 2

["Form Checker:I", "Change Component>ChangeDone", "Form Checker:E_Payment_Finalized", "Form Checker.finalizePayment"]
//-- Rule 4

["Coin Component:I", "Form Checker>PaymentFinalized", "Coin Component:E_Payment_Finalized"]
//-- Rule 4

["Payment Component:I", "Coin Component>PaymentFinalized", "Payment Component:E_Payment_Finalized"]
//-- Rule 4

["Turnstile:Payment Component", "Payment Component>PaymentFinalized", "Access Component"]
//-- Rule 5: Cross-branch routing — result propagates up through parents (each exiting with E_*) until a common ancestor routes it to the target branch.

//    1.10 The locking mechanism receives the payment-finalized signal and unlocks the rotating arm.
["Access Component:I", "Payment Component>PaymentFinalized", "Lock Component"]
//-- Rule 2

["Lock Component:I", "Payment Component>PaymentFinalized", "Locking Mechanism"]
//-- Rule 3
//-- Rule 2

["Locking Mechanism:I", "Payment Component>PaymentFinalized", "Locking Mechanism:E_Unlocked", "Locking Mechanism.unlock"]
//-- Rule 4

//    1.11 The locking mechanism sends an unlocked signal to the light indicator and to the timer for the unlocked state.
["Lock Component:I", "Locking Mechanism>Unlocked", "Timer for Unlocked State"]
//-- Rule 2

["Timer for Unlocked State:I", "Locking Mechanism>Unlocked", "Timer for Unlocked State:E_Started", "Timer for Unlocked State.start"]
//-- Rule 4

["Lock Component:I", "Timer for Unlocked State>Started", "Lock Component:E_Unlocked"]
//-- Rule 4

["Access Component:I", "Lock Component>Unlocked", "Access Component:E_Unlocked"]
//-- Rule 4

["Turnstile:Access Component", "Access Component>Unlocked", "User Interface Component"]
//-- Rule 5

//    1.12 The light indicator receives the unlocked signal and displays green.
["User Interface Component:I", "Access Component>Unlocked", "Indicator Component"]
//-- Rule 2

["Indicator Component:I", "Access Component>Unlocked", "Light Indicator"]
//-- Rule 3
//-- Rule 2

["Light Indicator:I", "Access Component>Unlocked", "Light Indicator:E_Green", "Light Indicator.displayGreen"]
//-- Rule 4

["Indicator Component:I", "Light Indicator>Green", "Indicator Component:E_Displayed"]
//-- Rule 4

["User Interface Component:I", "Indicator Component>Displayed", "User Interface Component:E_Done"]
//-- Rule 4

["Turnstile:User Interface Component", "User Interface Component>Done", "Turnstile:Unlocked"]
//-- Rule 2

//    1.13 The timer for the unlocked state receives the unlocked signal and starts.
//-- Rule 6: Already covered by step 1.11 transitions (timer start was handled as part of the fan-out routing).

//    1.14 The user pushes the rotating arm and walks through.
//-- Rule 1.

//    1.15 The push sensor detects the user and sends a passage signal to the locking mechanism and to the light indicator.
["Turnstile:Unlocked", "Push Sensor>Passage", "Access Component"]
//-- Rule 2

["Access Component:I", "Push Sensor>Passage", "Lock Component"]
//-- Rule 2

["Lock Component:I", "Push Sensor>Passage", "Locking Mechanism"]
//-- Rule 3
//-- Rule 2

//    1.16 The locking mechanism receives the passage signal and locks the rotating arm.
["Locking Mechanism:I", "Push Sensor>Passage", "Locking Mechanism:E_Locked", "Locking Mechanism.lock"]
//-- Rule 4

["Lock Component:I", "Locking Mechanism>Locked", "Lock Component:E_Locked"]
//-- Rule 4

["Access Component:I", "Lock Component>Locked", "Access Component:E_Locked"]
//-- Rule 4

//    1.17 The light indicator receives the passage signal and displays red.
["Turnstile:Access Component", "Access Component>Locked", "User Interface Component"]
//-- Rule 5

["User Interface Component:I", "Access Component>Locked", "Indicator Component"]
//-- Rule 2

["Indicator Component:I", "Access Component>Locked", "Light Indicator"]
//-- Rule 3
//-- Rule 2

["Light Indicator:I", "Access Component>Locked", "Light Indicator:E_Red", "Light Indicator.displayRed"]
//-- Rule 4

["Indicator Component:I", "Light Indicator>Red", "Indicator Component:E_Displayed"]
//-- Rule 4

["User Interface Component:I", "Indicator Component>Displayed", "User Interface Component:E_Done"]
//-- Rule 4

["Turnstile:User Interface Component", "User Interface Component>Done", "Turnstile:Locked"]
//-- Rule 2