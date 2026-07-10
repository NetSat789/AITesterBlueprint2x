# Prompt: Generate Test Cases
## RICE POT Framework | Prompt Template v1.0

**File:** `03_Prompt_Templates/prompt_generate_test_cases.md`  
**Date:** 2026-03-15  

---

## RICE POT Prompt

```
ROLE:
You are a Senior QA Test Engineer with deep expertise in writing step-by-step test cases
for web authentication systems. You follow strict test case documentation standards.

INSTRUCTIONS:
Generate detailed, step-by-step test cases for each of the test scenarios provided.
For each test case include all required fields below.
Apply anti-hallucination rules:
- Use only test data from test_data.csv (reference by TestData_ID, do not paste actual credentials).
- Mark all UI locators as [NEEDS VERIFICATION].
- Status must be set to NOT EXECUTED for all new test cases.
- Do not invent expected behavior; cite PRD section.

Required fields per test case:
1. Test Case ID (format: TC-XXX-NNN)
2. Test Scenario ID (reference)
3. Module
4. Test Case Title
5. Priority (Critical / High / Medium / Low)
6. Type (Positive / Negative / Edge / Security)
7. Preconditions
8. Test Data Reference (TestData_ID from test_data.csv)
9. Test Steps (numbered, step-by-step)
10. Expected Result (per step where applicable)
11. Actual Result (leave as: "NOT EXECUTED")
12. Status (NOT EXECUTED / PASS / FAIL / BLOCKED)
13. Notes / Evidence (screenshot reference placeholder)
14. Source (PRD section reference)

CONTEXT:
Application: VWO at https://app.vwo.com
Generate test cases for the following scenarios: [PASTE SCENARIO TABLE HERE]
reference: PRD_VWO_Login.md, vwo_app_context.md, test_data_reference.md

EXAMPLES:
TC-POS-001: Successful Login
- Preconditions: Browser open, user not logged in, valid account exists (TD-POS-001)
- Steps:
  1. Navigate to https://app.vwo.com
  2. Observe page load — email field should be autofocused
  3. Enter email: [TestData: TD-POS-001]
  4. Enter password: [TestData: TD-POS-001]
  5. Click "Sign In" button
  6. Observe loading indicator
  7. Observe post-login page
- Expected: User is redirected to VWO Dashboard. URL changes from /login to /dashboard (or similar).
- Status: NOT EXECUTED
- Source: PRD §2.1, AC-001

PERSONA:
Consumed by: Manual QA testers (execution), Automation engineer (scripting), QA Lead (review).

OUTPUT:
Format: Markdown table + detailed numbered steps below table  
OR: Excel row format (one row per test case, steps in Steps column, newline-separated)
Save to: `05_Test_Deliverables/test_cases/`
Header: [AI-GENERATED – REQUIRES HUMAN REVIEW]

TONE:
Precise, unambiguous. Each step must begin with an action verb (Navigate, Enter, Click, Observe, Verify).
Expected results must be specific — not "page loads" but "VWO Dashboard page title appears".
```

---

## Test Case ID Convention

| Prefix | Type | Example |
|--------|------|---------|
| TC-POS | Positive | TC-POS-001 |
| TC-NEG | Negative | TC-NEG-001 |
| TC-EDG | Edge / UX | TC-EDG-001 |
| TC-SEC | Security | TC-SEC-001 |
| TC-ACC | Accessibility | TC-ACC-001 |

---

## Usage Instructions

1. First generate test scenarios using `prompt_generate_test_scenarios.md`.
2. Paste the scenario table into the CONTEXT section above.
3. Run in LLM → review output.
4. Save to `05_Test_Deliverables/test_cases/`.
