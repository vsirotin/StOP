# Session initialization: User Story

## Behavioral Overview

The web-client establishes a secure, authenticated session that connects the user, operating in a browser, with an app-server and a live server, enabling the user to communicate with an AI-provider. During initialization the web-client reads the user's language preference from the browser local memory or asks the user to enter it, sets it for the current session, and saves it for future sessions. If consent was not saved in a previous session, the web-client introduces the user to the General Data Protection Regulation and the privacy policy in the user's preferred language and requests consent to use personal data; when the user declines, the web-client displays an error page and terminates the session. The web-client validates the app-server availability and version, the validity of a used promo code and its coupled amount of internal currency, the availability of the application data, and the availability of the AI-provider; when any of these checks fails, the web-client displays an error page and terminates the session. When a used promo code is invalid, expired, or coupled with an insufficient amount of internal currency, the web-client displays a purchase page proposing a new promo code; if the user buys a new promo code, the web-client saves that information in the session and in the browser local memory, otherwise it displays an error page and terminates the session. On each page reload the web-client repeats the initialization, skipping any step already completed and saved in a previous initialization, and then completes the session initialization and transitions to the next session state.

## Structure Overview

The session initialization involves a web-client with visible and hidden elements.

Visible elements:
- the web-client interface
- the consent page
- the purchase page
- an error page

Hidden elements:
- the browser local memory
- an app-server
- a live server
- an AI-provider