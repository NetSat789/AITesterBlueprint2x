// Jira API Service
// Uses Vercel serverless proxy to avoid CORS

// Unicode-safe base64 encoding (btoa only supports Latin-1)
function safeBase64(str) {
  const bytes = new TextEncoder().encode(str)
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('')
  return btoa(binString)
}

// Proxy helper — routes through /api/proxy serverless function
async function proxyFetch(targetUrl, options = {}) {
  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      targetUrl,
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body ? JSON.parse(options.body) : undefined,
    }),
  })

  const result = await response.json()

  if (result.error) {
    throw new Error(result.error)
  }

  if (result.status >= 400) {
    const errorMsg = typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
    throw new Error(`(${result.status}): ${errorMsg}`)
  }

  return result.data
}

export async function testJiraConnection(url, email, apiToken) {
  try {
    const baseUrl = url.replace(/\/+$/, '')
    const data = await proxyFetch(`${baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': 'Basic ' + safeBase64(`${email}:${apiToken}`),
        'Accept': 'application/json',
      },
    })

    return { success: true, user: data.displayName, email: data.emailAddress }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function fetchJiraIssues(connection, projectKey, sprintVersion) {
  try {
    const baseUrl = connection.url.replace(/\/+$/, '')
    let jql = `project = "${projectKey}"`

    if (sprintVersion) {
      jql += ` AND (sprint = "${sprintVersion}" OR fixVersion = "${sprintVersion}")`
    }

    jql += ' ORDER BY created DESC'

    const data = await proxyFetch(
      `${baseUrl}/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}&maxResults=50&fields=summary,status,issuetype,priority,description,labels,assignee`,
      {
        headers: {
          'Authorization': 'Basic ' + safeBase64(`${connection.email}:${connection.apiToken}`),
          'Accept': 'application/json',
        },
      }
    )

    return data.issues.map(issue => ({
      id: issue.key,
      title: issue.fields.summary,
      type: issue.fields.issuetype?.name || 'Task',
      status: issue.fields.status?.name || 'Unknown',
      priority: issue.fields.priority?.name || 'Medium',
      description: extractDescription(issue.fields.description),
      labels: issue.fields.labels || [],
      assignee: issue.fields.assignee?.displayName || 'Unassigned',
    }))
  } catch (error) {
    throw new Error(`Jira fetch failed: ${error.message}`)
  }
}

export async function fetchJiraIssueById(connection, issueKey) {
  try {
    const baseUrl = connection.url.replace(/\/+$/, '')
    const issue = await proxyFetch(
      `${baseUrl}/rest/api/3/issue/${issueKey}?fields=summary,status,issuetype,priority,description,labels,assignee`,
      {
        headers: {
          'Authorization': 'Basic ' + safeBase64(`${connection.email}:${connection.apiToken}`),
          'Accept': 'application/json',
        },
      }
    )

    return {
      id: issue.key,
      title: issue.fields.summary,
      type: issue.fields.issuetype?.name || 'Task',
      status: issue.fields.status?.name || 'Unknown',
      priority: issue.fields.priority?.name || 'Medium',
      description: extractDescription(issue.fields.description),
      labels: issue.fields.labels || [],
      assignee: issue.fields.assignee?.displayName || 'Unassigned',
    }
  } catch (error) {
    throw new Error(`Jira fetch failed: ${error.message}`)
  }
}

// Jira API v3 returns description as Atlassian Document Format (ADF) JSON
function extractDescription(description) {
  if (!description) return ''
  if (typeof description === 'string') return description

  function extractText(node) {
    if (!node) return ''
    if (node.type === 'text') return node.text || ''
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join('')
    }
    return ''
  }

  if (description.content && Array.isArray(description.content)) {
    return description.content.map(block => extractText(block)).filter(Boolean).join('\n')
  }

  return JSON.stringify(description)
}
