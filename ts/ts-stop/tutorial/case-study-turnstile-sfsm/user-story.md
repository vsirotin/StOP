# Turnstile: User Story

## Behavioral Overview

Turnstile is a device that allows one person to pass at a time. It is often used in public transport stations, amusement parks, and other places where you need to control access. The turnstile can be locked or unlocked, and it has a coin slot and banknote slot.

The turnstile can change money in some cases. 
It can also check the validity of the money inserted, and it return inserted artifacts, e.g. defect coins.

It has a light indicator and a sound indicator to show the service state.

The turnstile automatically moves into service state when there is not enough money for changing, some false artifacts or change is not returned within the given time, or some other service state is detected.

Some service workers can, with a special button, start the turnstile or restart it after service activities.

## Structure Overview

The turnstile is a physical device, that for user contains a big box with a rotating arm. The turnstile-box contains visible for user elements and hidden elements. 

The visible elements are: 
- a coin slot, 
- a banknote slot, 
- a artifact-box with glass window to see and get change or return inserted use-cases,
- a light indicator, 
- a service button.

The hidden elements are:
- a locking mechanism,
- a coin-receiver
- a weight-checker for inserted coins,
- a form-checker for inserted banknotes,
- a banknote-receiver,
- a banknote-checker,
- a change dispenser,
- a tresor for inserted valid coins and banknotes,
- a push sensor,
- a timer for artifact-box,
- a timer for unlocked state,
- a sound indicator.
