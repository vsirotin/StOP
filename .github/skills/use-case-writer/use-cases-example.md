# Turnstile: Use Cases

Base user story: [Turnstile: User Story](user-story.md)

1. Happy path with coin and change:
    1.1 The user inserts a coin in the coin slot.
    1.2 The coin-receiver receives the coin and sends it to the weight-checker.
    1.3 The weight-checker validates the weight of the coin and sends it to the form-checker.
    1.4 The form-checker validates the form of the coin.
    1.5 The form-checker decides that the coin is valid and that change is needed.
    1.6 The change dispenser dispenses change to the artifact-box.
    1.7 The form-checker sends the coin to the tresor.
    1.8 The locking mechanism unlocks the rotating arm.
    1.9 The light indicator displays green.
    1.10 The user pushes the rotating arm and walks through.
    1.11 The push sensor detects the user.
    1.12 The locking mechanism locks the rotating arm.
    1.13 The light indicator displays red.

2. Happy path with banknote and change:
    2.1 The user inserts a banknote in the banknote slot.
    2.2 The banknote-receiver receives the banknote and sends it to the banknote-checker.
    2.3 The banknote-checker validates the form of the banknote.
    2.4 The banknote-checker decides that the banknote is valid and that change is needed.
    2.5 The change dispenser dispenses change to the artifact-box.
    2.6 The banknote-checker sends the banknote to the tresor.
    Steps 1.8–1.13

3. Happy path with coin and no change:
    Steps 1.1–1.4
    3.1 The form-checker decides that the coin is valid and that no change is needed.
    3.2 The form-checker sends the coin to the tresor.
    Steps 1.8–1.13

4. Happy path with banknote and no change:
    Steps 2.1–2.3
    4.1 The banknote-checker decides that the banknote is valid and that no change is needed.
    4.2 The banknote-checker sends the banknote to the tresor.
    Steps 1.8–1.13

5. Invalid coin returned to user:
    Steps 1.1–1.4
    5.1 The form-checker decides that the coin is invalid.
    5.2 The form-checker sends the coin to the artifact-box.
    5.3 The light indicator displays red.
    5.4 The user retrieves the invalid coin from the artifact-box.

6. Invalid banknote returned to user:
    Steps 2.1–2.3
    6.1 The banknote-checker decides that the banknote is invalid.
    6.2 The banknote-checker sends the banknote to the artifact-box.
    6.3 The light indicator displays red.
    6.4 The user retrieves the invalid banknote from the artifact-box.

7. Returned artifact not retrieved within allotted time:
    Steps 5.1–5.3
    7.1 The timer for the artifact-box detects that the user does not retrieve the invalid coin from the artifact-box within the allotted time.
    7.2 The turnstile transitions to the service state.
    7.3 The light indicator displays red.
    7.4 The sound indicator notifies the user with a warning signal.
    7.5 The service worker retrieves the artifact from the artifact-box.
    7.6 The service worker presses the service button.
    7.7 The turnstile transitions to the normal state.
    7.8 The light indicator displays red.

8. Insufficient change detected:
    Steps 1.1–1.5
    8.1 The change dispenser validates the available change and decides that it is insufficient.
    8.2 The turnstile transitions to the service state.
    8.3 The light indicator displays red.
    8.4 The sound indicator notifies the user with a warning signal.
    8.5 The service worker presses the service button.
    8.6 The turnstile transitions to the normal state.
    8.7 The light indicator displays red.

9. Hardware fault detected:
    9.1 The turnstile detects a hardware fault.
    9.2 The turnstile transitions to the service state.
    9.3 The light indicator displays red.
    9.4 The sound indicator notifies the user with a warning signal.
    9.5 The service worker presses the service button.
    9.6 The turnstile transitions to the normal state.
    9.7 The light indicator displays red.

10. Unlocked state timeout:
    Steps 1.1–1.9
    10.1 The timer for the unlocked state detects that the user does not pass through within the allotted time.
    10.2 The locking mechanism locks the rotating arm.
    10.3 The light indicator displays red.