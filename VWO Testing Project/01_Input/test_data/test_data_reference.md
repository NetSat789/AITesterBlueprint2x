# Test Data Reference Guide
## VWO Testing Project | 01_Input/test_data

> [!IMPORTANT]
> All credentials listed here are PLACEHOLDERS only.
> Replace placeholder values with REAL test account credentials before execution.

---

## 1. Valid Test Accounts (Dashboard Redirect Expected)

| TestData_ID | Category | Email | Password | Expected Result |
|-------------|----------|-------|----------|----------------|
| TD-POS-001 | Valid User | `[VALID_EMAIL]` | `[VALID_PASSWORD]` | Redirects to Dashboard |

---

## 2. Invalid Test Accounts (No Redirect + Error Message Expected)

| TestData_ID | Category | Email | Password | Expected Result |
|-------------|----------|-------|----------|----------------|
| TD-NEG-001 | Invalid Password | `[VALID_EMAIL]` | `[INVALID_PASSWORD]` | Stays on login page + Shows Error |
| TD-NEG-002 | Unregistered Email | `[UNREGISTERED_EMAIL]` | `[VALID_PASSWORD]` | Stays on login page + Shows Error |
| TD-NEG-003 | Empty Fields | `(empty)` | `(empty)` | Stays on login page + Shows Error |
| TD-NEG-004 | Malformed Email | `[MALFORMED_EMAIL]` | `[VALID_PASSWORD]` | Stays on login page + Shows Error |
