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

