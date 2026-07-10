# Test Plan – VWO Login Dashboard

## 1. Test Plan Identifier
**ID:** TP-VWO-LOGIN-002  
**Version:** 1.0  
**Date:** March 14, 2026  
**Prepared By:** Senior QA Tester  

---

## 2. Introduction / Objective
The objective of this document is to define a comprehensive testing strategy and scope for the VWO Login Dashboard (`https://app.vwo.com`). The login dashboard serves as the primary gateway for users to access VWO's experimentation, personalization, and analytics tools. This Test Plan focuses strictly on validating authentication flows, security protocols, user interface (UI) interactions, error handling, and cross-browser compatibility. It establishes clear guidelines for both manual exploratory testing and automated regression testing.

---

## 3. Scope of Testing
The testing scope encompasses all functionalities exposed on the VWO Login page.
- **Functional Testing:** Authentication workflows, input validations, forgot password functionality, and session persistence (Remember Me).
- **Security Testing:** Secure transmission (HTTPS), brute-force protection, rate limiting, and password masking.
- **Usability Testing:** Accessibility compliance (Screen readers, ARIA labels), responsiveness, and logical focus flow.
- **Compatibility Testing:** Cross-browser rendering and mobile/tablet responsiveness.
- **Integration Testing:** Post-login redirection and third-party SSO/Social login interactions.

---

## 4. Features to be Tested
- **Authentication System:** Standard Email/Password login, Multi-Factor Authentication (2FA) verification, Enterprise SSO routing, and Social Login providers.
- **User Input Validation:** Real-time email format validation, password masking, blur-event triggers, and injection protections.
- **Password Management:** Complete "Forgot Password" flow including secure token generation and password complexity compliance.
- **Session Management:** "Remember Me" persistence, session creation, and secure token handling.
- **Frontend / UX:** Loading indicators during authentication, distinct and clear error messaging, and autofocus on the primary email input.

---

## 5. Features Not to be Tested
Based on the provided PRD, the following modules are strictly out of scope for this Test Plan:
- Internal VWO experimentation and A/B testing modules.
- The Personalize module.
- Post-login Insights dashboards and reporting logic.
- Billing, subscription logic, and marketing integrations.

---

## 6. Test Strategy
A **Risk-Based Testing (RBT)** approach will be utilized, prioritizing critical authentication paths and high-risk security vulnerabilities over edge-case UI glitches.
- **Test Levels:** Integration Testing, System Testing, and User Acceptance Testing (UAT).
- **Test Types:** Functional, Security, Usability, and Cross-Browser Compatibility.
- **Approach:** Critical workflows (like valid login) and security measures (like rate limiting) will be fully automated for regression. Exploratory testing will capture nuanced UX issues and accessibility gaps.

---

## 7. Manual Testing Scope
Manual testing will focus on exploratory, usability, and visual validations where human intuition is crucial:
*   **UI/UX Validation:** Verifying responsive behavior across varying screen sizes, checking loading indicators, and ensuring correct tab-indexing/keyboard navigation.
*   **Accessibility Checks:** Verifying ARIA labels, high-contrast mode variations, and screen-reader logic.
*   **Exploratory Negative Testing:** Attempting to bypass validations using unexpected character inputs or interrupting the connection during login.
*   **Visual Error Checks:** Validating the clarity, color, and positioning of error messages upon login failure.
*   **Cross-Browser Behavior:** Manually verifying aesthetic consistency on Safari, Edge, Firefox, and Chrome.

---

## 8. Automation Testing Scope
Automation will focus on high-priority, repetitive regression scenarios to ensure long-term maintainability.
*   **Framework Approach:** Selenium WebDriver using Java and TestNG, structured on the **Page Object Model (POM)** design pattern. This enables us to maintain locators separately from the test scripts.
*   **Data-Driven Testing (DDT):** Reading variations of valid/invalid users from external sources (e.g., Excel/CSV) to run repetitive negative tests.
*   **Scenarios Suitable for Automation:**
    *   End-to-end positive login flow.
    *   Boundary and validation checks for empty fields and incorrect credentials.
    *   Form validation messages (e.g., invalid email formats).
    *   "Forgot Password" initial request flow.
    *   Password masking logic validation (checking `type="password"` attribute).
*   **Maintainability Considerations:** Tests will utilize robust locator strategies (IDs, CSS Selectors) and custom explicit waits instead of thread sleeps to handle network latencies upon app redirection.

---

## 9. Test Environment
*   **Application URL:** `https://app.vwo.com`
*   **Test Environment:** QA / Staging
*   **OS Supported:** Windows, macOS, Android, iOS
*   **Browsers Supported:** Google Chrome (Primary), Mozilla Firefox, Apple Safari, Microsoft Edge.
*   **Automation Stack:** Java 17+, Selenium WebDriver v4+, TestNG, Maven.

---

## 10. Test Data Requirements
Test data will be provisioned prior to test execution to avoid dependencies on live data:
*   **Valid Accounts:** Active standard user, Active admin user.
*   **Invalid Accounts:** Unregistered email, inactive/locked user accounts.
*   **Authentication Data:** Valid passwords, expired passwords, and intentionally misspelled variants.
*   **MFA / SSO Accounts:** Test accounts configured specifically for Enterprise SSO and 2FA flows.
*   **Edge Case Data:** Extremely long email strings, empty inputs, leading/trailing whitespace, XSS/SQL injection payloads (`' OR 1=1 --`).

---

## 11. Test Scenarios

### Positive Scenarios:
1.  **TC_POS_001:** Verify successful login with valid, registered email and password.
2.  **TC_POS_002:** Verify redirection to the VWO dashboard immediately after successful login.
3.  **TC_POS_003:** Verify successful login using active single sign-on (SSO) credentials.
4.  **TC_POS_004:** Verify the "Remember Me" checkbox retains user session upon browser restart.
5.  **TC_POS_005:** Verify the cursor autofocuses on the Email input field upon page load.
6.  **TC_POS_006:** Verify successful navigation to the Password Reset page by clicking "Forgot Password".

### Negative Scenarios:
7.  **TC_NEG_001:** Verify login fails with an unregistered email and valid password format.
8.  **TC_NEG_002:** Verify login fails with a registered email but an incorrect password.
9.  **TC_NEG_003:** Verify validation error triggers when submitting the form with both fields completely empty.
10. **TC_NEG_004:** Verify validation error triggers when entering an invalid email format (e.g., `user@.com` or `user123`).
11. **TC_NEG_005:** Verify trailing or leading whitespaces in the password field trigger an authentication failure (assuming system trims strictly or counts as literal).
12. **TC_NEG_006:** Verify rate-limiting/account lockout is enforced after N consecutive failed login attempts (Brute Force protection).

### Edge & UX Scenarios:
13. **TC_EDG_001:** Verify the password entry is masked by default (`●●●●●●`).
14. **TC_EDG_002:** Verify pressing the "Enter" key submits the login form successfully without clicking the submit button.
15. **TC_EDG_003:** Verify the application limits the maximum character length for email and password fields.
16. **TC_EDG_004:** Verify that using browser 'Back' button after logout does not allow access to the dashboard.

---

## 12. Risks and Mitigation
| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Authentication/Security Vulnerability** | High | Conduct strict penetration testing against SQL injection and enforce HTTPS. |
| **SSO / 3rd-Party Integration Failure** | High | Develop specific integration tests checking APIs/Tokens; maintain a fallback mock SSO environment. |
| **High Login Traffic Latency** | Medium | Execute load/stress testing using JMeter prior to major releases. |
| **Automation Flakiness** | Medium | Use robust explicit waits, avoid hard-coded locators, and implement a retry mechanism in TestNG. |
| **Browser Rendering Issues** | Low | Perform layout testing across top browser versions using real devices or a cloud grid (BrowserStack). |

---

## 13. Assumptions and Dependencies
*   **Assumptions:**
    *   The QA environment is fully stable and mirrors production server configurations.
    *   Test data (e.g., registered test users) will not be modified or deleted by parallel teams during execution.
    *   The "Forgot Password" functionality relies on a working external email service (SMTP) available in the QA environment.
*   **Dependencies:**
    *   Dependencies on third-party authenticators (Microsoft/Google SSO) must be operational.
    *   Availability of the mock analytics/dashboard endpoint to verify successful post-login redirection.

---

## 14. Entry Criteria
*   The VWO Login Dashboard application code is successfully deployed to the QA/Staging environment.
*   The PRD and design mockups are approved and finalized.
*   Test environment is fully configured (HTTPS enabled, APIs accessible).
*   Test data (valid/invalid credentials, MFA accounts) is generated and staged.
*   Automation framework repository is set up with access to the target environment.

---

## 15. Exit Criteria
*   100% execution of all identified critical Path and High Priority test scenarios.
*   A minimum aggregate pass rate of 95% is achieved.
*   0 Critical or High severity defects remain open regarding authentication flows or security.
*   All automated regression tests are integrated into the CI/CD pipeline and execute successfully without environmental failures.
*   Test execution reports and defect tracking logs are shared with project stakeholders.
