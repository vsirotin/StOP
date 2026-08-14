# Transformation Trace — Web Session Initialization SFSM Model

This file traces the transformation of each business-model transition (in
`../business-model/state-machine.md`) into an SFSM signal/command transition in
`sfsm.ext.json`.

## Design decisions

- **Single root FA `Session`.** The session-initialization business machine is a
  strictly sequential workflow with no internal concurrency. It is therefore
  modelled as one root finite automaton `Session`. The work that the business
  machine assigns to components is performed by **command receivers**:
  `Browser local memory`, `App-server`, and `AI-provider` declare commands whose
  result signals are fed back into the FA via `commands.json`. (The SFSM model
  extends the business model with technical detail; see `stop-sfsm-modeller`
  skill §1.)
- **Signal naming.** `<Sender>><signal>` convention. External user actions are
  `User>...` signals documented as events on the `User` component. Component
  results are signals produced by the components' commands.
- **Command naming.** `<Component>.<command>` (e.g. `App-server.checkPromoCode`).

## Signal mapping (business event → SFSM signal)

| Business event | SFSM signal | Sender |
|---|---|---|
| Page loaded | `User>Page loaded` | User |
| Language preference retrieved | `Browser local memory>Language preference retrieved` | Browser local memory (command `...readPreference`) |
| Language preference entered | `User>Language preference entered` | User |
| Consent given | `User>Consent given` | User |
| Consent declined | `User>Consent declined` | User |
| App-server available | `App-server>App-server available` | App-server (command `...checkAvailability`) |
| App-server unavailable | `App-server>App-server unavailable` | App-server |
| Promo code valid | `App-server>Promo code valid` | App-server (command `...checkPromoCode`) |
| Promo code not used | `App-server>Promo code not used` | App-server |
| Promo code invalid | `App-server>Promo code invalid` | App-server |
| New promo code purchased | `User>New promo code purchased` | User |
| New promo code not purchased | `User>New promo code not purchased` | User |
| Application data available | `App-server>Application data available` | App-server (command `...checkAppData`) |
## Transition-by-transition trace

Business `ON <event> -> <state>` from `../business-model/state-machine.md`, mapped
to the SFSM transition in the `Session` FA `ts` list.

1. `Session Start --Page loaded--> Reading User Preferences`
   - `["I", "User>Page loaded", "Reading User Preferences", "Browser local memory.readPreference"]`
   - Command `readPreference` returns `Browser local memory>Language preference retrieved`.
2. `Reading User Preferences --Language preference retrieved--> Consent Request`
   - `["Reading User Preferences", "Browser local memory>Language preference retrieved", "Consent Request"]`
3. `Reading User Preferences --Language preference entered--> Consent Request`
   - `["Reading User Preferences", "User>Language preference entered", "Consent Request"]`
4. `Consent Request --Consent given--> App-server Check`
   - `["Consent Request", "User>Consent given", "App-server Check", "App-server.checkAvailability"]`
5. `Consent Request --Consent declined--> Session Terminated`
   - `["Consent Request", "User>Consent declined", "Session Terminated"]`
6. `App-server Check --App-server available--> Promo code Check`
   - `["App-server Check", "App-server>App-server available", "Promo code Check", "App-server.checkPromoCode"]`
7. `App-server Check --App-server unavailable--> Session Terminated`
   - `["App-server Check", "App-server>App-server unavailable", "Session Terminated"]`
8. `Promo code Check --Promo code valid--> Application Data Check`
   - `["Promo code Check", "App-server>Promo code valid", "Application Data Check", "App-server.checkAppData"]`
9. `Promo code Check --Promo code not used--> Application Data Check`
   - `["Promo code Check", "App-server>Promo code not used", "Application Data Check", "App-server.checkAppData"]`
10. `Promo code Check --Promo code invalid--> Purchase Proposal`
    - `["Promo code Check", "App-server>Promo code invalid", "Purchase Proposal"]`
11. `Purchase Proposal --New promo code purchased--> Application Data Check`
    - `["Purchase Proposal", "User>New promo code purchased", "Application Data Check", "App-server.checkAppData"]`
12. `Purchase Proposal --New promo code not purchased--> Session Terminated`
    - `["Purchase Proposal", "User>New promo code not purchased", "Session Terminated"]`
13. `Application Data Check --Application data available--> AI-provider Check`
    - `["Application Data Check", "App-server>Application data available", "AI-provider Check", "AI-provider.checkAvailability"]`
14. `Application Data Check --Application data unavailable--> Session Terminated`
    - `["Application Data Check", "App-server>Application data unavailable", "Session Terminated"]`
15. `AI-provider Check --AI-provider available--> Session Established`
    - `["AI-provider Check", "AI-provider>AI-provider available", "Session Established"]`
16. `AI-provider Check --AI-provider unavailable--> Session Terminated`
    - `["AI-provider Check", "AI-provider>AI-provider unavailable", "Session Terminated"]`
17. `Session Established --Page reload--> Reading User Preferences`
    - `["Session Established", "User>Page reload", "Reading User Preferences", "Browser local memory.readPreference"]`

## Notes

- The business `Consent already saved` branch is represented in the SFSM by a
  previously-given consent (`User>Consent given`) — a saved consent decision is
  behaviourally equivalent to an explicitly given one at the SFSM level.
- Terminal states `Session Established` and `Session Terminated` are absorbing:
  the FA stops there (unless a `Page reload` re-enters from `Session Established`).
| Application data unavailable | `App-server>Application data unavailable` | App-server |
| AI-provider available | `AI-provider>AI-provider available` | AI-provider (command `...checkAvailability`) |
| AI-provider unavailable | `AI-provider>AI-provider unavailable` | AI-provider |
| Page reload | `User>Page reload` | User |