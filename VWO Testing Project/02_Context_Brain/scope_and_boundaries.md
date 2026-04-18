# Scope and Boundaries
## VWO Testing Project | Context Brain

**Version:** 1.0  
**Date:** 2026-03-15  

---

## Application Under Test

- **Name:** VWO (Visual Website Optimizer)
- **URL:** https://app.vwo.com
- **Module in Scope:** Login Dashboard / Authentication Layer

---

## IN SCOPE ✅

| Module | Features |
|--------|----------|
| Authentication | Email/password login, 2FA, SSO, social login |
| Input Validation | Email format, password masking, empty field checks |
| Password Management | Forgot Password flow, password reset |
| Session Management | Remember Me, session timeout, logout security |
| UI/UX | Page load, autofocus, error messages, loading indicators |
| Security | HTTPS enforcement, brute force protection, injection resistance |
| Compatibility | Chrome, Firefox, Edge, Safari; Windows, macOS, mobile |
| Accessibility | ARIA labels, keyboard navigation, WCAG 2.1 AA compliance |

---

## OUT OF SCOPE ❌

| Module | Reason |
|--------|--------|
| A/B Testing Engine | Post-login feature – not part of login scope |
| Personalize Module | Separate product feature |
| Insights & Analytics | Post-login dashboards – out of scope |
| Billing & Subscription | Separate admin function |
| Marketing Integrations | Third-party marketing tools |
| VWO API (REST) | Requires separate API test project |
| Mobile App (if any) | Separate test project |

---

## Test Levels in Scope

| Level | Description |
|-------|-------------|
| Integration Testing | Login page ↔ Auth backend ↔ Dashboard redirect |
| System Testing | End-to-end login flows in full environment |
| UAT | Validating against acceptance criteria in PRD |

---

## Test Types in Scope

| Type | Coverage |
|------|----------|
| Functional | All auth workflows, validation rules |
| Security | HTTPS, injection, brute force, session |
| Usability | UX flows, error message clarity |
| Compatibility | Cross-browser, cross-OS, responsive |
| Regression (Automation) | Critical auth paths in CI/CD |

---

## Entry Criteria

- [ ] VWO Login page deployed and accessible at https://app.vwo.com
- [ ] PRD reviewed and finalized
- [ ] Test data (credentials) provisioned and confirmed
- [ ] Test environment configured (HTTPS, APIs accessible)
- [ ] Automation framework set up (if applicable)
- [ ] Test Plan approved by stakeholders

---

## Exit Criteria

- [ ] 100% of Critical and High priority test cases executed
- [ ] Minimum 95% pass rate achieved
- [ ] 0 open Critical or High severity defects related to auth/security
- [ ] All automation regression tests in CI/CD passing
- [ ] Test reports shared with stakeholders

---

## Key Risks

| Risk | Level | Mitigation |
|------|-------|-----------|
| No access to SSO IdP in QA | High | Use mock SSO environment |
| SMTP unavailable for Forgot Password | Medium | Coordinate with DevOps before execution |
| Test accounts modified by parallel teams | Medium | Lock/isolate QA test data |
| Automation flakiness | Medium | Explicit waits, retry logic, stable locators |
| VWO UI changes mid-sprint | Low | Update locators immediately |
