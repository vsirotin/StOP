# Business Use Cases — Web Session Initialization

Base user story: [Session initialization: User Story](../user-story/user-story.md)

---

# UC-01: Complete session initialization
## Description
The user loads the web application in the browser, starting the session initialization process. The web-client reads the user's language preference from the browser local memory or asks the user to enter it, sets it for the current session, and saves it for future sessions. If consent was not saved previously, the web-client introduces the user to the General Data Protection Regulation and the privacy policy in the user's preferred language and requests consent. The web-client validates the app-server availability and version, the used promo code and its coupled amount of internal currency (when a promo code is used), the availability of the application data, and the availability of the AI-provider. When all checks pass, the web-client completes the session initialization and transitions to the next session state.
## Actors
- User
## Internal objects
- Web-client interface
- Browser local memory
- Consent page
- App-server
- Live server
- AI-provider

---

# UC-02: Decline privacy consent
## Description
During consent request the user declines to allow the use of personal data for the session. The web-client stops the session initialization process, displays an error page, and terminates the session.
## Actors
- User
## Internal objects
- Consent page
- Error page

---

# UC-03: App-server unavailable
## Description
The web-client validates the app-server availability and version; the check fails because the app-server is unavailable or its version is incompatible. The web-client stops the session initialization process, displays an error page, and terminates the session.
## Actors
- User
## Internal objects
- App-server
- Error page

---

# UC-04: Invalid promo code
## Description
The user uses a promo code that is invalid, expired, or coupled with an insufficient amount of internal currency. The web-client stops the promo code check and displays a purchase page proposing a new promo code.
## Actors
- User
## Internal objects
- App-server
- Purchase page

---

# UC-05: Purchase new promo code
## Description
The user buys a new promo code on the purchase page. The web-client saves the new promo code information in the session and in the browser local memory for future sessions, then continues the session initialization by validating the application data and the AI-provider, and completes the session when all checks pass.
## Actors
- User
## Internal objects
- Purchase page
- Web-client interface
- Browser local memory
- App-server
- Live server
- AI-provider

---

# UC-06: Decline to purchase new promo code
## Description
The user does not buy a new promo code. The web-client stops the session initialization process, displays an error page, and terminates the session.
## Actors
- User
## Internal objects
- Purchase page
- Error page

---

# UC-07: Application data unavailable
## Description
The web-client validates the availability of the application data used by the call; the check fails. The web-client stops the session initialization process, displays an error page, and terminates the session.
## Actors
- User
## Internal objects
- App-server
- Error page

---

# UC-08: AI-provider unavailable
## Description
The web-client validates the availability of the AI-provider; the check fails. The web-client stops the session initialization process, displays an error page, and terminates the session.
## Actors
- User
## Internal objects
- AI-provider
- Error page

---

# UC-09: Session re-initialization on page reload
## Description
On each page reload the web-client repeats the session initialization process, skipping any step already completed in a previous initialization and saved in the browser local memory. It then completes the initialization and transitions to the next session state.
## Actors
- User
## Internal objects
- Web-client interface
- Browser local memory