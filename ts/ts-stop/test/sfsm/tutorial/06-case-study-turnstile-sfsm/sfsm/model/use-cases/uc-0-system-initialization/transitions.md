// Use case 0: System initialization
// Source: turnstile-use-cases.md

//0. System initialization:
//    0.1 The service worker presses the service button.
//-- Rule 1: External events are not converted into transitions
//-- New event discovered: Service Button > service_button_pressed > signal "Service Button>Pressed"

//    0.2 The turnstile receives the button press and transitions to the locked state.
["Turnstile:I", "Service Button>Pressed", "Turnstile:Locked"]
//-- Rule 2: Simple state transition