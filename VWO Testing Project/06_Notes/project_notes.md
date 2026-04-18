# Project Notes – VWO Testing Project
## 06_Notes | Running Log

**Project:** VWO Login Dashboard Testing  
**Feature:** https://app.vwo.com – Login Page  
**Framework:** RICE POT  
**Created:** 2026-03-15  

---

## Feature Behavior (Confirmed)

| Scenario | Behavior |
|----------|----------|
| ✅ Valid Credentials | Redirected to VWO Dashboard |
| ❌ Invalid Credentials | Stays on login page; error message displayed |

---

## Key Decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-15 | Used RICE POT framework for all prompt templates | Structured, anti-hallucination compliant |
| 2026-03-15 | 18 total test cases across 4 types | Matches TP-VWO-LOGIN-002 scope |
| 2026-03-15 | Deliverable formats: DOCX, XLSX, HTML | Covers required clean output formats |
| 2026-03-15 | All locators marked `[NEEDS VERIFICATION]` | Anti-hallucination Rule 02 compliance |
| 2026-03-15 | Test data in CSV format | Enables data-driven automation |

---

## Open Questions / To-Do

- [ ] Confirm exact error message text shown by VWO on invalid login (update PRD §5)
- [ ] Verify brute force lockout threshold (N value) – update TC-NEG-006
- [ ] Confirm if Google Social Login exists on https://app.vwo.com
- [ ] Confirm SSO domain for enterprise test account (TD-POS-003)
- [ ] Provision real test credentials before execution (replace `[SET BEFORE RUN]` in test_data.csv)
- [ ] Confirm SMTP availability in QA environment for Forgot Password testing
- [ ] Verify exact UI element locators for automation (mark as confirmed after browser inspection)

---

## Useful References

| Reference | Path |
|-----------|------|
| Anti-Hallucination Rules | `00_Anti_Hallucination_Rules/anti_hallucination_rules.md` |
| RICE POT Framework Guide | `02_Context_Brain/ricepot_framework.md` |
| VWO App Context | `02_Context_Brain/vwo_app_context.md` |
| PRD | `01_Input/requirements/PRD_VWO_Login.md` |
| Test Data CSV | `01_Input/test_data/test_data.csv` |
| Test Plan | `04_Output/VWO_Test_Plan.docx` |
| Test Cases | `04_Output/VWO_Test_Cases.xlsx` |

---

## Notes Log

### 2026-03-15
- Project structure created following RICE POT framework.
- All 22 folders and 30+ files created.
- Feature confirmed: valid login → dashboard; invalid → error message.
- All test cases marked `NOT EXECUTED` pending credential provisioning.
