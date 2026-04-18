// LLM Service — supports Ollama, GROQ, Grok

export async function testLLMConnection(llmConfig) {
  const provider = llmConfig.provider
  const config = llmConfig[provider]

  try {
    switch (provider) {
      case 'ollama':
        return await testOllama(config)
      case 'groq':
        return await testGroq(config)
      case 'grok':
        return await testGrok(config)
      default:
        return { success: false, error: 'Unknown provider' }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function testOllama(config) {
  const response = await fetch(`${config.baseUrl}/api/tags`)
  if (!response.ok) throw new Error('Cannot connect to Ollama')
  const data = await response.json()
  const models = data.models?.map(m => m.name) || []
  return { success: true, models, message: `Connected! ${models.length} models available.` }
}

async function testGroq(config) {
  const response = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': `Bearer ${config.apiKey}` },
  })
  if (!response.ok) throw new Error(`GROQ API error (${response.status})`)
  const data = await response.json()
  return { success: true, models: data.data?.map(m => m.id) || [], message: 'GROQ connected successfully!' }
}

async function testGrok(config) {
  const response = await fetch('https://api.x.ai/v1/models', {
    headers: { 'Authorization': `Bearer ${config.apiKey}` },
  })
  if (!response.ok) throw new Error(`Grok API error (${response.status})`)
  const data = await response.json()
  return { success: true, models: data.data?.map(m => m.id) || [], message: 'Grok connected successfully!' }
}

export async function generateTestPlan(llmConfig, issues, template, additionalContext) {
  const provider = llmConfig.provider
  const config = llmConfig[provider]

  const issuesSummary = issues.map(issue => 
    `- **${issue.id}**: ${issue.title} (Type: ${issue.type}, Priority: ${issue.priority})\n  Description: ${issue.description || 'No description'}`
  ).join('\n')

  const prompt = `You are an expert QA Test Architect. Generate a comprehensive test plan document based on the following user stories/requirements from Jira/ADO.

## Requirements / User Stories:
${issuesSummary}

## Additional Context:
${additionalContext || 'None provided'}

## Test Plan Template Structure (Follow this exact structure):

# Test Plan

## 1. Introduction
- Document purpose and scope overview

## 2. Scope
### 2.1 Features in Scope
(List all features to be tested based on the requirements above)

### 2.2 Features Out of Scope
(Identify what will NOT be tested and why)

## 3. Test Scenarios & Test Cases
For each requirement/user story, create detailed test scenarios:

### [Feature Name from Requirement]
| Test Case ID | Test Scenario | Test Steps | Expected Result | Priority | Type |
|---|---|---|---|---|---|
| TC_001 | ... | ... | ... | High/Medium/Low | Positive/Negative/Boundary |

Include these testing categories:
- Functional Testing (CRUD operations, business logic)
- Boundary Testing (min/max values, edge cases)
- Negative Testing (invalid inputs, error handling)
- Security Testing (SQL injection, XSS, authentication)
- Performance Testing considerations
- Integration Testing (API interactions, data flow)

## 4. Test Environment
| Environment | URL | Purpose |
|---|---|---|
| QA | ... | Testing |
| Pre-Prod | ... | Staging |

### Browser/Device Matrix:
- Windows 10 — Chrome, Firefox, Edge
- Mac OS — Safari
- Android — Chrome
- iOS — Safari

## 5. Test Strategy
### 5.1 Test Design Techniques
- Equivalence Class Partitioning
- Boundary Value Analysis
- Decision Table Testing
- State Transition Testing
- Use Case Testing
- Error Guessing
- Exploratory Testing

### 5.2 Testing Types
- Smoke Testing & Sanity Testing
- Regression Testing & Retesting
- Usability Testing, Functionality & UI Testing
- End to End Flow Testing

### 5.3 Testing Approach
Step-by-step approach for testing execution

## 6. Defect Reporting Procedure
- Defect identification criteria
- Reporting steps and template
- Triage and prioritization process
- Tools and tracking systems

## 7. Test Schedule
| Task | Estimated Duration |
|---|---|
| Test Case Design | ... |
| Smoke Testing | ... |
| Functional Testing | ... |
| Regression Testing | ... |
| UAT Support | ... |

## 8. Risks & Mitigation
| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| ... | ... | ... | ... |

## 9. Entry & Exit Criteria
### Entry Criteria:
- ...

### Exit Criteria:
- ...

## 10. Approvals
| Role | Name | Date |
|---|---|---|
| QA Lead | | |
| Project Manager | | |

---

IMPORTANT: 
- Generate SPECIFIC test cases based on the actual requirements provided, not generic ones
- Include at least 5-8 test cases per major feature
- Cover positive, negative, boundary, and edge cases
- Use professional QA language and formatting
- Output the entire document in Markdown format`

  switch (provider) {
    case 'ollama':
      return await generateWithOllama(config, prompt)
    case 'groq':
      return await generateWithGroq(config, prompt)
    case 'grok':
      return await generateWithGrok(config, prompt)
    default:
      throw new Error('Unknown LLM provider')
  }
}

async function generateWithOllama(config, prompt) {
  const response = await fetch(`${config.baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt: prompt,
      stream: false,
      options: { temperature: 0.3, num_predict: 8000 },
    }),
  })
  
  if (!response.ok) throw new Error('Ollama generation failed')
  const data = await response.json()
  return data.response
}

async function generateWithGroq(config, prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: 'You are an expert QA Test Architect who creates comprehensive, detailed test plans.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`GROQ generation failed: ${error}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}

async function generateWithGrok(config, prompt) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: 'You are an expert QA Test Architect who creates comprehensive, detailed test plans.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 8000,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Grok generation failed: ${error}`)
  }
  
  const data = await response.json()
  return data.choices[0].message.content
}
