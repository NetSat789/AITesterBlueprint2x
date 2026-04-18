# VWO Application Context
## Context Brain – VWO Testing Project

**Version:** 1.0  
**Date:** 2026-03-15  
**Source:** app.vwo.com, PRD_VWO_Login.md  

---

## Application Overview

| Field | Details |
|-------|---------|
| **Product Name** | VWO (Visual Website Optimizer) |
| **Application URL** | https://app.vwo.com |
| **Product Type** | SaaS – A/B Testing & Experimentation Platform |
| **Vendor** | Wingify Software Pvt. Ltd. |
| **Current Scope** | Login Dashboard (Authentication Layer) |

---

## Login Page Anatomy (Known Elements)

| UI Element | Description | Expected Behavior |
|-----------|-------------|------------------|
| Email Input Field | Primary identifier field | Autofocused on page load; real-time format validation |
| Password Input Field | Credential field | Masked by default (`type="password"`); toggle visibility |
| Login / Sign In Button | Form submission CTA | Submits credentials; shows loader during auth |
| Forgot Password Link | Password recovery trigger | Navigates to reset flow |
| Remember Me Checkbox | Session persistence | Retains session across browser restarts |
| SSO / Enterprise Login | Third-party auth | Routes to org's SSO provider |
| Error Message Area | Validation/auth errors | Displays inline error on failure |
| Google/Social Login | OAuth social login | [NEEDS VERIFICATION – confirm if available] |

---

## Authentication Flows

### Flow 1 – Standard Email/Password Login
1. User navigates to `https://app.vwo.com`
2. Page loads with email field autofocused
3. User enters registered email → password
4. Clicks "Sign In" → Loading indicator appears
5. On success → redirect to VWO Dashboard
6. On failure → inline error message displayed

### Flow 2 – Forgot Password
1. User clicks "Forgot Password"
2. Redirected to password recovery page
3. Enters registered email → submits
4. System sends reset email with secure token link
5. User sets new password meeting complexity rules

### Flow 3 – Enterprise SSO
1. User enters corporate email
2. System detects SSO domain → routes to IdP
3. User authenticates via org's identity provider
4. Redirected back to VWO Dashboard on success

### Flow 4 – Remember Me
1. User checks "Remember Me" before login
2. Successful login creates persistent session token
3. On browser restart → user remains authenticated without re-login

---

## Known Validation Rules

| Rule | Details |
|------|---------|
| Email Format | Must match RFC 5322 pattern; real-time blur validation |
| Password Masking | `type="password"` attribute enforced by default |
| Empty Field Submission | Triggers validation error message without API call |
| Brute Force Protection | Account lockout after N consecutive failures (N = [NEEDS VERIFICATION]) |
| HTTPS | All traffic over TLS; HTTP redirected to HTTPS |
| Rate Limiting | Login endpoint has rate limiting [NEEDS VERIFICATION – check response headers] |

---

## Test Environment

| Property | Value |
|----------|-------|
| **Target Environment** | Production (https://app.vwo.com) / QA Staging if available |
| **OS** | Windows 11, macOS (latest), Android, iOS |
| **Browsers** | Chrome (Primary), Firefox, Edge, Safari |
| **Automation Stack** | Java 17+, Selenium WebDriver 4+, TestNG, Maven |
| **Manual Testing** | Exploratory via Chrome DevTools + browser |

---

## Out-of-Scope Modules (DO NOT TEST)

- A/B Testing & Experimentation engine
- Personalize module
- Insights & Analytics dashboards
- Billing & subscription management
- Marketing integrations

---

## Key Dependencies

| Dependency | Impact if Unavailable |
|-----------|----------------------|
| External SMTP server | Forgot Password email delivery fails → cannot test reset flow |
| SSO Identity Provider (Microsoft/Google) | SSO login scenarios cannot be tested |
| VWO Dashboard (post-login redirect) | Cannot verify successful login redirection |
| Test accounts (valid/invalid) | All auth test cases blocked |
