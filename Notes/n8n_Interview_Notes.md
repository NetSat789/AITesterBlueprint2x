# 📘 n8n — Interview Preparation Notes

> **Role:** AI Tester / Software QA Engineer  
> **Last Updated:** April 2026

---

## 📌 Table of Contents

1. [What is n8n?](#what-is-n8n)
2. [Why n8n Matters for AI Testers](#why-n8n-matters-for-ai-testers)
3. [Core Concepts](#core-concepts)
4. [Architecture Overview](#architecture-overview)
5. [Key Features](#key-features)
6. [n8n for QA / Testing — Use Cases](#n8n-for-qa--testing--use-cases)
7. [Important Nodes Every AI Tester Should Know](#important-nodes-every-ai-tester-should-know)
8. [Workflow Design Best Practices](#workflow-design-best-practices)
9. [Error Handling in n8n](#error-handling-in-n8n)
10. [n8n + AI Integration](#n8n--ai-integration)
11. [Interview Questions & Answers](#interview-questions--answers)
12. [Quick Revision Cheat Sheet](#quick-revision-cheat-sheet)

---

## What is n8n?

**n8n** (pronounced "nodemation") is an **open-source, low-code workflow automation platform** that connects different applications, services, and APIs through a visual drag-and-drop interface.

### Key Identity Points

| Attribute | Detail |
|---|---|
| **Type** | Workflow Automation / Integration Platform |
| **License** | Fair-code (source-available), free to self-host |
| **Language** | Built with TypeScript/Node.js |
| **Hosting** | Self-hosted (Docker, npm) or n8n Cloud |
| **Integrations** | 1,000+ pre-built nodes for SaaS/APIs |
| **Official Site** | [n8n.io](https://n8n.io) |

### n8n is NOT a test execution framework
> ⚠️ **Critical Interview Point:** n8n does not replace Selenium, Playwright, or Cypress. It acts as the **orchestration layer** — the "glue" that connects test frameworks, CI/CD pipelines, AI services, and reporting tools.

---

## Why n8n Matters for AI Testers

As an AI Tester, n8n enables you to:

1. **Automate the testing lifecycle** — trigger tests, collect results, generate reports automatically
2. **Integrate AI into QA workflows** — send test logs to LLMs for intelligent analysis
3. **Connect fragmented tools** — bridge Jira, Slack, test frameworks, and dashboards
4. **Build self-healing pipelines** — create workflows that detect, classify, and route failures
5. **Reduce manual effort** — automate repetitive QA tasks like data setup, environment checks, result aggregation

---

## Core Concepts

### 1. Workflows
A **workflow** is a collection of connected nodes that execute in a defined order.

- Think of it as a **directed graph** where data flows from one step to the next
- Each workflow has exactly **one trigger** (entry point)
- Workflows can be **active** (running in production) or **inactive** (paused)

### 2. Nodes
Nodes are the **fundamental building blocks** of any workflow.

| Node Type | Purpose | Example |
|---|---|---|
| **Trigger Nodes** ⚡ | Start a workflow based on an event | Webhook, Schedule, Email Trigger |
| **Action Nodes** | Perform tasks or operations | Send Slack message, Create Jira ticket |
| **Core Nodes** | Data manipulation & flow control | IF, Switch, Set, Merge, Loop Over Items |

### 3. Triggers
Triggers define **when** a workflow should run:

- **Event-based:** Responds to external events (new Jira issue, GitHub push)
- **Schedule-based (Cron):** Runs at predefined intervals (every hour, daily at 9 AM)
- **Webhook-based:** Listens for HTTP requests from external systems
- **Manual:** Triggered by clicking "Execute" in the n8n UI (for testing)

### 4. Connections
- Lines drawn between nodes define the **data flow**
- Output of one node becomes the input of the next
- Data passes as **JSON objects** between nodes

### 5. Credentials
- Securely stored authentication tokens, API keys, OAuth credentials
- **Encrypted** before storage in the n8n database
- **Reusable** across multiple nodes and workflows

### 6. Executions
- Every time a workflow runs, it creates an **execution record**
- Stores input/output of every node — essential for **debugging**
- Execution history can be reviewed in the n8n UI

---

## Architecture Overview

```
┌────────────────────────────────────────────────┐
│                   n8n Platform                  │
├─────────┬──────────────┬───────────────────────┤
│ Editor  │  Execution   │  Credential Manager   │
│  (UI)   │   Engine     │  (Encrypted Store)    │
├─────────┴──────────────┴───────────────────────┤
│              Workflow Engine                     │
│  ┌─────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Trigger │→ │ Process  │→ │ Action/Output │  │
│  │  Node   │  │  Nodes   │  │    Nodes      │  │
│  └─────────┘  └──────────┘  └───────────────┘  │
├────────────────────────────────────────────────┤
│          Database (SQLite / PostgreSQL)          │
└────────────────────────────────────────────────┘
          ↕               ↕               ↕
    External APIs    Webhooks       CI/CD Pipelines
```

### Deployment Options

| Method | Best For |
|---|---|
| **Docker** | Most common; easy to set up & maintain |
| **npm** | Direct install on Node.js environments |
| **n8n Cloud** | Managed hosting, no infra management |
| **Kubernetes** | Enterprise-scale deployments |

---

## Key Features

| Feature | Description |
|---|---|
| **Visual Workflow Editor** | Drag-and-drop canvas for building automations |
| **1,000+ Integrations** | Pre-built connectors for popular services |
| **Custom Code Nodes** | Inject JavaScript or Python for custom logic |
| **Error Handling** | Built-in retry, error triggers, and fallback paths |
| **Execution History** | Full audit trail with node-level input/output |
| **Sub-workflows** | Modular design — call workflows from other workflows |
| **Webhook Support** | Expose HTTP endpoints to receive external data |
| **Credential Management** | Encrypted, reusable credential store |
| **Version Control** | Built-in workflow versioning + Git integration |
| **Queue Mode** | Worker-based execution for high-volume processing |
| **AI Nodes** | Native nodes for OpenAI, Anthropic, Ollama, etc. |

---

## n8n for QA / Testing — Use Cases

### Use Case 1: Automated Test Orchestration

```
Schedule Trigger → Run Playwright Tests (HTTP Request to CI) → 
Parse Results → IF Failed → Create Jira Bug → Notify Slack
```

**What it does:** Triggers test suites on schedule, parses results, auto-creates bug tickets for failures.

### Use Case 2: AI-Powered Log Analysis

```
Webhook (receives test logs) → Send to OpenAI/Claude → 
Classify failure (flaky vs regression vs environment) → 
Route to appropriate team channel
```

**What it does:** Uses LLMs to intelligently classify test failures beyond simple pass/fail.

### Use Case 3: Test Data Management

```
Schedule Trigger → Query Database → Generate Test Data → 
Seed Test Environment → Trigger Test Suite → Cleanup
```

**What it does:** Automates the entire test data lifecycle.

### Use Case 4: Cross-Platform Test Reporting

```
Webhook (test results) → Transform Data → 
Update Google Sheets Dashboard + Send Slack Summary + 
Update Jira Test Execution
```

**What it does:** Centralizes test results from multiple sources into unified dashboards.

### Use Case 5: AI Test Case Generation

```
Jira Webhook (new user story) → Extract Requirements → 
Send to LLM with prompt template → Generate Test Cases → 
Create Test Cases in Test Management Tool
```

**What it does:** Automatically generates test cases when new requirements are created.

### Use Case 6: Environment Health Monitoring

```
Schedule (every 30 min) → Check API Health Endpoints → 
IF Unhealthy → Alert QA Team → Pause Scheduled Tests
```

**What it does:** Proactively monitors test environments and prevents wasted test runs.

---

## Important Nodes Every AI Tester Should Know

### Trigger Nodes

| Node | Purpose in QA |
|---|---|
| **Webhook** | Receive CI/CD notifications, test results |
| **Schedule Trigger** | Run health checks, periodic test suites |
| **Email Trigger** | Monitor inbox for test failure alerts |

### Core/Logic Nodes

| Node | Purpose in QA |
|---|---|
| **IF** | Branch logic (pass/fail routing) |
| **Switch** | Multi-way branching (severity levels) |
| **Set** | Transform/restructure test data |
| **Merge** | Combine results from parallel test runs |
| **Loop Over Items** | Iterate through test cases or results |
| **Code** | Custom JavaScript/Python for complex parsing |
| **HTTP Request** | Call any REST API (test frameworks, tools) |

### Integration Nodes

| Node | Purpose in QA |
|---|---|
| **Jira** | Create bugs, update test execution status |
| **Slack / MS Teams** | Send alerts and notifications |
| **Google Sheets** | Log results, maintain test metrics |
| **GitHub / GitLab** | Trigger CI pipelines, read PR info |
| **MySQL / PostgreSQL** | Query test data, store results |

### AI Nodes

| Node | Purpose in QA |
|---|---|
| **OpenAI / ChatGPT** | Analyze logs, generate test cases |
| **Anthropic (Claude)** | Classify failures, suggest fixes |
| **Ollama** | Local LLM for sensitive data analysis |
| **AI Agent** | Build autonomous test analysis agents |

---

## Workflow Design Best Practices

### 1. Modularity
- Break complex workflows into **sub-workflows**
- Use the **"Execute Workflow"** node to call reusable modules
- Example: One workflow for "Parse Test Results" reused across multiple test suites

### 2. Error Handling
- Always add **Error Trigger** workflows for production workflows
- Use **"Continue on Fail"** for non-critical nodes
- Implement retry logic with configurable delays

### 3. Data Validation
- Validate API responses before processing
- Use **IF** nodes to check for null/empty data
- Add JSON schema checks for webhook payloads

### 4. Naming Conventions
- Use descriptive workflow names: `QA_Nightly_Regression_Pipeline`
- Name nodes clearly: `Parse_Playwright_Results` not `Code1`

### 5. Security
- **Never hardcode** API keys or passwords
- Use n8n's built-in **Credential Manager**
- Use environment variables for sensitive configuration

### 6. Logging & Monitoring
- Add logging nodes at critical points
- Monitor execution history for failures
- Set up alerts for workflow failures

---

## Error Handling in n8n

### Three Approaches

| Method | When to Use |
|---|---|
| **Continue on Fail** | Non-critical nodes; log error and proceed |
| **Retry on Fail** | Transient failures (API timeouts, rate limits) |
| **Error Trigger Workflow** | Critical failures; escalate to team |

### Error Trigger Workflow Pattern

```
Error Trigger → Extract Error Details → 
Format Error Message → Send to Slack + Create Incident Ticket
```

### Configuration

```json
{
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 5000,
  "continueOnFail": false
}
```

---

## n8n + AI Integration

### How AI Nodes Work in n8n

1. **AI Chat Nodes** — Send prompts to LLMs and receive responses
2. **AI Agent Nodes** — Build agents with tools that can autonomously perform tasks
3. **Memory Nodes** — Maintain conversation context across interactions
4. **Vector Store Nodes** — Connect to databases for RAG implementations

### Example: AI-Powered Failure Analysis

```
Webhook (test failure) → 
Format prompt: "Analyze this test failure log and classify as:
  - FLAKY: intermittent, timing-related
  - REGRESSION: new code broke existing functionality
  - ENVIRONMENT: infra/config issue
  - DATA: test data problem
  
  Log: {test_log}" →
Send to Claude/OpenAI → 
Parse AI Response → 
Switch (classification) → 
Route to appropriate Slack channel
```

### Key AI Concepts for Interview

| Concept | Relevance |
|---|---|
| **RAG (Retrieval-Augmented Generation)** | Ground AI responses in project-specific test documentation |
| **Prompt Engineering** | Craft effective prompts for failure classification |
| **Human-in-the-Loop** | AI suggests, human approves critical decisions |
| **Agentic Workflows** | AI agents that autonomously investigate failures |
| **Hallucination Prevention** | Validate AI outputs before acting on them |

---

## Interview Questions & Answers

### Basic Level

---

**Q1: What is n8n and how does it differ from Zapier/Make?**

> **A:** n8n is an open-source, fair-code workflow automation platform. Unlike Zapier/Make:
> - It can be **self-hosted** for full data control
> - Supports **custom code** (JavaScript/Python) for complex logic
> - Offers **unlimited workflow executions** (self-hosted)
> - Has **built-in AI nodes** for LLM integration
> - Provides **sub-workflows** for modular design

---

**Q2: Explain the difference between a Webhook trigger and a Schedule trigger.**

> **A:**
> - **Webhook Trigger:** Starts a workflow when it receives an HTTP request. Used for real-time, event-driven automation (e.g., CI/CD pipeline sends test results immediately after run).
> - **Schedule Trigger:** Starts a workflow at predefined times or intervals (e.g., run regression tests every night at 2 AM). Uses cron expressions for configuration.

---

**Q3: How does data flow between nodes in n8n?**

> **A:** Data flows as **JSON objects**. Each node receives an array of JSON items as input, processes them, and passes the output to the next connected node. You can access data from previous nodes using **expressions** like `{{ $json.fieldName }}` or `{{ $node["NodeName"].json.fieldName }}`.

---

### Intermediate Level

---

**Q4: How would you use n8n to automate a nightly regression testing pipeline?**

> **A:** I would design the workflow as:
> 1. **Schedule Trigger** — Set to run at 2 AM daily
> 2. **HTTP Request** — Hit the CI/CD API (Jenkins/GitHub Actions) to trigger the test suite
> 3. **Wait Node** — Poll for test completion
> 4. **HTTP Request** — Fetch test results
> 5. **Code Node** — Parse results, calculate metrics (pass rate, duration)
> 6. **IF Node** — Check if pass rate < threshold
> 7. **Jira Node** (if failed) — Create bug tickets for failures
> 8. **Slack Node** — Send summary report with metrics
> 9. **Google Sheets** — Log results for trend analysis

---

**Q5: Explain error handling strategies in n8n workflows.**

> **A:** n8n provides three strategies:
> 1. **Continue on Fail** — Node logs the error but workflow continues. Used for non-critical steps.
> 2. **Retry on Fail** — Automatically retries with configurable attempts and delay. Good for transient failures (API timeouts).
> 3. **Error Trigger Workflow** — A separate workflow that runs when any workflow fails. Used for alerting, incident creation, and cleanup.
>
> Best practice: Combine all three — retry for resilience, continue-on-fail for non-critical paths, and error triggers for escalation.

---

**Q6: How do you manage credentials securely in n8n?**

> **A:**
> - Use n8n's **Credential Manager** — all credentials are encrypted at rest
> - Never hardcode secrets in Code nodes
> - Use **environment variables** for deployment-specific configs
> - Restrict credential access using **role-based access control** (in n8n Cloud/Enterprise)
> - Audit credential usage through execution logs

---

### Advanced Level (AI Tester Focus)

---

**Q7: How would you integrate AI into a QA testing pipeline using n8n?**

> **A:** I would build a multi-stage AI pipeline:
> 1. **Test Result Collection** — Webhook receives test results from CI
> 2. **Data Preparation** — Code node formats logs into structured context
> 3. **AI Classification** — Send to OpenAI/Claude with a system prompt:
>    - Classify failures as flaky, regression, environment, or data issues
>    - Suggest probable root cause
>    - Recommend fix actions
> 4. **Confidence Filtering** — IF node checks if AI confidence > threshold
> 5. **Human-in-the-Loop** — For low-confidence classifications, route to human review via Slack interactive message
> 6. **Action** — Based on final classification, auto-create Jira ticket with appropriate priority and labels

---

**Q8: What is the difference between n8n as an orchestration layer vs. a test execution framework?**

> **A:** This is a critical distinction:
> - **Test execution framework** (Playwright, Selenium, Cypress) — Actually interacts with the application, runs assertions, captures screenshots
> - **n8n as orchestration layer** — Manages the **lifecycle** around tests:
>   - **Before:** Trigger tests, prepare data, check environments
>   - **During:** Monitor execution, handle timeouts
>   - **After:** Collect results, classify failures, create tickets, send alerts
>
> Think of it as: Playwright is the *driver*, n8n is the *dispatcher* that tells the driver when to drive, where to go, and what to report back.

---

**Q9: How would you design an n8n workflow for AI-based test case generation?**

> **A:**
> 1. **Jira Webhook** — Triggered when a new user story is created/updated
> 2. **Extract Requirements** — Pull acceptance criteria and description
> 3. **RAG Enrichment** — Query vector database for similar past test cases and project standards
> 4. **LLM Prompt** — Send structured prompt with requirements + context:
>    - "Generate test cases in Given-When-Then format"
>    - "Include positive, negative, and edge cases"
>    - "Follow our project's test naming conventions"
> 5. **Validation** — Parse AI output, check format compliance
> 6. **Human Review** — Send to Slack for QA lead approval
> 7. **Create** — Upon approval, create test cases in test management tool (Zephyr/TestRail)

---

**Q10: A workflow works during manual testing but fails in production. How do you debug it?**

> **A:** Systematic debugging approach:
> 1. **Check Execution History** — Review the failed execution's node-by-node input/output
> 2. **Compare Payloads** — Diff the manual test data vs. production data
> 3. **Verify Credentials** — Ensure production credentials are configured correctly
> 4. **Check Environment Variables** — Verify all env vars are set in production
> 5. **Inspect Timing** — Look for race conditions or timeout issues
> 6. **Review Trigger Configuration** — Confirm webhook URLs (test vs. production URLs are different)
> 7. **Check Rate Limits** — Production may hit API rate limits that don't occur during manual testing
> 8. **Logs** — Check n8n server logs for system-level errors

---

## Quick Revision Cheat Sheet

### One-Liners to Remember

| Topic | Key Point |
|---|---|
| **What is n8n** | Open-source workflow automation platform with 1,000+ integrations |
| **n8n vs test framework** | n8n orchestrates; Playwright/Selenium executes |
| **Nodes** | Building blocks — Trigger, Action, Core |
| **Data format** | JSON objects flow between nodes |
| **Triggers** | Webhook (real-time), Schedule (cron), Manual (testing) |
| **Credentials** | Encrypted, reusable, never hardcoded |
| **Error handling** | Continue on Fail, Retry, Error Trigger Workflow |
| **Sub-workflows** | Modular, reusable workflow components |
| **AI integration** | Native nodes for OpenAI, Claude, Ollama, etc. |
| **Deployment** | Docker (most common), npm, Cloud, K8s |
| **For AI Tester** | Orchestrate AI-powered test analysis, generation, and reporting |

### Common Expressions Syntax

```
{{ $json.fieldName }}                    // Current node's data
{{ $node["NodeName"].json.fieldName }}   // Specific node's data
{{ $execution.id }}                      // Current execution ID
{{ $now.toISO() }}                       // Current timestamp
{{ $env.MY_VARIABLE }}                   // Environment variable
```

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Execute workflow |
| `Ctrl + S` | Save workflow |
| `Tab` | Open node search |
| `Ctrl + D` | Deactivate node |
| `Ctrl + Shift + V` | Paste from clipboard |

---

> 💡 **Pro Tip for Interview:** Always frame your answers around how n8n **enhances the testing lifecycle** — don't just describe features, explain how they solve QA problems.

---

*📝 Prepared for AI Tester interview preparation — GrowWith Notes*
