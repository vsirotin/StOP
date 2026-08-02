# Turnstile: Use Cases

1. Happy path with coin and changing:
    1.1 User insert a coin in the coin slot.
    1.3 The coin-receiver register the coin and push coin to the weight-checker.
    1.4 The weight-checker checks the weight of the coin and forwards it to the form-checker.
    1.5 The form-checker checks the form of the coin and identifies it as a valid coin and determines that change is needed.
    1.6 The change dispenser dispenses change to the artifact-box.
    1.7 The form-checker pushes the coin to the tresor.
    1.8 The turnstile unlocks and the light indicator shows green. 
    1.9 The user pushes the turnstile arm and walks through.
    1.10 The push sensor detects the user and the turnstile locks again, the light indicator shows red.

2. Happy path with banknote and changing:
    2.1 User insert a banknote in the banknote slot.
    2.3 The banknote-receiver register the banknote and push it to the banknote-checker.
    2.4 The banknote-checker checks the form of the banknote and identifies it as a valid banknote and determines that change is needed.
    2.5 The change dispenser dispenses change to the artifact-box.
    2.6 The banknote-checker pushes the banknote to the tresor.
    Steps 1.8-1.10

3. Happy path with coin and no changing:
    Steps 1.1-1.5, 1.7, 1.8-1.10

4. Happy path with banknote and no changing:
    Steps 2.1-2.5, 2.6, 1.8-1.10

 5. User pays with a false coin:
    5.1 User insert a coin in the coin slot.
    5.2 The coin-receiver register the coin and push coin to the weight-checker.
    5.3 The weight-checker checks the weight of the coin and forwards it to the form-checker.
    5.4 The form-checker checks the form of the coin and identifies it as a false coin and pushes it to the artifact-box.
    5.5 The light indicator shows red.
    5.6 User get the false coin from the artifact-box.

  6. User don't get false coin from the artifact-box within the given time:
    Steps 5.1-5.6
    6.1 The timer for artifact-box detects that the user don't get the false coin from the artifact-box within the given time.
    6.2 The turnstile moves into service state, the light indicator shows red, the sound indicator plays a warnin-sound.
    6.3 The service worker gets the artifact from the artifact-box, presses the service button, and the turnstile moves into normal state, the light indicator shows red.
