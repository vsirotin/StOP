# State Machine Web Session Initialization

Base user story: [Session initialization: User Story](../user-story/user-story.md)

---

## 1. States

- **Session Start** — The web application has been loaded in the browser; session initialization has not yet begun.
- **Reading User Preferences** — The web-client is reading the user's language preference from the browser local memory or asking the user to enter it, setting it for the session and saving it for future sessions.
- **Consent Request** — The web-client is introducing the user to the General Data Protection Regulation and the privacy policy and requesting consent to use personal data.
- **App-server Check** — The web-client is validating the availability and version of the app-server.
- **Promo code Check** — The web-client is validating a used promo code and its coupled amount of internal currency.
- **Purchase Proposal** — The web-client is displaying a purchase page proposing a new promo code.
- **Application Data Check** — The web-client is validating the availability of the application data used by the call.
- **AI-provider Check** — The web-client is validating the availability of the AI-provider.
- **Session Established** — All checks have passed; the session initialization is complete and the web-client transitions to the next session state.
- **Session Terminated** — Session initialization was stopped and the session was terminated.

---

## 2. Events

- **Page loaded** — The user loads the web application in the browser, starting session initialization.
- **Language preference retrieved** — The web-client reads the language preference from the browser local memory.
- **Language preference entered** — The user enters the language preference in the web-client interface.
- **Consent already saved** — The consent decision is stored in the browser local memory from a previous session.
- **Consent given** — The user agrees to the use of personal data for the session.
- **Consent declined** — The user refuses to allow the use of personal data for the session.
- **App-server available** — The app-server is reachable and its version is compatible.
- **App-server unavailable** — The app-server is unreachable or its version is incompatible.
- **Promo code not used** — The user did not provide a promo code for the call.
- **Promo code valid** — The used promo code is valid and its coupled amount of internal currency is sufficient.
- **Promo code invalid** — The used promo code is invalid, expired, or coupled with an insufficient amount of internal currency.
- **New promo code purchased** — The user buys a new promo code on the purchase page.
- **New promo code not purchased** — The user does not buy a new promo code.
- **Application data available** — The application data used by the call is available.
- **Application data unavailable** — The application data used by the call is unavailable.
- **AI-provider available** — The AI-provider is reachable.
- **AI-provider unavailable** — The AI-provider is unreachable.
- **Page reload** — The user reloads the page; session initialization is repeated.

---

## 3. State machine (textual representation)

```
STATE Session Start
    ON Page loaded                                             -> Reading User Preferences

STATE Reading User Preferences
    ON Language preference retrieved                           -> Consent Request
    ON Language preference entered                             -> Consent Request

STATE Consent Request
    ON Consent already saved                                   -> App-server Check
    ON Consent given                                           -> App-server Check
    ON Consent declined                                        -> Session Terminated

STATE App-server Check
    ON App-server available                                    -> Promo code Check
    ON App-server unavailable                                  -> Session Terminated

STATE Promo code Check
    ON Promo code not used                                     -> Application Data Check
    ON Promo code valid                                        -> Application Data Check
    ON Promo code invalid                                      -> Purchase Proposal

STATE Purchase Proposal
    ON New promo code purchased                                -> Application Data Check
    ON New promo code not purchased                            -> Session Terminated

STATE Application Data Check
    ON Application data available                              -> AI-provider Check
    ON Application data unavailable                            -> Session Terminated

STATE AI-provider Check
    ON AI-provider available                                   -> Session Established
    ON AI-provider unavailable                                 -> Session Terminated

STATE Session Established
    ON Page reload                                             -> Reading User Preferences

STATE Session Terminated
```
