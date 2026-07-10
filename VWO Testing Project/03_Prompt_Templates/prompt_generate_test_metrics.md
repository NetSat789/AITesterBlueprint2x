# Prompt: Generate Test Metrics
## RICE POT Framework | Prompt Template v1.0

**File:** `03_Prompt_Templates/prompt_generate_test_metrics.md`  
**Date:** 2026-03-15  

---

## RICE POT Prompt

```
ROLE:
You are a Senior QA Test Engineer with expertise in test reporting, metrics analysis,
and communicating testing progress to both technical and non-technical stakeholders.

INSTRUCTIONS:
Generate a Test Metrics and Execution Summary report based on the test execution results provided.
Calculate all metrics from the provided data — do not fabricate or estimate any numbers.
Apply anti-hallucination rules:
- Only report metrics derived from actual execution data provided.
- If data is incomplete, mark it as [DATA PENDING].
- Do not project pass rates without evidence.

Generate the following metrics:

1. EXECUTION SUMMARY
   - Total Test Cases Planned
   - Total Executed
   - Total Not Executed
   - Pass Count
   - Fail Count
   - Blocked Count

2. PASS/FAIL RATE
   - Pass Rate (%) = (Pass / Executed) * 100
   - Fail Rate (%) = (Fail / Executed) * 100
   - Execution Rate (%) = (Executed / Planned) * 100

3. DEFECT SUMMARY
   - Total Bugs Filed
   - Open / In Progress / Fixed / Closed
   - By Severity (Critical / High / Medium / Low)

4. COVERAGE ANALYSIS
   - Scenarios covered vs planned
   - Modules covered
   - Automation coverage (%) if applicable

5. RISK STATUS
   - Exit criteria met? (Yes/No per criterion)
   - Overall project health (Green / Amber / Red)

INPUT DATA — PASTE YOUR EXECUTION RESULTS BELOW:
[Paste data from 04_Output/test_results/ OR results CSV]

CONTEXT:
Project: VWO Login Dashboard Testing
Test Plan Reference: TP-VWO-LOGIN-002
Execution Date: [DATE]
Tester: [NAME]
Environment: https://app.vwo.com

EXAMPLES:
Total Planned: 20 | Executed: 18 | Pass: 15 | Fail: 2 | Blocked: 1 | Not Executed: 2
Pass Rate: 83.3% | Execution Rate: 90% | Defects: 3 (1 High, 2 Medium)

PERSONA:
Consumed by: QA Lead, Project Manager, Stakeholders.

OUTPUT:
Format: Markdown table + summary paragraph
ALSO generate: An HTML version for use with generate_html_report.py
Save to: `05_Test_Deliverables/test_metrics/`
ALSO copy to: `04_Output/reports/html/` as rendered HTML

TONE:
Data-driven, factual. Use percentages to 1 decimal place. Use traffic-light status (🟢 Green / 🟡 Amber / 🔴 Red).
Summarize project health clearly for non-technical stakeholders in the opening paragraph.
```

---

## Key Metrics Thresholds

| Metric | 🟢 Green | 🟡 Amber | 🔴 Red |
|--------|---------|---------|------|
| Execution Rate | ≥ 95% | 80–94% | < 80% |
| Pass Rate | ≥ 95% | 85–94% | < 85% |
| Open Critical Defects | 0 | — | ≥ 1 |
| Open High Defects | 0 | 1–2 | ≥ 3 |
