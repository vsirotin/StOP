# Turnstile: User Story

## Behavioral Overview

The turnstile is a physical access-control device that allows one person to pass at a time, typically deployed in public transport stations, amusement parks, and similar venues. The turnstile accepts coins and banknotes through dedicated slots, validates them, dispenses change when required, and unlocks the rotating arm for passage upon successful payment; the light indicator shows green when unlocked and red when locked. Invalid coins or banknotes are returned to the user through the artifact-box. The turnstile automatically transitions to a service state when insufficient change is available, when a user fails to retrieve a returned artifact within the allotted time, or when a hardware fault is detected; in this state, the light indicator shows red and the sound indicator emits a warning signal. A service worker can restart the turnstile from the service state by pressing the service button after completing maintenance activities.

## Structure Overview

The turnstile consists of a physical enclosure containing a rotating arm, with visible and hidden elements.

Visible elements:
- a coin slot
- a banknote slot
- an artifact-box with a glass window for retrieving change and returned items
- a light indicator
- a service button

Hidden elements:
- a locking mechanism
- a coin-receiver
- a weight-checker for inserted coins
- a form-checker for inserted coins
- a banknote-receiver
- a banknote-checker
- a change dispenser
- a tresor for storing valid coins and banknotes
- a push sensor
- a timer for the artifact-box
- a timer for the unlocked state
- a sound indicator