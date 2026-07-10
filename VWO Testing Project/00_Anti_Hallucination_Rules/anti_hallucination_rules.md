# Anti-Hallucination Rules
## VWO Testing Project | RICE POT Framework

**Version:** 1.0  
**Date:** 2026-03-15  
**Project:** VWO Login Dashboard – QA Testing  
**Application URL:** https://app.vwo.com  

---

## Purpose
These rules prevent AI/LLM models from generating fabricated, assumed, or unverified content when assisting with test planning, test case generation, bug reporting, or analysis for this project. Every AI-generated artifact MUST comply with these rules before use.

---

## RULE 01 – No Invented Credentials
- **DO NOT** fabricate test account credentials (email/password) that have not been explicitly provided in `01_Input/test_data/`.
- **DO NOT** assume default credentials like `admin@vwo.com / admin123`.
- **ALWAYS** reference the approved test data file for any credential used in a test case.

## RULE 02 – No Assumed UI Locators
- **DO NOT** invent CSS selectors, XPath expressions, or element IDs for the VWO login page without verification.
- **ALWAYS** mark any automation locator as `[NEEDS VERIFICATION]` if not confirmed via browser inspection.
- **DO NOT** copy locators from older VWO tests without re-validating against the live page.

## RULE 03 – No Fabricated Feature Behavior
- **DO NOT** assert that VWO supports features (e.g., biometric login, OAuth with GitHub) if not confirmed by the PRD in `01_Input/requirements/`.
- **DO NOT** include test cases for out-of-scope modules (experimentation, personalize, billing) as defined in the test plan.
- **ALWAYS** cite the PRD section or source document when asserting expected behavior.

## RULE 04 – No Invented Defects
- **DO NOT** pre-populate bug reports with fabricated defect outcomes.
- **ALL** defects must originate from actual test execution observations.
- **ALWAYS** attach screenshot or recording evidence reference in the bug report.

## RULE 05 – No Unverified Environment Claims
- **DO NOT** claim a test "passed" or "failed" in the deliverables without actual execution.
- **ALWAYS** mark unexecuted test cases as `NOT EXECUTED` in the Status column.
- **DO NOT** reference environment URLs other than `https://app.vwo.com` unless explicitly configured.

## RULE 06 – Source Attribution Required
- **ALWAYS** cite the source of any test scenario or expected behavior (e.g., `Source: PRD_VWO_Login.md §3`, `Source: VWO_Login_Test_Plan.md TC_NEG_001`).
- **DO NOT** generate test scenarios that cannot be traced back to a documented requirement.

## RULE 07 – Scope Discipline
- In-scope modules for this project: **Login, Authentication, Password Reset, Session Management, UI/UX of the login page**.
- Out-of-scope: A/B Testing Engine, Personalize, Insights, Billing, Marketing Integrations.
- **DO NOT** generate test cases for out-of-scope modules under any circumstance.

## RULE 08 – Data Privacy
- **DO NOT** use real user PII (names, actual emails, real passwords) in test data or examples.
- **ALWAYS** use synthetic or anonymized test data.
- Approved format: `testuser_001@vwotest.com`

## RULE 09 – RICE POT Compliance
- Every prompt template used with an LLM **MUST** include all 7 RICE POT elements: Role, Instructions, Context, Examples, Persona, Output, Tone.
- Incomplete RICE POT prompts must be flagged and completed before use.

## RULE 10 – Version Control
- Every AI-generated artifact must be marked with `[AI-GENERATED – REQUIRES HUMAN REVIEW]` in the header until reviewed and approved by a human QA tester.
- After approval, replace with `[REVIEWED BY: <name> | DATE: <date>]`.

---

## Checklist Before Using Any AI Output

- [ ] Does the output cite a real source document?
- [ ] Are credentials from the approved test data file only?
- [ ] Are all UI locators marked `[NEEDS VERIFICATION]` or validated?
- [ ] Is the test case within the defined scope?
- [ ] Is the status `NOT EXECUTED` for unrun cases?
- [ ] Has the RICE POT prompt been fully applied?
- [ ] Is the content marked `[AI-GENERATED – REQUIRES HUMAN REVIEW]`?
