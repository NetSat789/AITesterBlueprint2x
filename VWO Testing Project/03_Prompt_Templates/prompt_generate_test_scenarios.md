# Prompt: Generate Test Scenarios
## RICE POT Framework | Prompt Template v1.0

**File:** `03_Prompt_Templates/prompt_generate_test_scenarios.md`  
**Date:** 2026-03-15  

---

## RICE POT Prompt

```
ROLE:
You are a Senior QA Test Engineer specializing in scenario-based testing for SaaS web applications.
You follow risk-based testing principles and cover positive, negative, and edge case scenarios comprehensively.

INSTRUCTIONS:
Generate a complete set of test scenarios for the VWO Login Dashboard.
Organize scenarios into three groups: Positive, Negative, Edge/UX.
For each scenario provide: ScenarioID, Module, Priority (Critical/High/Medium/Low),
Type (Positive/Negative/Edge/Security/UX), Description, Expected Result.
Apply anti-hallucination rules — only include features confirmed in the PRD.
Mark any assumption with [NEEDS VERIFICATION].

CONTEXT:
Application: VWO at https://app.vwo.com
Module: Login Dashboard only.
Confirmed features in scope:
- Email/password authentication
- 2FA verification
- Enterprise SSO
- Forgot Password flow
- Remember Me session
- Password masking
- Input validation (email format, empty fields)
- Brute force protection
- HTTPS enforcement
- Keyboard navigation / accessibility
Reference: PRD_VWO_Login.md §2, scope_and_boundaries.md

EXAMPLES:
Positive Scenario Example:
| SC-POS-001 | Authentication | Critical | Positive | Verify successful login with valid email and password | User is redirected to VWO Dashboard |

Negative Scenario Example:
| SC-NEG-001 | Authentication | Critical | Negative | Verify login fails with unregistered email | Error message: "Invalid email or password" displayed |

PERSONA:
Output consumed by: Manual QA testers (for test case writing) and QA Lead (for coverage review).

OUTPUT:
Format: Markdown table with columns: ScenarioID | Module | Priority | Type | Description | Expected Result
Minimum scenarios: 6 Positive, 6 Negative, 4 Edge/Security/UX
Save to: `05_Test_Deliverables/test_scenarios/`
Header: [AI-GENERATED – REQUIRES HUMAN REVIEW]

TONE:
Concise but complete. Use "Verify that..." to start each Description. Present tense for Expected Results.
```

---

## Quick Reference – Scenario Categories

| Category | Minimum Count | Focus |
|----------|---------------|-------|
| Positive | 6 | Happy path flows |
| Negative | 6 | Invalid inputs, wrong credentials, locked users |
| Edge/UX | 4+ | Boundary values, keyboard nav, security payloads |
| Security | 2+ | Injection, brute force, HTTPS |

---

## Usage Instructions

1. Copy the prompt block above.
2. Paste relevant sections of `PRD_VWO_Login.md` into context.
3. Run in LLM → review output vs. anti-hallucination checklist.
4. Save to `05_Test_Deliverables/test_scenarios/`.
