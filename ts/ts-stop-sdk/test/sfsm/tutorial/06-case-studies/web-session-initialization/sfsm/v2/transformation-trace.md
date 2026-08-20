# Transformation Trace — Web Session Initialization SFSM Model (v2)

This document records how each business-model transition (in
`../business-model/state-machine.md`) is mapped into the SFSM model in
`sfsm.ext.json`, together with the refinements applied in this version.

## v2 refinements

- **`User` renamed to `UI`** and moved under the `Web Client` component, because
  the user actions arrive through the browser user interface.
- **`readPreference` renamed to `readUserProfile`**. The command reads the whole
  user profile (language preference and consent decision) from the browser local
  memory, returning one of two results:
  - `User Profile retrieved completely` — the profile already contains the
    consent decision, so the consent step is skipped (`-> App-server Check`);
  - `User Profile retrieved without consent` — the consent step is required
    (`-> Showing Consent Page`).
- **Removed the `Language preference entered` transition**: once the user selects
  a language, the UI framework updates the interface automatically.
- **Terminal states use the `E_` exit convention**:
  `Session Terminated -> E_Session_Terminated`, `Session Established ->
  E_Session_Established`. Reaching an exit state returns the root `Session` FA to
  its initial state `I` (ready for the next page load).
- **UI page-presentation commands** are issued so the user is always shown the
  relevant page: the user-profile page, the consent page, the purchase page, and
  the error page.
- **`Promo code not used` replaced by `Promo code too small tokens`**, which (like
  an invalid promo code) routes to the purchase page.
- **Page reload is a joker-state transition** (`["*", "UI>Page reload", ...]`) so
  a reload is handled from any state.

## Signal mapping (business event → SFSM signal)

| Business event | SFSM signal | Sender |
|---|---|---|
| Page loaded | `UI>Page loaded` | UI (event) |
| User profile retrieved (complete) | `Browser local memory>User Profile retrieved completely` | Browser local memory (command `...readUserProfile`) |
| User profile retrieved (no consent) | `Browser local memory>User Profile retrieved without consent` | Browser local memory |
| Consent given | `UI>Consent given` | UI (event) |
| Consent declined | `UI>Consent declined` | UI (event) |
| App-server available | `App-server>App-server available` | App-server (command `...checkAvailability`) |
| App-server unavailable | `App-server>App-server unavailable` | App-server |
| Promo code valid | `App-server>Promo code valid` | App-server (command `...checkPromoCode`) |
| Promo code too small tokens | `App-server>Promo code too small tokens` | App-server |
| Promo code invalid | `App-server>Promo code invalid` | App-server |
| New promo code purchased | `UI>New promo code purchased` | UI (event) |
| New promo code not purchased | `UI>New promo code not purchased` | UI (event) |
| Application data available | `App-server>Application data available` | App-server (command `...checkAppData`) |
| Application data unavailable | `App-server>Application data unavailable` | App-server |
| AI-provider available | `AI-provider>AI-provider available` | AI-provider (command `...checkAvailability`) |
| AI-provider unavailable | `AI-provider>AI-provider unavailable` | AI-provider |
| Page reload | `UI>Page reload` | UI (event) |

## Transitions in the `Session` FA

Each line is a triple/quadruple `[from, signal, to, command?]`.

1. `["I", "UI>Page loaded", "Showing User Profile Page", "UI.presentUserProfilePage"]` — the page is presented; the UI confirms with `UI>User Profile page presented`.
2. `["Showing User Profile Page", "UI>User Profile page presented", "Reading User Profile", "Browser local memory.readUserProfile"]` — the profile is read from the browser local memory.
3. `["Reading User Profile", "Browser local memory>User Profile retrieved completely", "App-server Check", "App-server.checkAvailability"]` — consent already present, the app-server check starts.
4. `["Reading User Profile", "Browser local memory>User Profile retrieved without consent", "Showing Consent Page", "UI.presentConsentPage"]` — consent is requested.
5. `["Showing Consent Page", "UI>Consent page presented", "Consent Request"]` — UI confirms the consent page is shown.
6. `["Consent Request", "UI>Consent given", "App-server Check", "App-server.checkAvailability"]` — consent given; the app-server check starts.
7. `["Consent Request", "UI>Consent declined", "Showing Error Page", "UI.presentErrorPage"]` — consent refused; an error page is shown.
8. `["Showing Error Page", "UI>Error page presented", "E_Session_Terminated"]` — the session terminates.
9. `["App-server Check", "App-server>App-server available", "Promo code Check", "App-server.checkPromoCode"]` — server OK; the promo-code check starts.
10. `["App-server Check", "App-server>App-server unavailable", "Showing Error Page", "UI.presentErrorPage"]` — server unavailable; termination path.
11. `["Promo code Check", "App-server>Promo code valid", "Application Data Check", "App-server.checkAppData"]` — promo code accepted; the application-data check starts.
12. `["Promo code Check", "App-server>Promo code too small tokens", "Showing Purchase Page", "UI.presentPurchasePage"]` — insufficient tokens; the user is offered a purchase.
13. `["Promo code Check", "App-server>Promo code invalid", "Showing Purchase Page", "UI.presentPurchasePage"]` — invalid promo code; the user is offered a purchase.
14. `["Showing Purchase Page", "UI>Purchase page presented", "Purchase Proposal"]` — the purchase page is shown.
15. `["Purchase Proposal", "UI>New promo code purchased", "Application Data Check", "App-server.checkAppData"]` — the user buys a new promo code; the application-data check starts.
16. `["Purchase Proposal", "UI>New promo code not purchased", "Showing Error Page", "UI.presentErrorPage"]` — the user declines to buy; termination path.
17. `["Application Data Check", "App-server>Application data available", "AI-provider Check", "AI-provider.checkAvailability"]` — application data present; the AI-provider check starts.
18. `["Application Data Check", "App-server>Application data unavailable", "Showing Error Page", "UI.presentErrorPage"]` — application data missing; termination path.
19. `["AI-provider Check", "AI-provider>AI-provider available", "E_Session_Established"]` — all checks pass; the session is established.
20. `["AI-provider Check", "AI-provider>AI-provider unavailable", "Showing Error Page", "UI.presentErrorPage"]` — AI-provider unavailable; termination path.
21. `["*", "UI>Page reload", "Showing User Profile Page", "UI.presentUserProfilePage"]` — a page reload from any state restarts initialization.

## Notes

- Exit states (`E_Session_Established`, `E_Session_Terminated`) have no outgoing
  transitions. When the root `Session` FA reaches an exit state it returns to its
  initial state `I`; consequently the reported final head-state of a run is `I`.
- Validation of this model reports `0 errors, 0 warnings` with
  `--suppress 10` (rule 10 is the expected "exit-state signal not handled by an
  ancestor" warning for the root's own exit states).