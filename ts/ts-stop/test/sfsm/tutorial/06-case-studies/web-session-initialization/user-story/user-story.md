# Session initialization: User Story

## Behavioral Overview

The session initialization is a process that establishes a secure and authenticated session between a web-client (in browser), app-server and special server like live server—for support of user communication with some AI-provider. 

User profile can be already saved (completely or partially) in local memory of the browser, or it can be provided by the user during the session initialization and saved there. The session initialization process includes:
1) reading from local memory or retrieving from browser of user's human language preference, setting it for the session and saving it in local memory for future sessions;
2) introduction of the user in his preferred human language to the General Data Protection Regulation (GDPR) and other privacy policies, and requesting his consent to the use of his personal data for the session (if it did not happen in previous sessions and was not saved in local memory);
3) check of availability and version of app-server;
4) check of correctness of used by call of app promo code (if it is used) and its validity for the session;
5) check of availability of used by call application data;
6) check of availability AI-provider server;
7) completion of the session initialization process and transition to the next state of the session.

If by step 2 the user does not give his consent to the use of his personal data for the session, the session initialization process is stopped, some static page is displayed and the session is terminated.

If by step 3, 5 or 6 the check fails, the session initialization process is stopped, corresponding static page is displayed and the session is terminated.

With valid promocode is coupled with some amount of internal currency (e.g. tokens). If by step 4 the check of promocode fails (false, old promocode or amount of internal currency too low), the special page with proposal to buy new promocode is displayed. 
If user buys new promocode, this information is saved in session and in local memory of the browser for future sessions. If user does not buy new promocode, the session initialization process is stopped, corresponding static page is displayed and the session is terminated.
If promocode is valid, the amount of internal currency is acceptable for the session, this information is saved in session.


By each page initialization (F5 or F11) the session initialization process is repeated, but some steps can be skipped if they were already completed in previous session initialization and saved in local memory of the browser.


## Structure Overview
The session initialization process consists of:
- a web-client (in browser) with
-- UI part
-- local memory
- app-server
- special server.