# Test Plan  
**Jira Ticket:** VWO-25 – Product Requirements Document: VWO Login Dashboard  
**Prepared By:** Senior QA Architect  
**Date:** 2026‑03‑28  

---  

## 1. Objectives  

| # | Objective |
|---|-----------|
| 1.1 | Verify that the login dashboard authenticates users securely according to the functional and security requirements. |
| 1.2 | Validate all UI elements, responsive behavior, and branding compliance across supported devices and browsers. |
| 1.3 | Ensure real‑time input validation, password‑strength feedback, and error handling work as specified. |
| 1.4 | Confirm accessibility conformance to WCAG 2.1 AA (ARIA, keyboard navigation, high‑contrast mode). |
| 1.5 | Validate optional features: **Remember Me**, **2‑FA**, **SSO**, **Social Login**, and theme switching (Light/Dark). |
| 1.6 | Assess non‑functional requirements: performance (≤ 2 s page load), scalability (thousands of concurrent logins), and compliance (GDPR, OWASP). |
| 1.7 | Verify integration points: analytics tracking, support ticket linkage, and post‑login redirection to the VWO core platform. |
| 1.8 | Provide a baseline for regression testing in future releases. |

---

## 2. Scope  

| In‑Scope | Out‑of‑Scope |
|----------|--------------|
| • All login‑page UI components (fields, buttons, banners, theme toggle).<br>• Authentication flows: standard login, password‑reset, 2‑FA, SSO, social login.<br>• Client‑side validation, password‑strength meter, “Remember Me”.<br>• Accessibility features (ARIA, keyboard, high‑contrast).<br>• Performance & load testing of the login endpoint.<br>• Security checks: encryption, rate‑limiting, session handling, OWASP‑top‑10. | • Backend user‑management APIs beyond the login endpoint.<br>• Post‑login dashboard functionality (outside of redirection).<br>• Email delivery reliability for password‑reset (tested by separate email service team).<br>• Third‑party SSO provider implementation details (tested only for successful hand‑off). |

---

## 3. Test Strategy  

| Test Type | Purpose | Tools / Frameworks | Frequency |
|-----------|---------|--------------------|-----------|
| **Functional UI** | Validate field behavior, navigation, branding, theme support. | Cypress / Selenium WebDriver, Visual Regression (Applitools). | Every build (CI). |
| **API / Service** | Verify authentication API responses, token generation, rate‑limiting. | Postman/Newman, REST‑Assured, JMeter (for load). | Every build (smoke) + scheduled performance runs. |
| **Accessibility** | Confirm WCAG 2.1 AA compliance. | axe‑core (Cypress‑axe), Wave, manual keyboard testing. | Every sprint. |
| **Security** | Test encryption, OWASP‑Top‑10, session fixation, CSRF, brute‑force protection. | OWASP ZAP, Burp Suite, custom scripts for token replay. | Pre‑release (security sprint). |
| **Performance / Load** | Measure page load time ≤ 2 s, sustain 5 k concurrent logins. | JMeter, Locust, Chrome Lighthouse. | Nightly on staging. |
| **Cross‑Browser / Device** | Verify responsiveness and functionality on supported browsers/devices. | BrowserStack / Sauce Labs, responsive design mode. | Every sprint. |
| **Regression** | Ensure existing functionality remains intact after changes. | Cypress test suite executed in CI pipeline. | Every PR merge. |
| **Usability / UX** | Subjective validation of error messages, loading states, focus handling. | Heuristic walkthrough, user‑testing sessions (5‑7 participants). | Early in Phase 2. |
| **Integration** | Confirm analytics events fire, support ticket link works, post‑login redirect. | Google Analytics Debugger, mock support API, network sniffing. | Every build. |

### Test Data Management  

* **User Types:**  
  * Standard user (email/password).  
  * User with 2‑FA enabled.  
  * Enterprise SSO user (SAML mock).  
  * Social login user (Google, Microsoft).  
* **Password Variants:**  
  * Valid strong password.  
  * Weak password (fails policy).  
  * Expired password.  
* **Locale & Theme:**  
  * English (LTR) & Arabic (RTL) for accessibility checks.  
  * Light & Dark mode toggles.  

### Defect Management  

* Defects logged in **Jira** with severity mapping (Blocker → Critical → Major → Minor).  
* Security findings routed to **Security Tracker** with CVSS rating.  

---

## 4. Entry / Exit Criteria  

### Entry Criteria  

| Condition | Requirement |
|-----------|-------------|
| PRD approved | Signed‑off by Product Owner (VWO‑25). |
| UI mock‑ups & style guide | Available in Figma and approved. |
| Test environment | Staging URL `https://staging.app.vwo.com` with TLS 1.2+, test DB populated with user fixtures. |
| Test data | All required user accounts created (see section 3). |
| Automation framework | Build pipeline integrated, smoke suite passes. |
| Test tools | Licenses for BrowserStack, ZAP, JMeter active. |
| Test team | QA resources assigned (2 functional, 1 security, 1 performance). |

### Exit Criteria  

| Condition | Requirement |
|-----------|-------------|
| Test execution | ≥ 95 % of test cases executed. |
| Pass rate | ≥ 98 % of **Critical** & **High** priority tests passed. |
| Defect status | All **Blocker** defects resolved and retested; **Critical** defects ≤ 2 and approved for release. |
| Performance | 95 th percentile page load ≤ 2 s; concurrent login test meets 5 k users with < 5 % error rate. |
| Security | No high‑severity OWASP findings; rate‑limiting verified. |
| Accessibility | Axe score ≥ 90 % across all pages; manual WCAG AA checklist passed. |
| Documentation | Test results, logs, and coverage reports uploaded to Confluence. |
| Sign‑off | QA Lead signs off; Product Owner accepts. |

---

## 5. Test Cases  

> **Notation:**  
> *Pre‑condition* – state required before test execution.  
> *Steps* – numbered actions.  
> *Expected Result* – what must be observed.  
> *Priority* – **P1** (Critical), **P2** (High), **P3** (Medium), **P4** (Low).  

| ID | Title | Type | Pre‑condition | Steps | Expected Result | Priority |
|----|-------|------|---------------|-------|-----------------|----------|
| TC‑001 | Verify page loads within 2 s on desktop Chrome 117 | Performance | Staging URL reachable | 1. Open Chrome, navigate to login page.<br>2. Capture Navigation Timing. | `loadEventEnd - navigationStart ≤ 2000 ms`. | P1 |
| TC‑002 | Validate UI branding and theme toggle (Light/Dark) | Functional UI | None | 1. Load page in Light mode.<br>2. Verify VWO logo, colors, font.<br>3. Click “Dark Mode” toggle.<br>4. Verify color palette switches, logo remains. | Visual match to design spec; no layout shift > 0.2 em. | P2 |
| TC‑003 | Email field real‑time validation (invalid format) | Functional UI | None | 1. Focus email field.<br>2. Enter `invalid-email` and blur. | Inline error “Please enter a valid email address” appears; field highlighted red. | P1 |
| TC‑004 | Password strength indicator reacts to input | Functional UI | None | 1. Focus password field.<br>2. Type `abc` → observe indicator (weak).<br>3. Continue typing `Abc123!@#` → indicator updates to strong. | Indicator updates correctly with corresponding color/label. | P2 |
| TC‑005 | Successful login with correct credentials | Functional UI / API | Standard user `user1@example.com` / `StrongPass!1` exists, 2‑FA disabled. | 1. Enter valid email & password.<br>2. Click **Login**.<br>3. Observe loading spinner → dashboard redirects. | Dashboard loads, session cookie (`vwo_auth`) set, analytics `login_success` event fired. | P1 |
| TC‑006 | Failed login displays clear error (wrong password) | Functional UI | Standard user exists. | 1. Enter valid email, wrong password.<br>2. Click **Login**. | Error banner: “Incorrect email or password.” No generic server error. | P1 |
| TC‑007 | “Remember Me” persists session across browser restarts | Functional UI | User with valid credentials. | 1. Check “Remember Me”.<br>2. Log in successfully.<br>3. Close browser, reopen, navigate to login page. | User is auto‑authenticated; no login prompt shown. Session timeout respects configured period. | P2 |
| TC‑008 | Forgot‑Password flow – token generation & reset | Functional UI / API | User `user1@example.com` exists, email service mock enabled. | 1. Click **Forgot Password**.<br>2. Enter email, submit.<br>3. Capture reset email (mock inbox).<br>4. Click reset link, set new password meeting policy.<br>5. Log in with new password. | Reset email received with valid token, password updated, login succeeds. | P1 |
| TC‑009 | 2‑FA challenge when enabled | Functional UI / API | User with 2‑FA enabled; OTP generator (TOTP) secret known. | 1. Log in with email/password.<br>2. Prompt for OTP appears.<br>3. Enter current TOTP code.<br>4. Submit. | Successful authentication, dashboard displayed. Invalid OTP shows appropriate error. | P1 |
| TC‑010 | Enterprise SSO – successful SAML hand‑off | Integration | SSO test IdP configured, user mapped to VWO account. | 1. Click **Enterprise SSO** button.<br>2. Complete IdP login.<br>3. Redirect back to VWO. | User lands on dashboard with active session; SSO audit log recorded. | P2 |
| TC‑011 | Social Login – Google OAuth flow | Integration | Google test client ID configured. | 1. Click **Login with Google**.<br>2. Authenticate with Google test account.<br>3. Consent and return to VWO. | Dashboard loads; new VWO account linked or existing user recognized. | P2 |
| TC‑012 | Accessibility – keyboard navigation through form | Accessibility | None | 1. Tab to email field – focus present.<br>2. Press **Enter** – move to password field.<br>3. Tab to **Remember Me**, toggle with spacebar.<br>4. Tab to **Login** button, activate with Enter. | All controls reachable, ARIA labels read by screen readers, focus outline visible. | P1 |
| TC‑013 | Accessibility – screen‑reader announces error messages | Accessibility | Trigger error (TC‑006). | 1. Enable screen‑reader (NVDA/JAWS).<br>2. Perform failed login.<br>3. Listen for error announcement. | Error message is read out with appropriate ARIA role (`alert`). | P1 |
| TC‑014 | High‑contrast mode – UI remains usable | Accessibility | Enable OS high‑contrast, or use provided toggle. | 1. Activate high‑contrast mode.<br>2. Verify all text/buttons maintain sufficient contrast (> 4.5:1). | No loss of readability; focus order unchanged. | P2 |
| TC‑015 | Rate limiting – block after 5 failed attempts within 1 min | Security | Valid email, wrong password. | 1. Perform 5 consecutive failed logins.<br>2. Attempt 6th login. | Response: HTTP 429 “Too many attempts – try again later”. Account not locked permanently. | P1 |
| TC‑016 | Session token security – HttpOnly & Secure flags | Security | Successful login (TC‑005). | 1. Inspect session cookie attributes. | Cookie has `Secure`, `HttpOnly`, `SameSite=Strict` flags; token length ≥ 256 bits.