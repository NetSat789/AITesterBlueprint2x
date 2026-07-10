# PRD – VWO Login Dashboard
## Derived from User Requirements

**Application:** VWO Login Dashboard
**URL:** https://app.vwo.com

---

### Core Business Requirement

**Feature Scope:** The login page of the app.vwo.com exclusively.

The application must enforce the following strict behavioral flow:
1. **Valid Login Workflow:** When a user enters valid login credentials, the application MUST successfully authenticate the user and redirect them to the VWO Dashboard.
2. **Invalid Login Workflow:** When a user enters invalid login credentials, the application MUST NOT redirect the user to the Dashboard. The application MUST display an error message to the user on the login page.

---

### Scope Exclusions (Explicitly Out of Bounds)
The following features are NOT part of the core requirement and must NOT be assumed or tested:
- Single Sign-On (SSO) Integrations
- Two-Factor Authentication (2FA) / MFA implementations
- "Remember Me" session persistence
- Account lockout policies (Brute-force limits)
- Password reset email workflows

Testing is strictly bounded to validating the binary logic of Valid Credential success vs Invalid Credential failure.
