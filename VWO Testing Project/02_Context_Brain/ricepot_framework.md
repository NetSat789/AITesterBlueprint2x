# RICE POT Framework
## Applied to VWO Testing Project

**Version:** 1.0  
**Date:** 2026-03-15  

---

## What is RICE POT?

RICE POT is a structured prompt engineering framework designed to produce consistent, high-quality, and hallucination-resistant outputs from AI/LLM models in QA workflows.

| Letter | Element | Description |
|--------|---------|-------------|
| **R** | **Role** | Define WHO the AI is acting as |
| **I** | **Instructions** | Specify WHAT the AI must do |
| **C** | **Context** | Provide BACKGROUND information |
| **E** | **Examples** | Show SAMPLE input/output |
| **P** | **Persona** | Define the AUDIENCE or user |
| **O** | **Output** | Specify the EXACT format required |
| **T** | **Tone** | Define the STYLE of writing |

---

## Application to This Project

### R – Role
> "You are a Senior QA Test Engineer with 10+ years of experience in web application testing, specializing in authentication systems and SaaS platforms."

### I – Instructions
> "Generate [test plan / test cases / bug report / test scenarios / metrics] based on the provided PRD and scope document. Follow IEEE 829 standards. Apply RICE POT anti-hallucination rules. Do not invent data."

### C – Context
> "The application under test is VWO (Visual Website Optimizer) at https://app.vwo.com — a SaaS experimentation platform. The current scope is the Login Dashboard only: email/password auth, forgot password, SSO, session management, and UI/UX validation."

### E – Examples
> Refer to: `07_Templates/` for actual examples of test plans, test cases, bug reports, and metrics in the expected format.

### P – Persona
> "The output will be consumed by QA testers (manual + automation), development team members for defect resolution, and project managers for status tracking."

### O – Output
> Specify per artifact:
> - **Test Plan** → Markdown (.md), 15-section IEEE format
> - **Test Scenarios** → Markdown table (.md)
> - **Test Cases** → Markdown table (.md) or Excel (.xlsx)
> - **Bug Report** → Markdown (.md) or HTML
> - **Test Metrics** → Markdown table + HTML report
> - **Full Reports** → HTML (primary), Excel (.xlsx), Word (.docx)

### T – Tone
> "Formal, precise, evidence-based. Use active voice. Be specific with field values. Avoid ambiguous language like 'might' or 'could'. Use 'shall', 'must', 'will' for requirements-level assertions."

---

## RICE POT Prompt Template (Reusable)

```
ROLE: You are a [role].
INSTRUCTIONS: [What to do, step by step].
CONTEXT: [Background about the app, feature, or scenario].
EXAMPLES: [Reference to example or paste inline sample].
PERSONA: [Who will use this output?].
OUTPUT: [Exact format: markdown table / 15-section doc / bug report schema].
TONE: [Formal / technical / concise / evidence-based].
```

---

## Anti-Hallucination Integration

Always combine RICE POT with the rules in `/00_Anti_Hallucination_Rules/anti_hallucination_rules.md`.

The **I (Instructions)** element should always include:
> "Apply all 10 anti-hallucination rules. Do not invent credentials, locators, features, or defects. Mark all unverified assumptions with [NEEDS VERIFICATION]."
