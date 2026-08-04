# Turnstile: Use Cases

Base user story: [Turnstile: User Story](user-story.md)

1. Happy path with coin and change:
    1.1 The user inserts a coin in the coin slot.
    1.2 The coin-receiver receives the coin and sends it to the weight-checker.
    1.3 The weight-checker validates the weight of the coin and sends it to the form-checker.
    1.4 The form-checker validates the form of the coin and decides that it is valid and that change is needed.
    1.5 The form-checker sends a change-required signal (per the decision in step 1.4) to the change dispenser.
    1.6 The change dispenser receives the change-required signal and decides that the available change is sufficient.
    1.7 The change dispenser dispenses change to the artifact-box.
    1.8 The change dispenser sends a confirmation signal (per the decision in step 1.6) to the form-checker.
    1.9 The form-checker receives the confirmation signal and sends the coin to the tresor and a payment-finalized signal to the locking mechanism.
    1.10 The locking mechanism receives the payment-finalized signal and unlocks the rotating arm.
    1.11 The locking mechanism sends an unlocked signal to the light indicator and to the timer for the unlocked state.
    1.12 The light indicator receives the unlocked signal and displays green.
    1.13 The timer for the unlocked state receives the unlocked signal and starts.
    1.14 The user pushes the rotating arm and walks through.
    1.15 The push sensor detects the user and sends a passage signal to the locking mechanism and to the light indicator.
    1.16 The locking mechanism receives the passage signal and locks the rotating arm.
    1.17 The light indicator receives the passage signal and displays red.

2. Happy path with banknote and change:
    2.1 The user inserts a banknote in the banknote slot.
    2.2 The banknote-receiver receives the banknote and sends it to the banknote-checker.
    2.3 The banknote-checker validates the form of the banknote and decides that it is valid and that change is needed.
    2.4 The banknote-checker sends a change-required signal (per the decision in step 2.3) to the change dispenser.
    2.5 The change dispenser receives the change-required signal and decides that the available change is sufficient.
    2.6 The change dispenser dispenses change to the artifact-box.
    2.7 The change dispenser sends a confirmation signal (per the decision in step 2.5) to the banknote-checker.
    2.8 The banknote-checker receives the confirmation signal and sends the banknote to the tresor and a payment-finalized signal to the locking mechanism.
    Steps 1.10–1.17

3. Happy path with coin and no change:
    Steps 1.1–1.3
    3.1 The form-checker validates the form of the coin and decides that it is valid and that no change is needed.
    3.2 The form-checker sends the coin to the tresor and a payment-finalized signal to the locking mechanism.
    Steps 1.10–1.17

4. Happy path with banknote and no change:
    Steps 2.1–2.2
    4.1 The banknote-checker validates the form of the banknote and decides that it is valid and that no change is needed.
    4.2 The banknote-checker sends the banknote to the tresor and a payment-finalized signal to the locking mechanism.
    Steps 1.10–1.17

5. Invalid coin returned to user:
    Steps 1.1–1.3
    5.1 The form-checker validates the form of the coin and decides that it is invalid.
    5.2 The form-checker sends the coin to the artifact-box, a start signal to the timer for the artifact-box, and an invalid-coin signal to the light indicator.
    5.3 The timer for the artifact-box receives the start signal and starts.
    5.4 The light indicator receives the invalid-coin signal and displays red.
    5.5 The user retrieves the invalid coin from the artifact-box.

6. Invalid banknote returned to user:
    Steps 2.1–2.2
    6.1 The banknote-checker validates the form of the banknote and decides that it is invalid.
    6.2 The banknote-checker sends the banknote to the artifact-box, a start signal to the timer for the artifact-box, and an invalid-banknote signal to the light indicator.
    6.3 The timer for the artifact-box receives the start signal and starts.
    6.4 The light indicator receives the invalid-banknote signal and displays red.
    6.5 The user retrieves the invalid banknote from the artifact-box.

7. Returned artifact not retrieved within allotted time:
    Steps 5.1–5.3
    7.1 The timer for the artifact-box (started at step 5.3) detects that the user does not retrieve the invalid coin from the artifact-box within the allotted time and sends an expired signal to the turnstile.
    7.2 The turnstile receives the expired signal and transitions to the service state.
    7.3 The turnstile sends a service-state signal to the light indicator and to the sound indicator.
    7.4 The light indicator receives the service-state signal and displays red.
    7.5 The sound indicator receives the service-state signal and notifies the user with a warning signal.
    7.6 The service worker retrieves the artifact from the artifact-box.
    7.7 The service worker presses the service button.
    7.8 The turnstile receives the button press and transitions to the normal state.
    7.9 The turnstile sends a normal-state signal to the light indicator.
    7.10 The light indicator receives the normal-state signal and displays red.

8. Insufficient change detected:
    Steps 1.1–1.5
    8.1 The change dispenser receives the change-required signal and decides that the available change is insufficient.
    8.2 The change dispenser sends an insufficient-change signal to the form-checker and a service-required signal to the turnstile.
    8.3 The form-checker receives the insufficient-change signal and sends the coin to the artifact-box and a start signal to the timer for the artifact-box.
    8.4 The timer for the artifact-box receives the start signal and starts.
    8.5 The turnstile receives the service-required signal and transitions to the service state.
    8.6 The turnstile sends a service-state signal to the light indicator and to the sound indicator.
    8.7 The light indicator receives the service-state signal and displays red.
    8.8 The sound indicator receives the service-state signal and notifies the user with a warning signal.
    8.9 The user retrieves the coin from the artifact-box.
    8.10 The service worker restocks the change dispenser.
    8.11 The service worker presses the service button.
    8.12 The turnstile receives the button press and transitions to the normal state.
    8.13 The turnstile sends a normal-state signal to the light indicator.
    8.14 The light indicator receives the normal-state signal and displays red.

9. Hardware fault detected:
    9.1 The turnstile detects a hardware fault and transitions to the service state.
    9.2 The turnstile sends a service-state signal to the light indicator and to the sound indicator.
    9.3 The light indicator receives the service-state signal and displays red.
    9.4 The sound indicator receives the service-state signal and notifies the user with a warning signal.
    9.5 The service worker presses the service button.
    9.6 The turnstile receives the button press and transitions to the normal state.
    9.7 The turnstile sends a normal-state signal to the light indicator.
    9.8 The light indicator receives the normal-state signal and displays red.

10. Unlocked state timeout:
    Steps 1.1–1.13
    10.1 The timer for the unlocked state (started at step 1.13) detects that the user does not pass through within the allotted time and sends an expired signal to the locking mechanism.
    10.2 The locking mechanism receives the expired signal and locks the rotating arm.
    10.3 The locking mechanism sends a locked signal to the light indicator.
    10.4 The light indicator receives the locked signal and displays red.