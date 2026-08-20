# Tuning Notes for the Web Session Initialization SFSM Model (v2)

The v1 result
(`ts/ts-stop/test/sfsm/tutorial/06-case-studies/web-session-initialization/sfsm/v1/sfsm.ext.json`)
is a valid draft, but it does not yet reflect practical-experience
considerations. This document lists the required adjustments. In the items
below, `L<number>` refers to a line number in the v1 file
`v1/sfsm.ext.json`.

## Required adjustments

**1. Rename the `User` component to `UI` and place it under the `Web Client`
component (L100, L26).**
User actions are received through the browser user interface, so the component
that owns the user-facing signals and commands should be named `UI` and belong
to `Web Client`.

**2. Rename the command `readPreference` to `readUserProfile` (L6, L22).**
The command reads the user profile (not only the language preference), so its
name should reflect that scope.

**3. Rename and split the profile-retrieval step (L7).**
- Rename the state `Reading User Preferences` to `Reading User Profile`.
- Replace the signal `Browser local memory>Language preference retrieved` with
  two alternatives:
  - `Browser local memory>User Profile retrieved completely` — the profile
    already contains the consent decision; in this case go to `App-server Check`.
  - `Browser local memory>User Profile retrieved without consent` — consent must
    still be requested.

**4. Request the user data through a dedicated page (L7, L15).**
Whenever the system must request data from the user (for example the profile
data or the purchase decision), it should present the corresponding page. Add a
UI command, issued at the end of these transitions, that presents the relevant
page to the user.

**5. Remove the `Language preference entered` transition (L8).**
Once the user selects a language, the UI framework updates the interface
automatically; no explicit transition is needed.

**6. Rename the terminal state `Session Terminated` to `E_Session_Terminated`
(L10, L12, L17, L19, L21).**
It is a final state, so it should follow the SFSM exit-state (`E_`) convention.
On each of these transitions, issue a UI command (the same command with
different arguments) that presents the corresponding page to the user.

**7. Treat a promo-code balance that is too small as a purchase trigger
(L14).**
Replace the transition
`["Promo code Check", "App-server>Promo code not used", "Application Data Check", "App-server.checkAppData"]`
with
`["Promo code Check", "App-server>Promo code too small tokens", "Purchase Proposal", "UI.Present page for purchase promo code"]`.

**8. Present the purchase page on the promo-code-invalid transition (L15).**
Add a UI command to this transition so the page proposing a new promo code is
presented to the user.

**9. Rename the final state `Session Established` to `E_Session_Established`
(L20).**
It is a final state and should follow the exit-state (`E_`) convention.

**10. Make page reload work from any state (L22).**
Replace the transition from `["Session Established", "User>Page reload", ...]`
with a joker-state transition `["*", "User>Page reload", ...]`, because a page
reload can happen while the system is in any state.