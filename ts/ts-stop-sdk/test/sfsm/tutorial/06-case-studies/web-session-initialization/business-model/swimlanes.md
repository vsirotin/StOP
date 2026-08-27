# Swimlanes — Web Session Initialization

Base user story: [Session initialization: User Story](../user-story/user-story.md)

---

# Swimlane User Interaction

This swimlane contains the objects that the user directly touches or perceives during session initialization.

- **Web-client interface** — The interface where the user enters the language preference and interacts with the web application during session initialization.
- **Consent page** — The page that introduces the user to the General Data Protection Regulation and the privacy policy and requests consent to use personal data.
- **Purchase page** — The page proposing the purchase of a new promo code when the used promo code is invalid, expired, or has insufficient internal currency.
- **Error page** — The page displayed when a check fails or the user declines consent, indicating that the session was terminated.

---

# Swimlane Local Data

This swimlane contains the object responsible for storing data across sessions in the browser.

- **Browser local memory** — Stores the language preference, the consent decision, and the promo code information across sessions, so that completed initialization steps can be skipped on later reloads.

---

# Swimlane Backend Validation

This swimlane contains the objects responsible for validating availability, versions, and data during session initialization.

- **App-server** — Validates its own availability and version, validates a used promo code and its coupled amount of internal currency, and provides the application data whose availability is checked.
- **Live server** — Supports the user's communication with the AI-provider once the session is established.

---

# Swimlane External Integration

This swimlane contains the external object with which the web-client establishes the session for user communication.

- **AI-provider** — The external AI service that the user communicates with; the web-client validates its availability during session initialization.
